import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, contacts } from "@/lib/crm/schema";
import { ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const rows = await db
    .select({
      id: companies.id,
      name: companies.name,
      orgNr: companies.orgNr,
      category: companies.category,
    })
    .from(companies)
    .where(
      or(
        ilike(companies.name, `%${q}%`),
        ilike(companies.orgNr, `%${q}%`),
        ilike(companies.category, `%${q}%`)
      )
    )
    .limit(10);

  return NextResponse.json(rows);
}
