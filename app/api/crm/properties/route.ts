import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { properties } from "@/lib/crm/schema";
import { ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  let query = db.select().from(properties);

  if (q) {
    query = query.where(
      or(ilike(properties.address, `%${q}%`), ilike(properties.city, `%${q}%`))
    ) as typeof query;
  }

  const rows = await query;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = nanoid();
  const [row] = await db.insert(properties).values({ id, ...body }).returning();
  return NextResponse.json(row, { status: 201 });
}
