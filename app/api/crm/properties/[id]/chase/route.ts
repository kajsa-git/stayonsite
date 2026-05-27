import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexProperty } from "@/lib/crm/search-index";
import { matches, ownerOutreach, properties } from "@/lib/crm/schema";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

const OPEN_MATCH = ["suggested", "sent"];
const OPEN_ROUND = ["ej_kontaktad", "kontaktad", "i_dialog"];

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

// Hämtar objektets öppna runda, eller skapar en (objektet kan ligga i kön enbart pga match-jakt).
async function ensureOpenRound(propertyId: string) {
  const [open] = await db
    .select()
    .from(ownerOutreach)
    .where(and(eq(ownerOutreach.propertyId, propertyId), inArray(ownerOutreach.status, OPEN_ROUND)));
  if (open) return open;
  const [prop] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, propertyId));
  const [created] = await db
    .insert(ownerOutreach)
    .values({
      id: nanoid(),
      propertyId,
      ownerId: prop?.ownerId ?? null,
      status: "kontaktad",
      startedAt: new Date().toISOString(),
    })
    .returning();
  return created;
}

// Snabbåtgärder för "Följ upp uthyrare". Reschedule/clear är benignt;
// VI STÄNGER ALDRIG (rejected) matchningar här — det kräver tydlig bekräftelse i matchningsvyn.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const action = body.action as string;
  const now = new Date().toISOString();

  // Omplanera objektets öppna förslag (förslag/skickad) till nytt jaga-datum (eller rensa)
  const rescheduleMatches = (date: string | null) =>
    db
      .update(matches)
      .set({ followUpDate: date })
      .where(and(eq(matches.propertyId, id), inArray(matches.status, OPEN_MATCH)));

  if (action === "snooze3" || action === "snooze7") {
    const date = plusDays(action === "snooze7" ? 7 : 3);
    const round = await ensureOpenRound(id);
    const set: Record<string, unknown> = { nextFollowUpDate: date };
    if (typeof body.reason === "string") set.nextFollowUpReason = body.reason;
    // Första kontaktförsöket markerar rundan som kontaktad.
    if (round.status === "ej_kontaktad") set.status = "kontaktad";
    await db.update(ownerOutreach).set(set).where(eq(ownerOutreach.id, round.id));
    await rescheduleMatches(date);
  } else if (action === "answered") {
    const round = await ensureOpenRound(id);
    await db
      .update(ownerOutreach)
      .set({ status: "i_dialog", nextFollowUpDate: null, nextFollowUpReason: null })
      .where(eq(ownerOutreach.id, round.id));
    await rescheduleMatches(null);
  } else if (action === "off_market") {
    await db.update(properties).set({ status: "off_market", updatedAt: now }).where(eq(properties.id, id));
    // Sluta jaga, men avsluta inte rundan — "av marknaden" är ett objektbeslut, inte uthyrarens svar.
    const round = await ensureOpenRound(id);
    await db
      .update(ownerOutreach)
      .set({ nextFollowUpDate: null, nextFollowUpReason: null })
      .where(eq(ownerOutreach.id, round.id));
    await rescheduleMatches(null);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await indexProperty(id).catch((e) => console.error("search-index property chase:", e));
  return NextResponse.json({ ok: true });
}
