import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { moveOutSmsSource, type MoveOutRecipient } from "@/lib/crm/move-out-sms";
import { companies, contacts, outboxMessages, owners, properties, requests } from "@/lib/crm/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// In- och avflyttningar för aktiva uppdrag (won/invoiced).
// Inflytt = uppdrag med startdatum. Avflytt = uppdrag med slutdatum (ej löpande).
export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ request: requests, company: companies, property: properties, owner: owners })
    .from(requests)
    .innerJoin(companies, eq(requests.companyId, companies.id))
    .leftJoin(properties, eq(requests.wonPropertyId, properties.id))
    .leftJoin(owners, eq(properties.ownerId, owners.id))
    .where(inArray(requests.status, ["won", "invoiced"]));

  const moveOutRows = rows.filter((r) => r.request.endDate && !r.request.endDateOngoing);
  const companyIds = [...new Set(moveOutRows.map((r) => r.request.companyId))];
  const sources = moveOutRows.flatMap((r) => [moveOutSmsSource(r.request.id, "tenant"), moveOutSmsSource(r.request.id, "landlord")]);
  const [contactRows, smsRows] = await Promise.all([
    companyIds.length ? db.select({ id: contacts.id, companyId: contacts.companyId, name: contacts.name,
      phone: contacts.phone, isPrimary: contacts.isPrimary }).from(contacts).where(inArray(contacts.companyId, companyIds)) : [],
    sources.length ? db.select({ id: outboxMessages.id, source: outboxMessages.source,
      status: outboxMessages.status, toPhone: outboxMessages.toPhone, sentAt: outboxMessages.sentAt,
      deliveredAt: outboxMessages.deliveredAt }).from(outboxMessages)
      .where(inArray(outboxMessages.source, sources)).orderBy(desc(outboxMessages.createdAt), desc(sql`rowid`)) : [],
  ]);

  const base = (r: (typeof rows)[number]) => ({
    requestId: r.request.id,
    requestNumber: r.request.requestNumber,
    companyId: r.company.id,
    companyName: r.company.name,
    propertyId: r.property?.id ?? null,
    address: r.property?.address ?? r.request.street ?? null,
    city: r.property?.city ?? r.request.city ?? null,
    status: r.request.status,
  });

  const moveIns = rows
    .filter((r) => r.request.startDate)
    .map((r) => ({
      ...base(r),
      date: r.request.startDate as string,
      checklist: r.request.moveInChecklist ?? [],
      doneAt: r.request.moveInDoneAt ?? null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const moveOuts = moveOutRows
    .map((r) => {
      const statusFor = (recipient: MoveOutRecipient) => {
        const messages = smsRows.filter((m) => m.source === moveOutSmsSource(r.request.id, recipient));
        return messages.length ? { latest: messages[0], hasSent: messages.some((m) => m.status === "sent") } : null;
      };
      return {
        ...base(r),
        date: r.request.endDate as string,
        checklist: r.request.moveOutChecklist ?? [],
        doneAt: r.request.moveOutDoneAt ?? null,
        smsAddress: r.property?.address ?? null,
        requestContactId: r.request.contactId ?? null,
        contacts: contactRows.filter((c) => c.companyId === r.request.companyId)
          .map(({ id, name, phone, isPrimary }) => ({ id, name, phone, isPrimary })),
        owner: r.owner ? { id: r.owner.id, name: r.owner.name, phone: r.owner.phone } : null,
        messages: { tenant: statusFor("tenant"), landlord: statusFor("landlord") },
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ moveIns, moveOuts });
}
