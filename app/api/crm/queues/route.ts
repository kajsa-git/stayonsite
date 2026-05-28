import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, owners, ownerOutreach, properties, requests } from "@/lib/crm/schema";
import { and, asc, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const ACTIVE_STATUSES = ["incoming", "matching"] as const;
const OPEN_STATUSES = ["incoming", "matching", "won"] as const;

const openRequestSelect = {
  id: requests.id,
  requestNumber: requests.requestNumber,
  companyId: requests.companyId,
  city: requests.city,
  status: requests.status,
};

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // Wave 1: alla köer + chase-data parallellt
  const [followUpCompanies, activeRequestRows, wonRequestRows, chaseMatches, chaseOwners] = await Promise.all([
    // Att kontakta: företag med återkomst idag eller försenad
    db
      .select()
      .from(companies)
      .where(lte(companies.followUpDate, today))
      .orderBy(asc(companies.followUpDate), sql`${companies.followUpTime} ASC NULLS LAST`),

    // Öppna uppdrag: distinkta företag med incoming/matching + INGEN satt återkomst
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .where(inArray(requests.status, [...ACTIVE_STATUSES])),

    // Ska faktureras: distinkta företag med won-förfrågningar
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .where(eq(requests.status, "won")),

    // Chase: förslag vars jaga-datum passerat
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

    // Chase: öppna kontaktrundor vars nästa-uppföljning passerat
    db
      .select({
        propertyId: ownerOutreach.propertyId,
        address: properties.address,
        ownerName: owners.name,
        ownerPhone: owners.phone,
        ownerFollowUpDate: ownerOutreach.nextFollowUpDate,
        ownerReason: ownerOutreach.nextFollowUpReason,
      })
      .from(ownerOutreach)
      .leftJoin(properties, eq(ownerOutreach.propertyId, properties.id))
      .leftJoin(owners, eq(properties.ownerId, owners.id))
      .where(
        and(
          isNull(ownerOutreach.concludedAt),
          lte(ownerOutreach.nextFollowUpDate, today),
        ),
      ),
  ]);

  // Öppna uppdrag: bara företag utan satt återkomst (followUpDate IS NULL)
  const followUpIds = new Set(followUpCompanies.map((c) => c.id));
  const openWithoutFollowUpIds = activeRequestRows
    .map((r) => r.companyId)
    .filter((id) => !followUpIds.has(id));

  // Ska faktureras: alla företag med won-förfrågningar
  const toInvoiceIds = wonRequestRows.map((r) => r.companyId).filter((id, i, a) => a.indexOf(id) === i);

  // Alla relevanta company-IDs för request-hämtning
  const allRelevantIds = [...new Set([...followUpIds, ...openWithoutFollowUpIds, ...toInvoiceIds])];

  // Wave 2: företagsdata + öppna förfrågningar för alla relevanta företag
  const [openWithoutFollowUpCompanies, toInvoiceCompanies, allOpenRequests] = await Promise.all([
    openWithoutFollowUpIds.length
      ? db.select().from(companies).where(and(
          inArray(companies.id, openWithoutFollowUpIds),
          isNull(companies.followUpDate),
        )).orderBy(asc(companies.updatedAt))
      : Promise.resolve([]),
    toInvoiceIds.length
      ? db.select().from(companies).where(inArray(companies.id, toInvoiceIds)).orderBy(asc(companies.updatedAt))
      : Promise.resolve([]),
    allRelevantIds.length
      ? db
          .select(openRequestSelect)
          .from(requests)
          .where(
            and(
              inArray(requests.companyId, allRelevantIds),
              inArray(requests.status, [...OPEN_STATUSES]),
            ),
          )
      : Promise.resolve([]),
  ]);

  // Gruppera förfrågningar per företag
  const reqsByCompany = new Map<string, (typeof allOpenRequests)[number][]>();
  for (const r of allOpenRequests) {
    if (!reqsByCompany.has(r.companyId)) reqsByCompany.set(r.companyId, []);
    reqsByCompany.get(r.companyId)!.push(r);
  }

  const followUps = followUpCompanies.map((c) => ({ ...c, openRequests: reqsByCompany.get(c.id) ?? [] }));
  const openWithoutFollowUp = openWithoutFollowUpCompanies.map((c) => ({ ...c, openRequests: reqsByCompany.get(c.id) ?? [] }));
  const toInvoice = toInvoiceCompanies.map((c) => ({ ...c, openRequests: (reqsByCompany.get(c.id) ?? []).filter((r) => r.status === "won") }));

  // Dedupa chase-rader per objekt
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

  return NextResponse.json({ followUps, openWithoutFollowUp, toInvoice, chaseLandlords });
}
