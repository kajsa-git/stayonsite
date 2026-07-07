import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { todayStockholm, plusDaysStockholm } from "@/lib/crm/date";
import { companies, inboxMessages, matches, outboxMessages, ownerOutreach, requests } from "@/lib/crm/schema";
import { and, eq, gte, inArray, isNotNull, isNull, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Samma svenska "idag" som /api/crm/queues, så badge-räknarna och kö-kolumnerna
  // aldrig glider isär runt midnatt.
  const today = todayStockholm();
  // Markör-fönster: flyttar den närmaste veckan (overdue räknas också).
  const horizon = plusDaysStockholm(7);

  const [followUps, openWithoutFollowUpRows, toInvoiceRows, chaseMatchProps, chaseOwnerProps, moveRows, unreadReplies, draftRows, renewalRows] = await Promise.all([
    db.select({ id: companies.id }).from(companies).where(lte(companies.followUpDate, today)),

    // Öppna uppdrag: företag med incoming/matching + followUpDate IS NULL
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(
        and(
          inArray(requests.status, ["incoming", "matching"]),
          isNull(companies.followUpDate),
        ),
      ),

    // Ska faktureras: företag med won-förfrågningar
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .where(eq(requests.status, "won")),

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

    db
      .select({ propertyId: ownerOutreach.propertyId })
      .from(ownerOutreach)
      .where(and(isNull(ownerOutreach.concludedAt), lte(ownerOutreach.nextFollowUpDate, today))),

    // In-/avflyttningar att hantera: aktiva uppdrag med datum.
    db
      .select({
        startDate: requests.startDate,
        endDate: requests.endDate,
        endDateOngoing: requests.endDateOngoing,
        moveInDoneAt: requests.moveInDoneAt,
        moveOutDoneAt: requests.moveOutDoneAt,
      })
      .from(requests)
      .where(inArray(requests.status, ["won", "invoiced"])),

    // Olästa inkommande svar (Svar-panelen).
    db.select({ id: inboxMessages.id }).from(inboxMessages).where(eq(inboxMessages.isRead, false)),

    // Väntande SMS-utkast (Utkast-panelen).
    db.select({ id: outboxMessages.id }).from(outboxMessages).where(eq(outboxMessages.status, "draft")),

    // Förlängningar: samma fönster som /api/crm/queues (−7…+30 dagar).
    db
      .select({ companyId: requests.companyId })
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(
        and(
          inArray(requests.status, ["won", "invoiced"]),
          isNotNull(requests.endDate),
          gte(requests.endDate, plusDaysStockholm(-7)),
          lte(requests.endDate, plusDaysStockholm(30)),
          or(isNull(requests.endDateOngoing), eq(requests.endDateOngoing, false)),
          or(isNull(companies.followUpDate), lte(companies.followUpDate, today)),
        ),
      ),
  ]);

  const chaseProps = new Set<string>();
  for (const m of chaseMatchProps) if (m.propertyId) chaseProps.add(m.propertyId);
  for (const o of chaseOwnerProps) chaseProps.add(o.propertyId);

  // Ohanterade in-/avflyttningar inom 3 dagar (förfallna räknas också): ej klarmarkerade.
  let moveSchedule = 0;
  for (const r of moveRows) {
    if (r.startDate && !r.moveInDoneAt && r.startDate <= horizon) moveSchedule++;
    if (r.endDate && !r.endDateOngoing && !r.moveOutDoneAt && r.endDate <= horizon) moveSchedule++;
  }

  return NextResponse.json({
    followUps: followUps.length,
    openWithoutFollowUp: openWithoutFollowUpRows.length,
    toInvoice: toInvoiceRows.length,
    chaseLandlords: chaseProps.size,
    moveSchedule,
    replies: unreadReplies.length,
    drafts: draftRows.length,
    renewals: renewalRows.length,
  });
}
