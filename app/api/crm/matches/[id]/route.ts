import { requireApprovedSession } from "@/lib/crm/auth";
import { plusDaysStockholm } from "@/lib/crm/date";
import { db } from "@/lib/crm/db";
import { sanitizeKalkyl } from "@/lib/crm/kalkyl";
import { matches, matchEvents } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

const OFFER_KEYS = ["offerRentOut", "offerStartDate", "offerEndDate", "offerOngoing", "offerNote"] as const;
const PROMISE_KEYS = ["promisedRentIn", "promisedStartDate", "promisedEndDate", "promisedConditions"] as const;

const VALID = ["suggested", "sent", "accepted", "rejected"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Whitelist redigerbara fält — klienten får aldrig repeka requestId/propertyId eller byta id.
  const ALLOWED = [
    "status", "matchScore", "followUpDate", "followUpReason", "notes", "kalkyl",
    // Stämplade affärsvillkor (fas 1) — erbjudandet till kund resp. löftet till uthyraren.
    "offerRentOut", "offerStartDate", "offerEndDate", "offerOngoing", "offerNote",
    "promisedRentIn", "promisedStartDate", "promisedEndDate", "promisedConditions",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key];
  }
  if ("kalkyl" in data) data.kalkyl = sanitizeKalkyl(data.kalkyl);
  // Löftesstämpeln sätts av servern i samma ögonblick villkoren bekräftas —
  // klienten kan aldrig backdatera ett löfte.
  if (["promisedRentIn", "promisedStartDate", "promisedEndDate", "promisedConditions"].some((k) => k in data)) {
    data.promisedAt = new Date().toISOString();
  }
  // Stamp sentAt when a suggestion is marked as sent
  if (body.status === "sent") {
    data.sentAt = new Date().toISOString();
    // Skickat förslag utan uppföljningsdatum = garanterat tappad tråd. Sätt +3 dagar
    // automatiskt om klienten inte anger något eget — det var så 10/10 skickade
    // förslag hamnade förfallna utan att synas.
    const [existing] = await db.select({ followUpDate: matches.followUpDate }).from(matches).where(eq(matches.id, id));
    if (!("followUpDate" in body) && !existing?.followUpDate) {
      data.followUpDate = plusDaysStockholm(3);
      data.followUpReason = data.followUpReason ?? "Förslag skickat — väntar svar";
    }
  }

  const [row] = await db.update(matches).set(data).where(eq(matches.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Förhandlingen snurrar — varje omstämpling av villkor loggas med en kopia av
  // värdena (crm_match_events) så historiken aldrig går förlorad. Loggfel får
  // inte fälla skrivningen: villkoren är redan sparade på affären.
  try {
    const events: (typeof matchEvents.$inferInsert)[] = [];
    if (OFFER_KEYS.some((k) => k in data)) {
      events.push({
        id: nanoid(),
        matchId: id,
        requestId: row.requestId,
        actor: "internal",
        type: "offer_terms",
        data: {
          rentOut: row.offerRentOut,
          startDate: row.offerStartDate,
          endDate: row.offerEndDate,
          ongoing: row.offerOngoing,
          note: row.offerNote,
        },
      });
    }
    if (PROMISE_KEYS.some((k) => k in data)) {
      events.push({
        id: nanoid(),
        matchId: id,
        requestId: row.requestId,
        actor: "internal",
        type: "promised_terms",
        data: {
          rentIn: row.promisedRentIn,
          startDate: row.promisedStartDate,
          endDate: row.promisedEndDate,
          conditions: row.promisedConditions,
        },
      });
    }
    if (events.length) await db.insert(matchEvents).values(events);
  } catch (e) {
    console.error("match-event log:", e);
  }

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(matches).where(eq(matches.id, id));
  return NextResponse.json({ ok: true });
}
