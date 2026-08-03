// Inkorgen: inkommande iMessage/SMS-svar som Mac-agenten läst in, berikade med
// namn på uthyrare/kontakt/företag + senaste skickade meddelandet per nummer
// ("vad svarar de på?"). Delas av /api/crm/inbox GET och MCP-verktyget crm_inbox.
import { and, desc, eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { companies, contacts, inboxMessages, outboxMessages, owners } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export type InboxItem = typeof inboxMessages.$inferSelect & {
  ownerName: string | null;
  contactName: string | null;
  companyName: string | null;
  repliedTo: { body: string; sentAt: string | null } | null;
};

export async function listInbox(opts?: {
  unreadOnly?: boolean;
  limit?: number;
  db?: DB;
}): Promise<InboxItem[]> {
  const db = opts?.db ?? defaultDb;
  const unreadOnly = opts?.unreadOnly ?? false;
  const limit = opts?.limit ?? (unreadOnly ? 200 : 100);

  const rows = unreadOnly
    ? await db
        .select()
        .from(inboxMessages)
        .where(and(eq(inboxMessages.isRead, false), eq(inboxMessages.direction, "in")))
        .orderBy(desc(inboxMessages.sentAt))
        .limit(limit)
    : await db.select().from(inboxMessages).orderBy(desc(inboxMessages.sentAt)).limit(limit);
  if (rows.length === 0) return [];

  const ownerIds = [...new Set(rows.map((r) => r.ownerId).filter((v): v is string => !!v))];
  const contactIds = [...new Set(rows.map((r) => r.contactId).filter((v): v is string => !!v))];
  const companyIds = [...new Set(rows.map((r) => r.companyId).filter((v): v is string => !!v))];

  const phones = [...new Set(rows.map((r) => r.fromPhone))];
  const [ownerRows, contactRows, companyRows, sentRows] = await Promise.all([
    ownerIds.length ? db.select({ id: owners.id, name: owners.name }).from(owners).where(inArray(owners.id, ownerIds)) : Promise.resolve([]),
    contactIds.length ? db.select({ id: contacts.id, name: contacts.name }).from(contacts).where(inArray(contacts.id, contactIds)) : Promise.resolve([]),
    companyIds.length ? db.select({ id: companies.id, name: companies.name }).from(companies).where(inArray(companies.id, companyIds)) : Promise.resolve([]),
    // Kontext: vad svarar de på? Senaste skickade utkorgs-meddelandet per nummer.
    db
      .select({ toPhone: outboxMessages.toPhone, body: outboxMessages.body, sentAt: outboxMessages.sentAt })
      .from(outboxMessages)
      .where(and(inArray(outboxMessages.toPhone, phones), eq(outboxMessages.status, "sent")))
      .orderBy(desc(outboxMessages.sentAt)),
  ]);
  const ownerName = new Map(ownerRows.map((r) => [r.id, r.name]));
  const contactName = new Map(contactRows.map((r) => [r.id, r.name]));
  const companyName = new Map(companyRows.map((r) => [r.id, r.name]));
  // Första träffen per nummer = senaste (sorterat fallande).
  const lastSent = new Map<string, { body: string; sentAt: string | null }>();
  for (const s of sentRows) if (!lastSent.has(s.toPhone)) lastSent.set(s.toPhone, { body: s.body, sentAt: s.sentAt });

  return rows.map((r) => ({
    ...r,
    ownerName: r.ownerId ? (ownerName.get(r.ownerId) ?? null) : null,
    contactName: r.contactId ? (contactName.get(r.contactId) ?? null) : null,
    companyName: r.companyId ? (companyName.get(r.companyId) ?? null) : null,
    repliedTo: lastSent.get(r.fromPhone) ?? null,
  }));
}
