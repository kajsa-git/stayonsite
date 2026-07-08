// Agent-endpoints för inkommande svar (scripts/imessage-agent.mjs). Samma statiska
// bearer-auth som messages/agent — agenten är headless. GET ger listan över kända
// nummer (ägare + kontakter) så att agenten ALDRIG läser andra konversationer ur
// chat.db än de som hör till CRM:et. POST ingestar en batch meddelanden idempotent
// (unikt guid-index → dubbletter ignoreras tyst).
import { db } from "@/lib/crm/db";
import { normalizePhoneE164 } from "@/lib/crm/phone-links";
import { contacts, inboxMessages, owners } from "@/lib/crm/schema";
import { inArray } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BATCH = 200;
const MAX_BODY_CHARS = 4000;

function agentAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRM_AGENT_TOKEN;
  if (!expected) return false; // token ej konfigurerad → endpointen är avstängd
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// GET — alla kända telefonnummer (E.164) i CRM:et: uthyrare + företagskontakter.
export async function GET(req: NextRequest) {
  if (!agentAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [ownerRows, contactRows] = await Promise.all([
    db.select({ phone: owners.phone }).from(owners),
    db.select({ phone: contacts.phone }).from(contacts),
  ]);
  const known = new Set<string>();
  for (const r of [...ownerRows, ...contactRows]) {
    const e164 = normalizePhoneE164(r.phone);
    if (e164) known.add(e164);
  }
  return NextResponse.json({ phones: [...known] });
}

// POST { messages: [{ guid, fromPhone, body, service, sentAt }] } — batch-ingest.
// Matchar avsändare mot uthyrare/kontakt (första träff) och sparar kopplingen.
export async function POST(req: NextRequest) {
  if (!agentAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  const list = Array.isArray(raw.messages) ? raw.messages.slice(0, MAX_BATCH) : [];
  if (list.length === 0) return NextResponse.json({ inserted: 0 });

  type Incoming = { guid: string; fromPhone: string; body: string; service: string | null; sentAt: string; direction: "in" | "out" };
  const cleaned: Incoming[] = [];
  for (const m of list) {
    if (typeof m !== "object" || m === null) continue;
    const r = m as Record<string, unknown>;
    const guid = typeof r.guid === "string" ? r.guid.trim() : "";
    const fromPhone = normalizePhoneE164(typeof r.fromPhone === "string" ? r.fromPhone : null);
    const body = typeof r.body === "string" ? r.body.trim().slice(0, MAX_BODY_CHARS) : "";
    const sentAt = typeof r.sentAt === "string" ? r.sentAt : "";
    if (!guid || !fromPhone || !sentAt) continue;
    cleaned.push({
      guid,
      fromPhone,
      body: body || "[tomt meddelande / kunde inte läsa text]",
      service: typeof r.service === "string" ? r.service : null,
      sentAt,
      direction: r.direction === "out" ? "out" : "in",
    });
  }
  if (cleaned.length === 0) return NextResponse.json({ inserted: 0 });

  // Matcha avsändare → uthyrare/kontakt i två batch-frågor. Telefonnummer lagras
  // som E.164 sedan städningen 2026-07-06, så likhetsjämförelse räcker.
  const phones = [...new Set(cleaned.map((m) => m.fromPhone))];
  const [ownerRows, contactRows] = await Promise.all([
    db.select({ id: owners.id, phone: owners.phone }).from(owners).where(inArray(owners.phone, phones)),
    db
      .select({ id: contacts.id, phone: contacts.phone, companyId: contacts.companyId })
      .from(contacts)
      .where(inArray(contacts.phone, phones)),
  ]);
  const ownerByPhone = new Map(ownerRows.map((o) => [o.phone, o.id]));
  const contactByPhone = new Map(contactRows.map((c) => [c.phone, c]));

  const values = cleaned.map((m) => {
    const contact = contactByPhone.get(m.fromPhone);
    return {
      id: nanoid(),
      guid: m.guid,
      fromPhone: m.fromPhone,
      body: m.body,
      service: m.service,
      direction: m.direction,
      sentAt: m.sentAt,
      ownerId: ownerByPhone.get(m.fromPhone) ?? null,
      contactId: contact?.id ?? null,
      companyId: contact?.companyId ?? null,
      // Kajsas egna svar är historik, inte att-göra — landar aldrig i Svar-kön.
      isRead: m.direction === "out",
    };
  });

  // Idempotent: samma guid två gånger (agent-omstart, överlappande cursor) → no-op.
  await db.insert(inboxMessages).values(values).onConflictDoNothing({ target: inboxMessages.guid });
  return NextResponse.json({ inserted: values.length });
}
