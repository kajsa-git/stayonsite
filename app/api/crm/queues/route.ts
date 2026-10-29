import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { plusDaysStockholm, todayStockholm } from "@/lib/crm/date";
import { hasSignedMoveInContract } from "@/lib/crm/move-checklists";
import { companies, contacts, emails, inboxMessages, matches, notes, owners, ownerOutreach, properties, requests } from "@/lib/crm/schema";
import { and, asc, eq, gte, inArray, isNotNull, isNull, lte, max, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const ACTIVE_STATUSES = ["incoming", "matching"] as const;
const OPEN_STATUSES = ["incoming", "matching", "won"] as const;

const openRequestSelect = {
  id: requests.id,
  requestNumber: requests.requestNumber,
  companyId: requests.companyId,
  city: requests.city,
  status: requests.status,
  moveInChecklist: requests.moveInChecklist,
};

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = todayStockholm();

  // Wave 1: alla köer + chase-data parallellt
  const [followUpCompanies, activeRequestRows, wonRequestRows, chaseOwners, ownerFollowUps, renewalRows, unreadInboxOwners] = await Promise.all([
    // Återkomster: företag med återkomst idag eller försenad
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

    // Avtal/Ska faktureras: distinkta företag med won-förfrågningar.
    // De delas efteråt beroende på om det skarpa avtalet är signerat.
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .where(eq(requests.status, "won")),

    // Chase: öppna kontaktrundor vars nästa-uppföljning passerat.
    // (Förslags-jakten togs bort 2026-07-13 — skickat erbjudande sätter i stället
    // återkomst på KUNDEN; når vi inte uthyraren avböjs förslaget helt enkelt.)
    db
      .select({
        propertyId: ownerOutreach.propertyId,
        address: properties.address,
        ownerId: owners.id,
        ownerName: owners.name,
        ownerPhone: owners.phone,
        ownerFollowUpDate: ownerOutreach.nextFollowUpDate,
        ownerFollowUpTime: ownerOutreach.nextFollowUpTime,
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

    // Återkomster på själva uthyraren är separata från en bostads kontaktrunda.
    db.select({
      ownerId: owners.id, ownerName: owners.name, ownerPhone: owners.phone,
      date: owners.followUpDate, time: owners.followUpTime, reason: owners.followUpReason,
    }).from(owners).where(lte(owners.followUpDate, today)),

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

  // Avtal/Ska faktureras: alla företag med won-förfrågningar.
  const wonCompanyIds = wonRequestRows.map((r) => r.companyId).filter((id, i, a) => a.indexOf(id) === i);

  // Alla relevanta company-IDs för request-hämtning
  const allRelevantIds = [...new Set([...followUpIds, ...openWithoutFollowUpIds, ...wonCompanyIds])];

  const renewalCompanyIds = [...new Set(renewalRows.map((r) => r.companyId))];

  // Wave 2: företagsdata + öppna förfrågningar för alla relevanta företag
  const [openWithoutFollowUpCompanies, wonCompanies, allOpenRequests, renewalCompanies, renewalContacts, cardContacts, lastNotes, lastEmails, lastSms] = await Promise.all([
    openWithoutFollowUpIds.length
      ? db.select().from(companies).where(and(
          inArray(companies.id, openWithoutFollowUpIds),
          isNull(companies.followUpDate),
        )).orderBy(asc(companies.updatedAt))
      : Promise.resolve([]),
    wonCompanyIds.length
      ? db.select().from(companies).where(inArray(companies.id, wonCompanyIds)).orderBy(asc(companies.updatedAt))
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
    // Dagskorten: vem man ringer + när vi senast hade kontakt (anteckning, mejl eller SMS).
    allRelevantIds.length
      ? db
          .select({ companyId: contacts.companyId, name: contacts.name, phone: contacts.phone, isPrimary: contacts.isPrimary })
          .from(contacts)
          .where(inArray(contacts.companyId, allRelevantIds))
      : Promise.resolve([]),
    allRelevantIds.length
      ? db.select({ companyId: notes.companyId, at: max(notes.createdAt) }).from(notes)
          .where(inArray(notes.companyId, allRelevantIds)).groupBy(notes.companyId)
      : Promise.resolve([]),
    allRelevantIds.length
      ? db.select({ companyId: emails.companyId, at: max(emails.sentAt) }).from(emails)
          .where(inArray(emails.companyId, allRelevantIds)).groupBy(emails.companyId)
      : Promise.resolve([]),
    allRelevantIds.length
      ? db.select({ companyId: inboxMessages.companyId, at: max(inboxMessages.sentAt) }).from(inboxMessages)
          .where(inArray(inboxMessages.companyId, allRelevantIds)).groupBy(inboxMessages.companyId)
      : Promise.resolve([]),
  ]);

  const cardContactByCompany = new Map<string, { name: string | null; phone: string | null }>();
  for (const c of cardContacts) {
    const existing = cardContactByCompany.get(c.companyId);
    // Primär kontakt vinner; annars första med telefonnummer.
    if (!existing || c.isPrimary || (!existing.phone && c.phone)) cardContactByCompany.set(c.companyId, { name: c.name, phone: c.phone });
  }
  // Anteckningar lagras "YYYY-MM-DD HH:MM:SS", mejl/SMS som ISO — normalisera före jämförelse.
  const lastContactByCompany = new Map<string, string>();
  for (const r of [...lastNotes, ...lastEmails, ...lastSms]) {
    if (!r.companyId || !r.at) continue;
    const at = r.at.replace(" ", "T");
    const prev = lastContactByCompany.get(r.companyId);
    if (!prev || at > prev) lastContactByCompany.set(r.companyId, at);
  }
  const cardExtras = (id: string) => ({
    contactName: cardContactByCompany.get(id)?.name ?? null,
    contactPhone: cardContactByCompany.get(id)?.phone ?? null,
    lastContactAt: lastContactByCompany.get(id) ?? null,
  });

  // Gruppera förfrågningar per företag
  const reqsByCompany = new Map<string, (typeof allOpenRequests)[number][]>();
  for (const r of allOpenRequests) {
    if (!reqsByCompany.has(r.companyId)) reqsByCompany.set(r.companyId, []);
    reqsByCompany.get(r.companyId)!.push(r);
  }

  const followUps = followUpCompanies.map((c) => ({ ...c, ...cardExtras(c.id), openRequests: reqsByCompany.get(c.id) ?? [] }));
  const openWithoutFollowUp = openWithoutFollowUpCompanies.map((c) => ({ ...c, ...cardExtras(c.id), openRequests: reqsByCompany.get(c.id) ?? [] }));
  const agreements = wonCompanies
    .map((c) => ({
      ...c,
      ...cardExtras(c.id),
      openRequests: (reqsByCompany.get(c.id) ?? []).filter(
        (r) => r.status === "won" && !hasSignedMoveInContract(r.moveInChecklist),
      ),
    }))
    .filter((c) => c.openRequests.length > 0);
  const toInvoice = wonCompanies
    .map((c) => ({
      ...c,
      ...cardExtras(c.id),
      openRequests: (reqsByCompany.get(c.id) ?? []).filter(
        (r) => r.status === "won" && hasSignedMoveInContract(r.moveInChecklist),
      ),
    }))
    .filter((c) => c.openRequests.length > 0);

  // Dedupa chase-rader per objekt
  type Acc = {
    propertyId: string;
    address: string | null;
    ownerId: string | null;
    ownerName: string | null;
    ownerPhone: string | null;
    followUps: { date: string; time: string | null; reason: string | null }[];
    includesOwnerFollowUp: boolean;
  };
  const byProperty = new Map<string, Acc>();
  const ensure = (id: string): Acc => {
    let e = byProperty.get(id);
    if (!e) {
      e = { propertyId: id, address: null, ownerId: null, ownerName: null, ownerPhone: null, followUps: [], includesOwnerFollowUp: false };
      byProperty.set(id, e);
    }
    return e;
  };
  for (const o of chaseOwners) {
    const e = ensure(o.propertyId);
    e.address ??= o.address ?? null;
    e.ownerId ??= o.ownerId ?? null;
    e.ownerName ??= o.ownerName ?? null;
    e.ownerPhone ??= o.ownerPhone ?? null;
    if (o.ownerFollowUpDate) e.followUps.push({ date: o.ownerFollowUpDate, time: o.ownerFollowUpTime, reason: o.ownerReason });
  }
  // Ett kort per uthyrare: har uthyraren både en förfallen återkomst på kortet och en
  // förfallen kontaktrunda, viks återkomsten in i (första) bostadskortet i stället för
  // att ligga som ett eget kort bredvid. Snabbvalen flyttar då båda datumen.
  const dueOwnerFollowUp = new Map(ownerFollowUps.map((o) => [o.ownerId, o]));
  const mergedOwnerIds = new Set<string>();
  for (const e of byProperty.values()) {
    const o = e.ownerId ? dueOwnerFollowUp.get(e.ownerId) : undefined;
    if (!o || mergedOwnerIds.has(o.ownerId)) continue;
    mergedOwnerIds.add(o.ownerId);
    e.includesOwnerFollowUp = true;
    if (o.date) e.followUps.push({ date: o.date, time: o.time, reason: o.reason });
  }
  // "Har svarat"-flaggan: oläst inkommande SMS från uthyraren → jaga inte i blindo.
  const unreadOwnerSet = new Set(unreadInboxOwners.map((r) => r.ownerId).filter((v): v is string => !!v));
  const chaseLandlords = [
    ...[...byProperty.values()].map((e) => {
      const next = [...e.followUps].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "99:99").localeCompare(b.time ?? "99:99"))[0];
      return {
        source: "property" as const, propertyId: e.propertyId, address: e.address,
        ownerId: e.ownerId, ownerName: e.ownerName, ownerPhone: e.ownerPhone,
        earliestDate: next?.date ?? null, earliestTime: next?.time ?? null,
        reason: next?.reason ?? e.followUps.find((f) => f.reason)?.reason ?? null,
        hasReply: e.ownerId ? unreadOwnerSet.has(e.ownerId) : false,
        includesOwnerFollowUp: e.includesOwnerFollowUp,
      };
    }),
    ...ownerFollowUps.filter((o) => !mergedOwnerIds.has(o.ownerId)).map((o) => ({
      source: "owner" as const, propertyId: null, address: null,
      ownerId: o.ownerId, ownerName: o.ownerName, ownerPhone: o.ownerPhone,
      earliestDate: o.date, earliestTime: o.time, reason: o.reason,
      hasReply: unreadOwnerSet.has(o.ownerId),
    })),
  ].sort((a, b) =>
    (a.source === b.source ? 0 : a.source === "property" ? -1 : 1)
    || (a.earliestDate ?? "").localeCompare(b.earliestDate ?? "")
    || (a.earliestTime ?? "99:99").localeCompare(b.earliestTime ?? "99:99"),
  );

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

  return NextResponse.json({ followUps, openWithoutFollowUp, agreements, toInvoice, chaseLandlords, renewals });
}
