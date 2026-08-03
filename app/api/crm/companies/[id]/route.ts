import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { getCompanyDetail } from "@/lib/crm/company-detail";
import { deleteCompanyDeep } from "@/lib/crm/cascade-delete";
import { indexCompany, removeCompanyCascadeFromIndex } from "@/lib/crm/search-index";
import { companies } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const detail = await getCompanyDetail(id);
  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Whitelist redigerbara kolumner — klienten får aldrig skriva över id/createdAt
  // eller injicera okända fält (mass-assignment).
  const ALLOWED = [
    "name", "orgNr", "category", "website", "leadSource", "rating", "invoiceEmail",
    "languages", "customerNumber", "street", "postalCode", "city", "country",
    "followUpDate", "followUpReason", "followUpTime", "assignedTo",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) if (key in body) data[key] = body[key];

  const [row] = await db
    .update(companies)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(companies.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await indexCompany(id).catch((e) => console.error("search-index company:", e));
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.transaction((tx) => deleteCompanyDeep(tx, id));
  await removeCompanyCascadeFromIndex(id).catch((e) => console.error("search-index company delete:", e));
  return NextResponse.json({ ok: true });
}
