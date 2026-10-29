import { requireApprovedSession } from "@/lib/crm/auth";
import { normalizeCompanyFields } from "@/lib/crm/company-name";
import { db } from "@/lib/crm/db";
import { indexCompany } from "@/lib/crm/search-index";
import { companies, contacts, requests } from "@/lib/crm/schema";
import { asc, desc, inArray, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

const OPEN_STATUSES = ["incoming", "matching", "won"];

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  const summary = req.nextUrl.searchParams.get("summary");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 50;

  let query = db.select().from(companies);
  if (q) {
    query = query.where(
      or(like(companies.name, `%${q}%`), like(companies.orgNr, `%${q}%`))
    ) as typeof query;
  }
  const rows = await query.orderBy(asc(companies.name)).limit(limit);

  if (!summary || rows.length === 0) return NextResponse.json(rows);

  // Keep each active request's needs together, including when a company has several.
  const ids = rows.map((r) => r.id);
  const [reqRows, contactRows] = await Promise.all([
    db
      .select({
        id: requests.id,
        requestNumber: requests.requestNumber,
        companyId: requests.companyId,
        status: requests.status,
        city: requests.city,
        persons: requests.persons,
        bedsFrom: requests.bedsFrom,
        bedsTo: requests.bedsTo,
        bedroomsFrom: requests.bedroomsFrom,
        bedroomsTo: requests.bedroomsTo,
      })
      .from(requests)
      .where(inArray(requests.companyId, ids))
      .orderBy(desc(requests.requestNumber), asc(requests.id)),
    db
      .select({ companyId: contacts.companyId, name: contacts.name, phone: contacts.phone, isPrimary: contacts.isPrimary })
      .from(contacts)
      .where(inArray(contacts.companyId, ids)),
  ]);

  const reqAgg: Record<string, { total: number; activeRequests: typeof reqRows }> = {};
  for (const r of reqRows) {
    const a = (reqAgg[r.companyId] ??= { total: 0, activeRequests: [] });
    a.total++;
    if (OPEN_STATUSES.includes(r.status)) a.activeRequests.push(r);
  }
  const primary: Record<string, { name: string | null; phone: string | null }> = {};
  for (const c of contactRows) {
    if (!primary[c.companyId] || c.isPrimary) primary[c.companyId] = { name: c.name, phone: c.phone };
  }

  const enriched = rows.map((r) => ({
    ...r,
    requestCount: reqAgg[r.id]?.total ?? 0,
    openRequestCount: reqAgg[r.id]?.activeRequests.length ?? 0,
    activeRequests: reqAgg[r.id]?.activeRequests ?? [],
    primaryContactName: primary[r.id]?.name ?? null,
    primaryContactPhone: primary[r.id]?.phone ?? null,
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = normalizeCompanyFields(await req.json());
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const id = body.id ?? nanoid();
  const [row] = await db
    .insert(companies)
    .values({ ...body, id, name })
    .returning();
  await indexCompany(id).catch((e) => console.error("search-index company:", e));
  return NextResponse.json(row, { status: 201 });
}
