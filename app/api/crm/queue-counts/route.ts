import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, ownerOutreach, requests } from "@/lib/crm/schema";
import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [followUps, incomingQueue, matchingQueue, wonQueue, chaseMatchProps, chaseOwnerProps] = await Promise.all([
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

    // Objekt med förslag vars jaga-datum passerat (öppna förfrågningar)
    db
      .select({ propertyId: matches.propertyId })
      .from(matches)
      .innerJoin(requests, eq(matches.requestId, requests.id))
      .where(
        and(
          inArray(matches.status, ["suggested", "sent"]),
          lte(matches.followUpDate, today),
          inArray(requests.status, ["incoming", "matching"]),
        ),
      ),

    // Öppna kontaktrundor vars nästa-uppföljning passerat
    db
      .select({ propertyId: ownerOutreach.propertyId })
      .from(ownerOutreach)
      .where(and(isNull(ownerOutreach.concludedAt), lte(ownerOutreach.nextFollowUpDate, today))),
  ]);

  // Dedupa: räkna distinkta objekt i "Följ upp uthyrare"
  const chaseProps = new Set<string>();
  for (const m of chaseMatchProps) if (m.propertyId) chaseProps.add(m.propertyId);
  for (const o of chaseOwnerProps) chaseProps.add(o.propertyId);

  return NextResponse.json({
    followUps: followUps.length,
    incoming: incomingQueue.length,
    matching: matchingQueue.length,
    won: wonQueue.length,
    chaseLandlords: chaseProps.size,
  });
}
