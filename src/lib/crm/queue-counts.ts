// Badge-räknarna för Min dag/köerna. Delas av /api/crm/queue-counts och
// MCP-verktyget crm_queue_counts — en implementation.
import { and, eq, gte, inArray, isNotNull, isNull, lte, or } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { addDaysYmd, todayStockholm } from "./date";
import { db as defaultDb } from "./db";
import { hasSignedMoveInContract } from "./move-checklists";
import * as schema from "./schema";
import { companies, inboxMessages, outboxMessages, ownerOutreach, requests } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export interface QueueCounts {
  followUps: number;
  openWithoutFollowUp: number;
  agreements: number;
  toInvoice: number;
  chaseLandlords: number;
  moveSchedule: number;
  replies: number;
  drafts: number;
  renewals: number;
}

export async function computeQueueCounts(opts?: { db?: DB; today?: string }): Promise<QueueCounts> {
  const db = opts?.db ?? defaultDb;
  // Samma svenska "idag" som /api/crm/queues, så badge-räknarna och kö-kolumnerna
  // aldrig glider isär runt midnatt.
  const today = opts?.today ?? todayStockholm();
  // Markör-fönster: flyttar den närmaste veckan (overdue räknas också).
  const horizon = addDaysYmd(today, 7);

  const [followUps, openWithoutFollowUpRows, wonRows, chaseOwnerProps, moveRows, unreadReplies, draftRows, renewalRows] = await Promise.all([
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

    // Avtal/Ska faktureras: won-förfrågningar delas på signerat skarpt avtal.
    db
      .select({ companyId: requests.companyId, moveInChecklist: requests.moveInChecklist })
      .from(requests)
      .where(eq(requests.status, "won")),

    // Förslags-jakten borttagen 2026-07-13 — bara kontaktrundorna jagar uthyrare.
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
          gte(requests.endDate, addDaysYmd(today, -7)),
          lte(requests.endDate, addDaysYmd(today, 30)),
          or(isNull(requests.endDateOngoing), eq(requests.endDateOngoing, false)),
          or(isNull(companies.followUpDate), lte(companies.followUpDate, today)),
          isNull(requests.renewalDismissedAt),
          isNull(requests.moveOutDoneAt),
        ),
      ),
  ]);

  const chaseProps = new Set<string>();
  for (const o of chaseOwnerProps) chaseProps.add(o.propertyId);

  const agreementCompanies = new Set<string>();
  const toInvoiceCompanies = new Set<string>();
  for (const r of wonRows) {
    if (hasSignedMoveInContract(r.moveInChecklist)) toInvoiceCompanies.add(r.companyId);
    else agreementCompanies.add(r.companyId);
  }

  // Ohanterade in-/avflyttningar inom 3 dagar (förfallna räknas också): ej klarmarkerade.
  let moveSchedule = 0;
  for (const r of moveRows) {
    if (r.startDate && !r.moveInDoneAt && r.startDate <= horizon) moveSchedule++;
    if (r.endDate && !r.endDateOngoing && !r.moveOutDoneAt && r.endDate <= horizon) moveSchedule++;
  }

  return {
    followUps: followUps.length,
    openWithoutFollowUp: openWithoutFollowUpRows.length,
    agreements: agreementCompanies.size,
    toInvoice: toInvoiceCompanies.size,
    chaseLandlords: chaseProps.size,
    moveSchedule,
    replies: unreadReplies.length,
    drafts: draftRows.length,
    renewals: renewalRows.length,
  };
}
