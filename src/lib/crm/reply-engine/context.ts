// Samlar allt motorn behöver veta om en kontakt: vem de är, var de står i
// affären och vad som sagts senast i alla kanaler. Interna hyresnivåer,
// marginaler och adresser skickas aldrig till modellen – då kan de inte heller
// hamna i ett svar.
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db as defaultDb } from "../db";
import {
  companies,
  contacts,
  emails,
  inboxMessages,
  matches,
  notes,
  outboxMessages,
  ownerOutreach,
  owners,
  properties,
  propertyNotes,
  requests,
} from "../schema";
import type { DB } from "./store";

export interface Party {
  ownerId: string | null;
  contactId: string | null;
  companyId: string | null;
}

export interface ConversationLine {
  at: string;
  channel: "sms" | "whatsapp" | "email";
  from: "kontakt" | "Kajsa";
  text: string;
}

export interface PartyContext {
  party: Party;
  partyType: "owner" | "company" | "both" | "unknown";
  name: string | null;
  phone: string | null;
  email: string | null;
  languages: string[];
  text: string;
  conversation: ConversationLine[];
  /** Det som hände efter "until" (bara vid test mot historiken). */
  later: ConversationLine[];
}

const clip = (s: string | null | undefined, n: number) => {
  const t = (s ?? "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

// Citerade tidigare mejl ("Den mån … skrev", "On … wrote", "From:") tas bort.
export function stripQuoted(body: string): string {
  const markers = [/\n\s*>/, /\nOn .{5,120}wrote:/i, /\nDen .{5,120}skrev/i, /\n-{2,}\s*Original/i, /\nFrån:\s/i, /\nFrom:\s/i, /\n_{8,}/];
  let cut = body.length;
  for (const m of markers) {
    const idx = body.search(m);
    if (idx > 0 && idx < cut) cut = idx;
  }
  return body.slice(0, cut).trim();
}

function line(label: string, value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return `${label}: ${value}`;
}

export async function buildPartyContext(party: Party, opts: { db?: DB; channelHint?: "sms" | "whatsapp" | "email"; until?: string } = {}): Promise<PartyContext> {
  const db = opts.db ?? defaultDb;
  const sections: string[] = [];
  let name: string | null = null;
  let phone: string | null = null;
  let email: string | null = null;
  let languages: string[] = [];

  // ── Företag / kontakt ──
  let companyId = party.companyId;
  if (party.contactId) {
    const [c] = await db.select().from(contacts).where(eq(contacts.id, party.contactId));
    if (c) {
      companyId = companyId ?? c.companyId;
      name = c.name ?? name;
      phone = c.phone ?? phone;
      email = c.email ?? email;
    }
  }
  if (companyId) {
    const [co] = await db.select().from(companies).where(eq(companies.id, companyId));
    if (co) {
      languages = co.languages ?? [];
      const cs = await db.select().from(contacts).where(eq(contacts.companyId, co.id));
      if (!email) email = cs.find((c) => c.isPrimary)?.email ?? cs[0]?.email ?? null;
      if (!phone) phone = cs.find((c) => c.isPrimary)?.phone ?? cs[0]?.phone ?? null;
      if (!name) name = cs.find((c) => c.isPrimary)?.name ?? null;
      sections.push([
        "## Kund (företag)",
        line("Företag", co.name),
        line("Kontaktperson", name),
        line("Språk", languages.join(", ") || null),
        line("Källa", co.leadSource),
        line("Intern skattning 0–10", co.rating),
        line("Återkomst inbokad", co.followUpDate ? `${co.followUpDate}${co.followUpReason ? ` – ${co.followUpReason}` : ""}` : null),
      ].filter(Boolean).join("\n"));

      const reqs = await db.select().from(requests).where(eq(requests.companyId, co.id)).orderBy(desc(requests.createdAt)).limit(6);
      if (reqs.length) {
        const reqMatches = await db.select({
          requestId: matches.requestId, status: matches.status, sentAt: matches.sentAt,
          publicName: properties.publicName, city: properties.city, bedrooms: properties.bedrooms, beds: properties.beds,
        }).from(matches).innerJoin(properties, eq(matches.propertyId, properties.id))
          .where(inArray(matches.requestId, reqs.map((r) => r.id)));
        sections.push(["## Förfrågningar (nyast först)", ...reqs.map((r) => {
          const m = reqMatches.filter((x) => x.requestId === r.id);
          return [
            `- #${r.requestNumber ?? "?"} status ${r.status}${r.statusChangedAt ? ` (sedan ${r.statusChangedAt.slice(0, 10)})` : ""}`,
            `  ort ${r.city ?? "?"}, ${r.persons ?? "?"} personer, sovrum ${r.bedroomsFrom ?? "?"}–${r.bedroomsTo ?? "?"}, period ${r.startDate ?? "?"} → ${r.endDateOngoing ? "tills vidare" : r.endDate ?? "?"}`,
            r.budgetMax ? `  kundens budget max ${r.budgetMax} kr/mån` : null,
            r.lostReason ? `  förlorad: ${r.lostReason}` : null,
            m.length ? `  förslag: ${m.map((x) => `${x.publicName ?? x.city ?? "objekt"} (${x.status}${x.sentAt ? `, skickat ${x.sentAt.slice(0, 10)}` : ""})`).join("; ")}` : null,
            r.moveInDoneAt ? `  inflyttad ${r.moveInDoneAt.slice(0, 10)}` : null,
            r.moveOutDoneAt ? `  utflyttad ${r.moveOutDoneAt.slice(0, 10)}` : null,
          ].filter(Boolean).join("\n");
        })].join("\n"));
      }

      const ns = await db.select().from(notes).where(eq(notes.companyId, co.id)).orderBy(desc(notes.createdAt)).limit(5);
      if (ns.length) sections.push(["## Senaste anteckningar", ...ns.map((n) => `- ${n.createdAt?.slice(0, 10)} (${n.channel}): ${clip(n.content, 300)}`)].join("\n"));
    }
  }

  // ── Uthyrare ──
  if (party.ownerId) {
    const [o] = await db.select().from(owners).where(eq(owners.id, party.ownerId));
    if (o) {
      if (!name) name = o.contactPerson || o.name;
      phone = phone ?? o.phone;
      email = email ?? o.email;
      sections.push([
        "## Uthyrare",
        line("Namn", o.name),
        line("Kontaktperson", o.contactPerson),
        line("Typ", o.ownerType),
        line("Intern skattning 0–10", o.rating),
        line("Återkomst inbokad", o.followUpDate ? `${o.followUpDate}${o.followUpReason ? ` – ${o.followUpReason}` : ""}` : null),
        line("Anteckning", clip(o.notes, 400)),
      ].filter(Boolean).join("\n"));

      const props = await db.select({
        id: properties.id, publicName: properties.publicName, city: properties.city, status: properties.status,
        published: properties.published, publishConsentAt: properties.publishConsentAt, bedrooms: properties.bedrooms,
        beds: properties.beds, moveInFrom: properties.moveInFrom, availableTo: properties.availableTo,
        contentReviewStatus: properties.contentReviewStatus, slug: properties.slug,
      }).from(properties).where(eq(properties.ownerId, o.id));
      if (props.length) {
        const outreach = await db.select().from(ownerOutreach).where(eq(ownerOutreach.ownerId, o.id)).orderBy(desc(ownerOutreach.startedAt)).limit(6);
        const propMatches = await db.select({ propertyId: matches.propertyId, status: matches.status, promisedAt: matches.promisedAt })
          .from(matches).where(inArray(matches.propertyId, props.map((p) => p.id)));
        const pnotes = await db.select().from(propertyNotes).where(inArray(propertyNotes.propertyId, props.map((p) => p.id)))
          .orderBy(desc(propertyNotes.createdAt)).limit(5);
        sections.push(["## Uthyrarens bostäder", ...props.map((p) => [
          `- ${p.publicName ?? p.city ?? "bostad"} i ${p.city ?? "?"}: status ${p.status}, ${p.bedrooms ?? "?"} sovrum/${p.beds ?? "?"} bäddar`,
          `  hemsida: ${p.published ? "publicerad" : "inte publicerad"}${p.publishConsentAt ? ", medgivande finns" : ", medgivande saknas"}, granskning ${p.contentReviewStatus ?? "?"}`,
          p.moveInFrom || p.availableTo ? `  tillgänglig ${p.moveInFrom ?? "?"} → ${p.availableTo ?? "?"}` : null,
          p.published && p.slug ? `  länk: https://www.stayonsite.se/boenden/${p.slug}` : null,
          propMatches.filter((m) => m.propertyId === p.id).map((m) => `  i förslag: ${m.status}${m.promisedAt ? " (villkor lovade till uthyraren)" : ""}`).join("\n") || null,
        ].filter(Boolean).join("\n")),
        outreach.length ? `Kontaktrundor: ${outreach.map((r) => `${r.status}${r.nextFollowUpDate ? ` (nästa ${r.nextFollowUpDate})` : ""}`).join("; ")}` : null,
        pnotes.length ? `Senaste objektanteckningar:\n${pnotes.map((n) => `- ${n.createdAt?.slice(0, 10)}: ${clip(n.content, 250)}`).join("\n")}` : null,
        ].filter(Boolean).join("\n"));
      }
    }
  }

  // ── Samtalet i alla kanaler ──
  const conversation: ConversationLine[] = [];
  const phoneConds = [
    party.ownerId ? eq(inboxMessages.ownerId, party.ownerId) : null,
    party.contactId ? eq(inboxMessages.contactId, party.contactId) : null,
  ].filter(Boolean) as ReturnType<typeof eq>[];
  if (phoneConds.length) {
    const sms = await db.select().from(inboxMessages).where(or(...phoneConds)).orderBy(desc(inboxMessages.sentAt)).limit(25);
    for (const m of sms) {
      conversation.push({
        at: m.sentAt,
        channel: /whats/i.test(m.service ?? "") ? "whatsapp" : "sms",
        from: m.direction === "out" ? "Kajsa" : "kontakt",
        text: clip(m.body, 600),
      });
    }
    // Utkorgsrader som ännu inte syns i Messages-historiken (köade/nyss skickade).
    const outConds = [
      party.ownerId ? eq(outboxMessages.ownerId, party.ownerId) : null,
      party.contactId ? eq(outboxMessages.contactId, party.contactId) : null,
    ].filter(Boolean) as ReturnType<typeof eq>[];
    const out = await db.select().from(outboxMessages)
      .where(and(or(...outConds), inArray(outboxMessages.status, ["queued", "sending", "sent"])))
      .orderBy(desc(outboxMessages.createdAt)).limit(10);
    for (const m of out) {
      const at = m.sentAt ?? m.createdAt ?? "";
      const dup = conversation.some((c) => c.from === "Kajsa" && c.text.slice(0, 60) === clip(m.body, 600).slice(0, 60));
      if (!dup) conversation.push({ at, channel: "sms", from: "Kajsa", text: clip(m.body, 600) });
    }
  }
  const mailConds = [
    party.ownerId ? eq(emails.ownerId, party.ownerId) : null,
    party.contactId ? eq(emails.contactId, party.contactId) : null,
    companyId ? eq(emails.companyId, companyId) : null,
  ].filter(Boolean) as ReturnType<typeof eq>[];
  if (mailConds.length) {
    const mails = await db.select().from(emails).where(or(...mailConds)).orderBy(desc(emails.sentAt)).limit(12);
    for (const m of mails) {
      conversation.push({
        at: m.sentAt,
        channel: "email",
        from: m.direction === "out" ? "Kajsa" : "kontakt",
        text: `[${clip(m.subject, 120)}] ${clip(stripQuoted(m.body), 1200)}`,
      });
    }
  }
  conversation.sort((a, b) => normalizeTime(a.at).localeCompare(normalizeTime(b.at)));
  // "until": visa samtalet som det såg ut när meddelandet kom in (för test mot historiken).
  const cutoff = opts.until ? normalizeTime(opts.until) : null;
  const recent = (cutoff ? conversation.filter((l) => normalizeTime(l.at) <= cutoff) : conversation).slice(-30);

  const partyType = party.ownerId && companyId ? "both" : party.ownerId ? "owner" : companyId ? "company" : "unknown";
  return {
    party: { ...party, companyId: companyId ?? null },
    partyType,
    name,
    phone,
    email,
    languages,
    text: sections.join("\n\n"),
    conversation: recent,
    later: cutoff ? conversation.filter((l) => normalizeTime(l.at) > cutoff) : [],
  };
}

/** Jämförbar tidsstämpel oavsett om källan är ISO eller SQLite ("YYYY-MM-DD HH:MM:SS"). */
export function normalizeTime(at: string | null | undefined): string {
  if (!at) return "";
  const s = at.includes("T") ? at : at.replace(" ", "T") + (at.length === 19 ? "Z" : "");
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? at : d.toISOString();
}

export function formatConversation(lines: ConversationLine[]): string {
  if (!lines.length) return "(ingen tidigare konversation)";
  return lines.map((l) => {
    const t = normalizeTime(l.at);
    const when = t ? new Date(t).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "short", timeStyle: "short" }) : "?";
    return `[${when} · ${l.channel} · ${l.from}] ${l.text}`;
  }).join("\n");
}
