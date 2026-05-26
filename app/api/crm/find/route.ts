import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, contacts, notes, requests } from "@/lib/crm/schema";
import { and, asc, eq, gte, inArray, like, lte, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const SELECT = {
  id: companies.id,
  name: companies.name,
  orgNr: companies.orgNr,
  followUpDate: companies.followUpDate,
  followUpReason: companies.followUpReason,
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const q = p.get("q")?.trim();
  const status = p.get("status")?.trim();
  const city = p.get("city")?.trim();
  const followUpFrom = p.get("followUpFrom")?.trim();
  const followUpTo = p.get("followUpTo")?.trim();

  // Each active filter contributes a set of matching company ids; we intersect them (AND).
  const idSets: Set<string>[] = [];

  const companyConds = [];
  if (followUpFrom) companyConds.push(gte(companies.followUpDate, followUpFrom));
  if (followUpTo) companyConds.push(lte(companies.followUpDate, followUpTo));
  if (companyConds.length) {
    const rows = await db.select({ id: companies.id }).from(companies).where(and(...companyConds));
    idSets.push(new Set(rows.map((r) => r.id)));
  }

  const reqConds = [];
  if (status) reqConds.push(eq(requests.status, status));
  if (city) reqConds.push(like(requests.city, `%${city}%`));
  if (reqConds.length) {
    const rows = await db.select({ companyId: requests.companyId }).from(requests).where(and(...reqConds));
    idSets.push(new Set(rows.map((r) => r.companyId)));
  }

  if (q && q.length >= 2) {
    const pat = `%${q}%`;
    const [c, ct, n, r] = await Promise.all([
      db
        .select({ id: companies.id })
        .from(companies)
        .where(
          or(
            like(companies.name, pat),
            like(companies.orgNr, pat),
            like(companies.website, pat),
            like(companies.followUpReason, pat)
          )
        ),
      db
        .select({ companyId: contacts.companyId })
        .from(contacts)
        .where(or(like(contacts.name, pat), like(contacts.phone, pat), like(contacts.email, pat))),
      db.select({ companyId: notes.companyId }).from(notes).where(like(notes.content, pat)),
      db
        .select({ companyId: requests.companyId })
        .from(requests)
        .where(
          or(
            like(requests.city, pat),
            like(requests.postalCode, pat),
            like(requests.street, pat),
            like(requests.addressQuery, pat),
            like(requests.billingProjectId, pat),
            like(requests.notes, pat),
            like(requests.lostReason, pat),
          )
        ),
    ]);
    const set = new Set<string>();
    c.forEach((x) => set.add(x.id));
    [...ct, ...n, ...r].forEach((x) => set.add(x.companyId));
    idSets.push(set);
  }

  // No filters → return everything (capped), alphabetical.
  if (idSets.length === 0) {
    const rows = await db.select(SELECT).from(companies).orderBy(asc(companies.name)).limit(200);
    return NextResponse.json(rows);
  }

  let intersection = idSets[0];
  for (let i = 1; i < idSets.length; i++) {
    intersection = new Set([...intersection].filter((id) => idSets[i].has(id)));
  }
  const ids = [...intersection];
  if (ids.length === 0) return NextResponse.json([]);

  const rows = await db.select(SELECT).from(companies).where(inArray(companies.id, ids)).orderBy(asc(companies.name));
  return NextResponse.json(rows);
}
