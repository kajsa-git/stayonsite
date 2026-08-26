// Uppdatering av en förfrågan med alla grindar och sidoeffekter. Delas av
// PATCH /api/crm/requests/[id] och MCP-verktyget crm_update_request_status —
// en implementation av statusregler, dubbelboknings-spärr och länkåterkallelse.
import { and, eq, inArray, ne } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import {
  hasValidInvoiceDates,
  hasSignedMoveInContract,
  isMoveInChecklistComplete,
  isMoveOutChecklistComplete,
} from "./move-checklists";
import * as schema from "./schema";
import { matches, properties, requests, type Request } from "./schema";
import { indexProperty as defaultIndexProperty, indexRequest as defaultIndexRequest } from "./search-index";
import { revokeLinksForRequest as defaultRevokeLinks } from "./share-links";

type DB = LibSQLDatabase<typeof schema>;

export const VALID_REQUEST_STATUSES = ["incoming", "matching", "won", "invoiced", "lost", "archived"] as const;

// Whitelist redigerbara fält — server-ägda kolumner (id, requestNumber, companyId,
// gclid/gads-attribution, tidsstämplar) får aldrig skrivas över av klienten.
const ALLOWED = [
  "contactId", "city", "postalCode", "street", "addressQuery", "status", "persons",
  "accommodationFrom", "accommodationTo", "bedroomsFrom", "bedroomsTo", "bedsFrom", "bedsTo",
  "startDate", "endDate", "endDateOngoing", "projectDurationMonths", "budgetMax",
  "furnishedRequired", "garageRequired", "monthlyValue", "billingProjectId", "wonPropertyId",
  "lostReason", "notes", "moveInChecklist", "moveOutChecklist", "moveInDoneAt", "moveOutDoneAt",
  "renewalDismissedAt",
] as const;

export type RequestUpdateResult =
  | { ok: true; row: Request }
  | { ok: false; status: number; body: { error: string; message?: string } };

export async function applyRequestUpdate(
  id: string,
  body: Record<string, unknown>,
  opts?: {
    db?: DB;
    // Injicerbara sidoeffekter (som sendEmail i agreement-reminders) så att
    // logiken kan enhetstestas mot en tempfils-DB utan sökindex/share-links.
    indexRequest?: (id: string) => Promise<unknown>;
    indexProperty?: (id: string) => Promise<unknown>;
    revokeLinksForRequest?: (id: string) => Promise<unknown>;
    createInvoiceDraft?: (id: string, merged: Request) => Promise<Partial<Request>>;
  },
): Promise<RequestUpdateResult> {
  const db = opts?.db ?? defaultDb;
  const indexRequest = opts?.indexRequest ?? defaultIndexRequest;
  const indexProperty = opts?.indexProperty ?? defaultIndexProperty;
  const revokeLinksForRequest = opts?.revokeLinksForRequest ?? defaultRevokeLinks;

  if (body.status && !(VALID_REQUEST_STATUSES as readonly unknown[]).includes(body.status)) {
    return { ok: false, status: 400, body: { error: "Invalid status" } };
  }

  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) if (key in body) data[key] = body[key];

  // Hämta nuvarande rad för fält som inte alltid skickas med i body (datum, checklistor).
  const [existing] = await db.select().from(requests).where(eq(requests.id, id));
  if (!existing) return { ok: false, status: 404, body: { error: "Not found" } };
  const merged = { ...existing, ...data };

  // Hård grind: fakturering kräver period + signerat skarpt avtal.
  if (data.status === "invoiced" && !hasValidInvoiceDates(merged)) {
    return {
      ok: false,
      status: 400,
      body: { error: "missing_dates", message: "Ange inflytt- och utflyttsdatum (eller löpande) innan fakturering." },
    };
  }

  if (data.status === "invoiced" && !hasSignedMoveInContract(merged.moveInChecklist)) {
    return {
      ok: false,
      status: 400,
      body: { error: "missing_contract", message: "Markera signerat avtal innan fakturering." },
    };
  }

  let invoicePatch: Partial<Request> = {};
  if (data.status === "invoiced" && opts?.createInvoiceDraft) {
    try {
      invoicePatch = await opts.createInvoiceDraft(id, merged as Request);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Kunde inte skapa fakturautkast i Fortnox.";
      const status = typeof (e as { status?: unknown })?.status === "number" ? (e as { status: number }).status : 502;
      return {
        ok: false,
        status,
        body: { error: "fortnox_invoice_failed", message },
      };
    }
  }

  // En in-/avflytt får bara klarmarkeras när hela checklistan är avbockad.
  if (data.moveInDoneAt && !isMoveInChecklistComplete(merged.moveInChecklist)) {
    return {
      ok: false,
      status: 400,
      body: { error: "checklist_incomplete", message: "Bocka av hela inflyttningschecklistan först." },
    };
  }
  if (data.moveOutDoneAt && !isMoveOutChecklistComplete(merged.moveOutChecklist)) {
    return {
      ok: false,
      status: 400,
      body: { error: "checklist_incomplete", message: "Bocka av hela avflyttningschecklistan först." },
    };
  }

  const now = new Date().toISOString();
  const [row] = await db
    .update(requests)
    .set({ ...data, ...invoicePatch, updatedAt: now, ...(data.status ? { statusChangedAt: now } : {}) })
    .where(eq(requests.id, id))
    .returning();

  await indexRequest(id).catch((e) => console.error("search-index request:", e));

  // Avslutat ärende → inga externa länkar ska överleva. Kundens erbjudandesida
  // svarar 404 direkt efter Nej tack/Arkiverad.
  if (data.status === "lost" || data.status === "archived") {
    await revokeLinksForRequest(id).catch((e) => console.error("share-link revocation:", e));
  }

  // Dubbelboknings-spärr: när ett objekt vinns/fakureras, spegla det på objektet
  // och dra tillbaka andra företags öppna förslag på samma objekt.
  if (row?.wonPropertyId && (data.status === "won" || data.status === "invoiced")) {
    const propertyId = row.wonPropertyId;
    const newStatus = data.status === "invoiced" ? "rented" : "reserved";
    try {
      await db
        .update(properties)
        .set({ status: newStatus, updatedAt: now })
        .where(eq(properties.id, propertyId));

      if (data.status === "won") {
        // Stäng öppna förslag på samma objekt som tillhör ANDRA förfrågningar
        await db
          .update(matches)
          .set({ status: "rejected", followUpDate: null, notes: "Objektet togs av annan kund" })
          .where(
            and(
              eq(matches.propertyId, propertyId),
              ne(matches.requestId, id),
              inArray(matches.status, ["suggested", "sent"]),
            ),
          );
      }
      await indexProperty(propertyId);
    } catch (e) {
      console.error("won-property reflection:", e);
    }
  }

  // Avflytt klarmarkerad → objektet blir ledigt igen.
  if (data.moveOutDoneAt && row?.wonPropertyId) {
    try {
      await db
        .update(properties)
        .set({ status: "available", updatedAt: now })
        .where(eq(properties.id, row.wonPropertyId));
      await indexProperty(row.wonPropertyId);
    } catch (e) {
      console.error("move-out property release:", e);
    }
  }

  return { ok: true, row };
}
