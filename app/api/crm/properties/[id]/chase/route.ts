import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexProperty } from "@/lib/crm/search-index";
import { matches, properties } from "@/lib/crm/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const OPEN_MATCH = ["suggested", "sent"];

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
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
    const set: Record<string, unknown> = { ownerFollowUpDate: date, updatedAt: now };
    if (typeof body.reason === "string") set.ownerFollowUpReason = body.reason;
    await db.update(properties).set(set).where(eq(properties.id, id));
    await rescheduleMatches(date);
  } else if (action === "answered") {
    await db.update(properties).set({ ownerFollowUpDate: null, updatedAt: now }).where(eq(properties.id, id));
    await rescheduleMatches(null);
  } else if (action === "off_market") {
    await db
      .update(properties)
      .set({ status: "off_market", ownerFollowUpDate: null, updatedAt: now })
      .where(eq(properties.id, id));
    await rescheduleMatches(null);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await indexProperty(id).catch((e) => console.error("search-index property chase:", e));
  return NextResponse.json({ ok: true });
}
