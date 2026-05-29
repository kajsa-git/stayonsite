import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, properties, requests } from "@/lib/crm/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// In- och avflyttningar för aktiva uppdrag (won/invoiced).
// Inflytt = uppdrag med startdatum. Avflytt = uppdrag med slutdatum (ej löpande).
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ request: requests, company: companies, property: properties })
    .from(requests)
    .innerJoin(companies, eq(requests.companyId, companies.id))
    .leftJoin(properties, eq(requests.wonPropertyId, properties.id))
    .where(inArray(requests.status, ["won", "invoiced"]));

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

  const moveOuts = rows
    .filter((r) => r.request.endDate && !r.request.endDateOngoing)
    .map((r) => ({
      ...base(r),
      date: r.request.endDate as string,
      checklist: r.request.moveOutChecklist ?? [],
      doneAt: r.request.moveOutDoneAt ?? null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ moveIns, moveOuts });
}
