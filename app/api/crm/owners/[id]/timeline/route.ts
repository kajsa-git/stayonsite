// Uthyrarens samlade tidslinje: SMS (in/ut), e-post, kontaktlogg per objekt och
// outreach-rundor — normaliserat och sorterat fallande. Läsvy för uthyrarsidan.
//
// SMS-dedupe: inkorgen är sanningskälla (chat.db-ingesten fångar BÅDA riktningarna
// sedan 2026-07-05, inkl. agentens egna utskick). Utkorgsrader tas därför bara med
// när de INTE är skickade (queued/sending/failed/draft) eller är äldre än
// ingest-horisonten — annars vore varje skickat SMS dubblerat.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { emails, inboxMessages, outboxMessages, ownerOutreach, owners, properties, propertyNotes } from "@/lib/crm/schema";
import { and, desc, eq, lt, ne, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Före detta datum fanns ingen chat.db-ingest — äldre skickade utkorgsrader är
// enda spåret av de utskicken och ska visas.
const INBOX_INGEST_START = "2026-07-05";
const MAX_ITEMS = 500;

export interface OwnerTimelineItem {
  id: string;
  kind: "sms" | "email" | "note" | "outreach";
  direction: "in" | "out" | null;
  at: string; // normaliserad ISO — sorteringsnyckel
  title: string | null;
  body: string;
  status: string | null;
  service: string | null;
  propertyId: string | null;
  propertyAddress: string | null;
  error: string | null;
}

// SQLite:s datetime('now') ger "YYYY-MM-DD HH:MM:SS" (UTC utan T/Z) medan
// inkorg/e-post lagrar ISO. Normalisera allt till ISO så sorteringen håller.
function toIso(ts: string | null | undefined): string {
  const s = (ts ?? "").trim();
  if (!s) return "1970-01-01T00:00:00.000Z";
  if (s.includes("T")) return s;
  return s.replace(" ", "T") + "Z";
}

const OUTREACH_LABEL: Record<string, string> = {
  ej_kontaktad: "Runda startad (ej kontaktad)",
  kontaktad: "Uthyrare kontaktad",
  i_dialog: "I dialog med uthyrare",
  bekraftad: "Uthyrare bekräftad",
  nej: "Uthyrare tackade nej",
};

const NOTE_CHANNEL_LABEL: Record<string, string> = {
  samtal: "Samtal",
  mejl: "Mejl",
  sms: "SMS",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  mote: "Möte",
  möte: "Möte",
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const [owner] = await db.select().from(owners).where(eq(owners.id, id));
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const phone = owner.phone?.trim() || null;

  const [smsRows, outboxRows, emailRows, noteRows, outreachRows] = await Promise.all([
    // Inkorg: ownerId-taggade + telefonmatchade (rader som matchats mot en kontakt
    // med samma nummer får ändå plats i uthyrarens tråd).
    db
      .select()
      .from(inboxMessages)
      .where(phone ? or(eq(inboxMessages.ownerId, id), eq(inboxMessages.fromPhone, phone)) : eq(inboxMessages.ownerId, id))
      .orderBy(desc(inboxMessages.sentAt))
      .limit(MAX_ITEMS),

    // Utkorg enligt dedupe-regeln ovan.
    db
      .select()
      .from(outboxMessages)
      .where(
        and(
          phone ? or(eq(outboxMessages.ownerId, id), eq(outboxMessages.toPhone, phone)) : eq(outboxMessages.ownerId, id),
          or(
            ne(outboxMessages.status, "sent"),
            lt(sql`coalesce(${outboxMessages.sentAt}, ${outboxMessages.createdAt})`, INBOX_INGEST_START),
          ),
        ),
      )
      .orderBy(desc(outboxMessages.createdAt))
      .limit(MAX_ITEMS),

    db.select().from(emails).where(eq(emails.ownerId, id)).orderBy(desc(emails.sentAt)).limit(MAX_ITEMS),

    db
      .select({
        id: propertyNotes.id,
        channel: propertyNotes.channel,
        content: propertyNotes.content,
        createdAt: propertyNotes.createdAt,
        propertyId: propertyNotes.propertyId,
        propertyAddress: properties.address,
      })
      .from(propertyNotes)
      .innerJoin(properties, eq(propertyNotes.propertyId, properties.id))
      .where(eq(properties.ownerId, id))
      .orderBy(desc(propertyNotes.createdAt))
      .limit(MAX_ITEMS),

    db
      .select({
        id: ownerOutreach.id,
        status: ownerOutreach.status,
        note: ownerOutreach.note,
        startedAt: ownerOutreach.startedAt,
        concludedAt: ownerOutreach.concludedAt,
        propertyId: ownerOutreach.propertyId,
        propertyAddress: properties.address,
      })
      .from(ownerOutreach)
      .leftJoin(properties, eq(ownerOutreach.propertyId, properties.id))
      .where(eq(ownerOutreach.ownerId, id))
      .orderBy(desc(ownerOutreach.startedAt))
      .limit(MAX_ITEMS),
  ]);

  const items: OwnerTimelineItem[] = [
    ...smsRows.map((m): OwnerTimelineItem => ({
      id: `sms:${m.id}`,
      kind: "sms",
      direction: m.direction === "out" ? "out" : "in",
      at: toIso(m.sentAt),
      title: null,
      body: m.body,
      status: null,
      service: m.service,
      propertyId: null,
      propertyAddress: null,
      error: null,
    })),
    ...outboxRows.map((m): OwnerTimelineItem => ({
      id: `sms-out:${m.id}`,
      kind: "sms",
      direction: "out",
      at: toIso(m.sentAt ?? m.createdAt),
      title: null,
      body: m.body,
      status: m.status,
      service: null,
      propertyId: null,
      propertyAddress: null,
      error: m.error,
    })),
    ...emailRows.map((e): OwnerTimelineItem => ({
      id: `email:${e.id}`,
      kind: "email",
      direction: e.direction === "in" ? "in" : "out",
      at: toIso(e.sentAt),
      title: e.subject,
      body: e.body.length > 300 ? e.body.slice(0, 300) + "…" : e.body,
      status: null,
      service: null,
      propertyId: null,
      propertyAddress: null,
      error: null,
    })),
    ...noteRows.map((n): OwnerTimelineItem => ({
      id: `note:${n.id}`,
      kind: "note",
      direction: null,
      at: toIso(n.createdAt),
      title: NOTE_CHANNEL_LABEL[n.channel] ?? n.channel,
      body: n.content,
      status: null,
      service: null,
      propertyId: n.propertyId,
      propertyAddress: n.propertyAddress,
      error: null,
    })),
    ...outreachRows.map((o): OwnerTimelineItem => ({
      id: `outreach:${o.id}`,
      kind: "outreach",
      direction: null,
      at: toIso(o.startedAt),
      title: OUTREACH_LABEL[o.status] ?? o.status,
      body: o.note ?? "",
      status: o.status,
      service: null,
      propertyId: o.propertyId,
      propertyAddress: o.propertyAddress,
      error: null,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, MAX_ITEMS);

  return NextResponse.json({ items });
}
