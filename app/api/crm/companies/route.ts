import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, contacts, notes, requests } from "@/lib/crm/schema";
import { asc, desc, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 50;

  let query = db.select().from(companies);

  if (q) {
    query = query.where(
      or(ilike(companies.name, `%${q}%`), ilike(companies.orgNr, `%${q}%`))
    ) as typeof query;
  }

  const rows = await query.orderBy(asc(companies.name)).limit(limit);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = nanoid();
  const [row] = await db
    .insert(companies)
    .values({ id, ...body })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
