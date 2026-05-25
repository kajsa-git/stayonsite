import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, requests } from "@/lib/crm/schema";
import { and, eq, inArray, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [followUps, incomingQueue, matchingQueue, wonQueue, chaseQueue] = await Promise.all([
    db
      .select({ id: companies.id })
      .from(companies)
      .where(and(lte(companies.followUpDate, today))),

    // New, untriaged requests
    db.select({ id: requests.id }).from(requests).where(eq(requests.status, "incoming")),

    // Active requests in matching status
    db.select({ id: requests.id }).from(requests).where(eq(requests.status, "matching")),

    // Won deals awaiting invoice
    db.select({ id: requests.id }).from(requests).where(eq(requests.status, "won")),

    // Förslag som väntar hyresvärds-svar och vars jaga-datum passerat
    // (endast för förfrågningar som fortfarande är öppna — inte vunna/stängda)
    db
      .select({ id: matches.id })
      .from(matches)
      .innerJoin(requests, eq(matches.requestId, requests.id))
      .where(
        and(
          inArray(matches.status, ["suggested", "sent"]),
          lte(matches.followUpDate, today),
          inArray(requests.status, ["incoming", "matching"]),
        ),
      ),
  ]);

  return NextResponse.json({
    followUps: followUps.length,
    incoming: incomingQueue.length,
    matching: matchingQueue.length,
    won: wonQueue.length,
    chaseLandlords: chaseQueue.length,
  });
}
