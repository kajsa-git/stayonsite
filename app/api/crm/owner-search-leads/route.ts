import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { ownerSearchCities } from "@/lib/crm/owner-search-leads";
import { owners } from "@/lib/crm/schema";
import { asc, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    id: owners.id,
    name: owners.name,
    contactPerson: owners.contactPerson,
    phone: owners.phone,
    email: owners.email,
    notes: owners.notes,
  }).from(owners).where(isNotNull(owners.notes)).orderBy(asc(owners.name));

  return NextResponse.json(rows.flatMap(({ notes, ...owner }) => {
    const cities = ownerSearchCities(notes);
    return cities.length ? [{ ...owner, cities }] : [];
  }));
}
