import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, requests } from "@/lib/crm/schema";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Outstanding requests (someone looking for housing) — for reverse matching from a property.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();

  const conds = [inArray(requests.status, ["incoming", "matching"])];
  if (q) {
    const pat = `%${q}%`;
    conds.push(or(like(companies.name, pat), like(requests.city, pat))!);
  }

  const rows = await db
    .select({
      id: requests.id,
      requestNumber: requests.requestNumber,
      companyId: requests.companyId,
      companyName: companies.name,
      city: requests.city,
      status: requests.status,
      persons: requests.persons,
      budgetMax: requests.budgetMax,
    })
    .from(requests)
    .innerJoin(companies, eq(requests.companyId, companies.id))
    .where(and(...conds))
    .orderBy(desc(requests.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}
