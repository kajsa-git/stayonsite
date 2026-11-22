// Automatisk sammanslagning av uthyrare som uppenbart är samma person.
//
// Kajsa ska inte behöva godkänna något: bara säkra fall slås ihop, allt loggas i
// den kvarvarande uthyrarens anteckning (inklusive den borttagna postens
// uppgifter), och hon rättar i efterhand om något blivit fel.
//
// Säkert = samma telefonnummer och samma e-post eller samma namn, samma e-post
// och samma namn, eller en namnlös webbpost ("Husägare · nummer") med samma
// nummer som en namngiven uthyrare. Delat nummer med olika namn slås aldrig ihop.
import { asc, eq, inArray, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import { isProvisionalWebOwner } from "./provisional-owner";
import { indexOwner, removeFromIndex } from "./search-index";
import * as schema from "./schema";
import {
  agreementAcceptances, agreementReminders, emails, inboxMessages, landlordDialogs, landlordSmsDialogs,
  outboxMessages, ownerOutreach, owners, properties, shareLinks, type Owner,
} from "./schema";

type DB = LibSQLDatabase<typeof schema>;

const normName = (value: string | null) => (value ?? "").normalize("NFKC").trim().toLocaleLowerCase("sv").replace(/\s+/g, " ");
const normEmail = (value: string | null) => (value ?? "").trim().toLowerCase();

export function isSameOwner(a: Owner, b: Owner): boolean {
  const samePhone = !!a.phone && a.phone === b.phone;
  const sameEmail = !!normEmail(a.email) && normEmail(a.email) === normEmail(b.email);
  const sameName = !!normName(a.name) && normName(a.name) === normName(b.name);
  if (samePhone && (sameEmail || sameName)) return true;
  if (sameEmail && sameName) return true;
  if (samePhone && (isProvisionalWebOwner(a) || isProvisionalWebOwner(b))) return true;
  return false;
}

/** Grupper av uthyrare som är samma person (minst två i varje grupp). */
export function groupDuplicates(list: Owner[]): Owner[][] {
  const parent = new Map(list.map((o) => [o.id, o.id]));
  const find = (id: string): string => (parent.get(id) === id ? id : find(parent.get(id)!));
  // Jämför bara poster som delar telefon eller e-post (snabbt även med många uthyrare).
  const buckets = new Map<string, Owner[]>();
  for (const owner of list) {
    for (const key of [owner.phone ? `p:${owner.phone}` : null, normEmail(owner.email) ? `e:${normEmail(owner.email)}` : null]) {
      if (key) buckets.set(key, [...(buckets.get(key) ?? []), owner]);
    }
  }
  for (const bucket of buckets.values()) {
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        if (isSameOwner(bucket[i], bucket[j])) parent.set(find(bucket[i].id), find(bucket[j].id));
      }
    }
  }
  const groups = new Map<string, Owner[]>();
  for (const owner of list) groups.set(find(owner.id), [...(groups.get(find(owner.id)) ?? []), owner]);
  return [...groups.values()].filter((group) => group.length > 1);
}

function describe(owner: Owner) {
  return [owner.name, owner.phone, owner.email, owner.orgNr ? `org.nr ${owner.orgNr}` : null].filter(Boolean).join(", ");
}

/** Slår ihop dubbletterna in i den uthyrare som har flest bostäder (vid lika: den äldsta). */
export async function mergeOwnerGroup(group: Owner[], opts: { db?: DB; now?: Date } = {}) {
  const db = opts.db ?? defaultDb;
  const counts = await db.select({ ownerId: properties.ownerId, n: sql<number>`count(*)` }).from(properties)
    .where(inArray(properties.ownerId, group.map((o) => o.id))).groupBy(properties.ownerId);
  const count = (id: string) => Number(counts.find((c) => c.ownerId === id)?.n ?? 0);
  const [primary, ...duplicates] = [...group].sort((a, b) =>
    count(b.id) - count(a.id) || (a.createdAt ?? "").localeCompare(b.createdAt ?? "") || a.id.localeCompare(b.id));
  const ids = duplicates.map((o) => o.id);
  const date = (opts.now ?? new Date()).toISOString().slice(0, 10);

  await db.transaction(async (tx) => {
    // Allt som pekar på dubbletterna flyttas till den kvarvarande uthyraren.
    await tx.update(properties).set({ ownerId: primary.id }).where(inArray(properties.ownerId, ids));
    await tx.update(ownerOutreach).set({ ownerId: primary.id }).where(inArray(ownerOutreach.ownerId, ids));
    await tx.update(outboxMessages).set({ ownerId: primary.id }).where(inArray(outboxMessages.ownerId, ids));
    await tx.update(emails).set({ ownerId: primary.id }).where(inArray(emails.ownerId, ids));
    await tx.update(landlordDialogs).set({ ownerId: primary.id }).where(inArray(landlordDialogs.ownerId, ids));
    await tx.update(landlordSmsDialogs).set({ ownerId: primary.id }).where(inArray(landlordSmsDialogs.ownerId, ids));
    await tx.update(inboxMessages).set({ ownerId: primary.id }).where(inArray(inboxMessages.ownerId, ids));
    await tx.update(shareLinks).set({ ownerId: primary.id }).where(inArray(shareLinks.ownerId, ids));
    await tx.update(agreementAcceptances).set({ ownerId: primary.id }).where(inArray(agreementAcceptances.ownerId, ids));
    await tx.update(agreementReminders).set({ ownerId: primary.id }).where(inArray(agreementReminders.ownerId, ids));

    // Tomma kontaktfält fylls från dubbletterna; befintliga värden skrivs aldrig över.
    const pick = <K extends keyof Owner>(key: K) => primary[key] ?? duplicates.find((o) => o[key] != null)?.[key] ?? null;
    const log = [
      `Sammanslagen ${date} (automatiskt, samma person): ${duplicates.map((o) => `${describe(o)} [${o.id}]`).join("; ")}.`,
      ...duplicates.filter((o) => o.notes?.trim()).map((o) => `Anteckning från ${o.name}:\n${o.notes!.trim()}`),
    ].join("\n\n");
    await tx.update(owners).set({
      name: isProvisionalWebOwner(primary) ? duplicates.find((o) => !isProvisionalWebOwner(o))?.name ?? primary.name : primary.name,
      phone: pick("phone"), email: pick("email"), orgNr: pick("orgNr"), contactPerson: pick("contactPerson"),
      followUpDate: pick("followUpDate"), followUpReason: pick("followUpReason"),
      notes: primary.notes?.trim() ? `${primary.notes.trim()}\n\n${log}` : log,
      updatedAt: new Date().toISOString(),
    }).where(eq(owners.id, primary.id));
    await tx.delete(owners).where(inArray(owners.id, ids));
  });

  // Sökindexet är bara en hjälp; ett fel här får inte göra sammanslagningen ogjord.
  try {
    for (const id of ids) await removeFromIndex("owner", id);
    await indexOwner(primary.id);
  } catch {
    console.error("Owner dedupe: search index update failed", { primaryId: primary.id });
  }

  return { primaryId: primary.id, mergedIds: ids };
}

/** Hittar alla säkra dubbletter; slår ihop dem bara när apply är true. */
export async function runOwnerDedupe(opts: { apply: boolean; db?: DB }) {
  const db = opts.db ?? defaultDb;
  const list = await db.select().from(owners).orderBy(asc(owners.createdAt));
  const groups = groupDuplicates(list);
  const merged: { primaryId: string; mergedIds: string[] }[] = [];
  if (opts.apply) {
    for (const group of groups) merged.push(await mergeOwnerGroup(group, { db }));
  }
  return { groups: groups.map((group) => group.map((o) => ({ id: o.id, name: o.name, phone: o.phone, email: o.email }))), merged };
}
