import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import {
  hasValidInvoiceDates,
  isMoveInChecklistComplete,
  isMoveOutChecklistComplete,
} from "@/lib/crm/move-checklists";
import { deleteRequestDeep } from "@/lib/crm/cascade-delete";
import { indexProperty, indexRequest, removeFromIndex } from "@/lib/crm/search-index";
import { matches, properties, requests } from "@/lib/crm/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["incoming", "matching", "won", "invoiced", "lost", "archived"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

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
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) if (key in body) data[key] = body[key];

  // Hämta nuvarande rad för fält som inte alltid skickas med i body (datum, checklistor).
  const [existing] = await db.select().from(requests).where(eq(requests.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const merged = { ...existing, ...data };

  // Hård grind: fakturering kräver startdatum + (slutdatum ELLER löpande).
  if (data.status === "invoiced" && !hasValidInvoiceDates(merged)) {
    return NextResponse.json(
      { error: "missing_dates", message: "Ange inflytt- och utflyttsdatum (eller löpande) innan fakturering." },
      { status: 400 },
    );
  }

  // En in-/avflytt får bara klarmarkeras när hela checklistan är avbockad.
  if (data.moveInDoneAt && !isMoveInChecklistComplete(merged.moveInChecklist)) {
    return NextResponse.json(
      { error: "checklist_incomplete", message: "Bocka av hela inflyttningschecklistan först." },
      { status: 400 },
    );
  }
  if (data.moveOutDoneAt && !isMoveOutChecklistComplete(merged.moveOutChecklist)) {
    return NextResponse.json(
      { error: "checklist_incomplete", message: "Bocka av hela avflyttningschecklistan först." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const [row] = await db
    .update(requests)
    .set({ ...data, updatedAt: now, ...(data.status ? { statusChangedAt: now } : {}) })
    .where(eq(requests.id, id))
    .returning();

  await indexRequest(id).catch((e) => console.error("search-index request:", e));

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

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.transaction((tx) => deleteRequestDeep(tx, id));
  await removeFromIndex("request", id).catch((e) => console.error("search-index request delete:", e));
  return NextResponse.json({ ok: true });
}
