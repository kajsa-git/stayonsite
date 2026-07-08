import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { plusDaysStockholm, todayStockholm } from "@/lib/crm/date";
import { companies, contacts, inboxMessages, matches, owners, ownerOutreach, properties, requests } from "@/lib/crm/schema";
import { and, asc, eq, gte, inArray, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
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
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = todayStockholm();

  // Wave 1: alla köer + chase-data parallellt
  const [followUpCompanies, activeRequestRows, wonRequestRows, chaseMatches, chaseOwners, renewalRows, unreadInboxOwners] = await Promise.all([
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
        ownerId: owners.id,
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
        ownerId: owners.id,
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

    // Förlängningar: vunna/fakturerade affärer vars slutdatum är inom −7…+30 dagar.
    // Löpande avtal (endDateOngoing) har inget slut att bevaka.
    db
      .select({
        requestId: requests.id,
        requestNumber: requests.requestNumber,
        companyId: requests.companyId,
        city: requests.city,
        endDate: requests.endDate,
        monthlyValue: requests.monthlyValue,
        status: requests.status,
      })
      .from(requests)
      .where(
        and(
          inArray(requests.status, ["won", "invoiced"]),
          isNotNull(requests.endDate),
          gte(requests.endDate, plusDaysStockholm(-7)),
          lte(requests.endDate, plusDaysStockholm(30)),
          or(isNull(requests.endDateOngoing), eq(requests.endDateOngoing, false)),
          isNull(requests.renewalDismissedAt), // "Förlängs ej" tryckt → dölj
          isNull(requests.moveOutDoneAt), // redan utflyttad → inget att förlänga
        ),
      )
      .orderBy(asc(requests.endDate)),

    // Olästa inkommande svar per uthyrare → "har svarat"-flagga på jaga-korten.
    db
      .selectDistinct({ ownerId: inboxMessages.ownerId })
      .from(inboxMessages)
      .where(and(eq(inboxMessages.isRead, false), isNotNull(inboxMessages.ownerId))),
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

  const renewalCompanyIds = [...new Set(renewalRows.map((r) => r.companyId))];

  // Wave 2: företagsdata + öppna förfrågningar för alla relevanta företag
  const [openWithoutFollowUpCompanies, toInvoiceCompanies, allOpenRequests, renewalCompanies, renewalContacts] = await Promise.all([
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
    renewalCompanyIds.length
      ? db
          .select({ id: companies.id, name: companies.name, followUpDate: companies.followUpDate })
          .from(companies)
          .where(inArray(companies.id, renewalCompanyIds))
      : Promise.resolve([]),
    renewalCompanyIds.length
      ? db
          .select({ companyId: contacts.companyId, name: contacts.name, phone: contacts.phone, isPrimary: contacts.isPrimary })
          .from(contacts)
          .where(inArray(contacts.companyId, renewalCompanyIds))
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
    ownerId: string | null;
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
      e = { propertyId: id, address: null, ownerId: null, ownerName: null, ownerPhone: null, dates: [], matchReasons: [], ownerReason: null, requestCount: 0 };
      byProperty.set(id, e);
    }
    return e;
  };
  for (const m of chaseMatches) {
    if (!m.propertyId) continue;
    const e = ensure(m.propertyId);
    e.address ??= m.address ?? null;
    e.ownerId ??= m.ownerId ?? null;
    e.ownerName ??= m.ownerName ?? null;
    e.ownerPhone ??= m.ownerPhone ?? null;
    if (m.followUpDate) e.dates.push(m.followUpDate);
    if (m.reason) e.matchReasons.push(m.reason);
    e.requestCount++;
  }
  for (const o of chaseOwners) {
    const e = ensure(o.propertyId);
    e.address ??= o.address ?? null;
    e.ownerId ??= o.ownerId ?? null;
    e.ownerName ??= o.ownerName ?? null;
    e.ownerPhone ??= o.ownerPhone ?? null;
    e.ownerReason = o.ownerReason ?? null;
    if (o.ownerFollowUpDate) e.dates.push(o.ownerFollowUpDate);
  }
  // "Har svarat"-flaggan: oläst inkommande SMS från uthyraren → jaga inte i blindo.
  const unreadOwnerSet = new Set(unreadInboxOwners.map((r) => r.ownerId).filter((v): v is string => !!v));
  const chaseLandlords = [...byProperty.values()]
    .map((e) => ({
      propertyId: e.propertyId,
      address: e.address,
      ownerId: e.ownerId,
      ownerName: e.ownerName,
      ownerPhone: e.ownerPhone,
      earliestDate: e.dates.length ? [...e.dates].sort()[0] : null,
      reason: e.ownerReason ?? e.matchReasons[0] ?? null,
      requestCount: e.requestCount,
      sourcing: e.requestCount === 0,
      hasReply: e.ownerId ? unreadOwnerSet.has(e.ownerId) : false,
    }))
    .sort((a, b) => (a.earliestDate ?? "").localeCompare(b.earliestDate ?? ""));

  // Förlängningar: hoppa över företag som redan har en INPLANERAD framtida återkomst
  // (då är kontakten redan schemalagd — dubbelnag hjälper ingen).
  const renewalCompanyName = new Map(renewalCompanies.map((c) => [c.id, c.name]));
  const renewalCompanyFollowUp = new Map(renewalCompanies.map((c) => [c.id, c.followUpDate]));
  const primaryContactByCompany = new Map<string, { name: string | null; phone: string | null }>();
  for (const c of renewalContacts) {
    const existing = primaryContactByCompany.get(c.companyId);
    if (!existing || c.isPrimary) primaryContactByCompany.set(c.companyId, { name: c.name, phone: c.phone });
  }
  const renewals = renewalRows
    .filter((r) => {
      const fu = renewalCompanyFollowUp.get(r.companyId);
      return !fu || fu <= today;
    })
    .map((r) => ({
      ...r,
      companyName: renewalCompanyName.get(r.companyId) ?? "Okänt bolag",
      contactName: primaryContactByCompany.get(r.companyId)?.name ?? null,
      contactPhone: primaryContactByCompany.get(r.companyId)?.phone ?? null,
    }));

  return NextResponse.json({ followUps, openWithoutFollowUp, toInvoice, chaseLandlords, renewals });
}
