import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, owners, properties, requests } from "@/lib/crm/schema";
import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const requestSelect = {
  id: requests.id,
  requestNumber: requests.requestNumber,
  companyId: requests.companyId,
  companyName: companies.name,
  city: requests.city,
  status: requests.status,
};

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const requestsByStatus = (status: string) =>
    db
      .select(requestSelect)
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(eq(requests.status, status));

  const [followUpCompanies, incoming, matching, toInvoice, chaseMatches, chaseOwners] = await Promise.all([
    db
      .select()
      .from(companies)
      .where(lte(companies.followUpDate, today))
      .orderBy(asc(companies.followUpDate), sql`${companies.followUpTime} ASC NULLS LAST`),
    requestsByStatus("incoming"),
    requestsByStatus("matching"),
    requestsByStatus("won"),
    // Förslag vars jaga-datum passerat (väntar svar från hyresvärd), per match
    db
      .select({
        propertyId: matches.propertyId,
        followUpDate: matches.followUpDate,
        reason: matches.followUpReason,
        address: properties.address,
        ownerName: owners.name,
        ownerPhone: owners.phone,
      })
      .from(matches)
      .innerJoin(requests, eq(matches.requestId, requests.id))
      .leftJoin(properties, eq(matches.propertyId, properties.id))
      .leftJoin(owners, eq(properties.ownerId, owners.id))
      .where(
        and(
          inArray(matches.status, ["suggested", "sent"]),
          lte(matches.followUpDate, today),
          inArray(requests.status, ["incoming", "matching"]),
        ),
      ),
    // Objekt-nivå uppföljning (sourcing/relationsvård), oberoende av förfrågan
    db
      .select({
        propertyId: properties.id,
        address: properties.address,
        ownerName: owners.name,
        ownerPhone: owners.phone,
        ownerFollowUpDate: properties.ownerFollowUpDate,
        ownerReason: properties.ownerFollowUpReason,
      })
      .from(properties)
      .leftJoin(owners, eq(properties.ownerId, owners.id))
      .where(lte(properties.ownerFollowUpDate, today)),
  ]);

  // Dedupa till en rad per objekt: slå ihop match-jaga + objekt-jaga
  type Acc = {
    propertyId: string;
    address: string | null;
    ownerName: string | null;
    ownerPhone: string | null;
    dates: string[];
    matchReasons: string[];
    ownerReason: string | null;
    requestCount: number;
  };
  const byProperty = new Map<string, Acc>();
  const ensure = (id: string): Acc => {
    let e = byProperty.get(id);
    if (!e) {
      e = { propertyId: id, address: null, ownerName: null, ownerPhone: null, dates: [], matchReasons: [], ownerReason: null, requestCount: 0 };
      byProperty.set(id, e);
    }
    return e;
  };
  for (const m of chaseMatches) {
    if (!m.propertyId) continue;
    const e = ensure(m.propertyId);
    e.address ??= m.address ?? null;
    e.ownerName ??= m.ownerName ?? null;
    e.ownerPhone ??= m.ownerPhone ?? null;
    if (m.followUpDate) e.dates.push(m.followUpDate);
    if (m.reason) e.matchReasons.push(m.reason);
    e.requestCount++;
  }
  for (const o of chaseOwners) {
    const e = ensure(o.propertyId);
    e.address ??= o.address ?? null;
    e.ownerName ??= o.ownerName ?? null;
    e.ownerPhone ??= o.ownerPhone ?? null;
    e.ownerReason = o.ownerReason ?? null;
    if (o.ownerFollowUpDate) e.dates.push(o.ownerFollowUpDate);
  }
  const chaseLandlords = [...byProperty.values()]
    .map((e) => ({
      propertyId: e.propertyId,
      address: e.address,
      ownerName: e.ownerName,
      ownerPhone: e.ownerPhone,
      earliestDate: e.dates.length ? [...e.dates].sort()[0] : null,
      reason: e.ownerReason ?? e.matchReasons[0] ?? null,
      requestCount: e.requestCount,
      sourcing: e.requestCount === 0,
    }))
    .sort((a, b) => (a.earliestDate ?? "").localeCompare(b.earliestDate ?? ""));

  return NextResponse.json({
    followUps: followUpCompanies,
    incoming,
    matching,
    won: toInvoice,
    chaseLandlords,
  });
}
