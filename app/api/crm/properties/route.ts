import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexProperty } from "@/lib/crm/search-index";
import { properties } from "@/lib/crm/schema";
import { like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  let query = db.select().from(properties);

  if (q) {
    const pat = `%${q}%`;
    query = query.where(
      or(
        like(properties.address, pat),
        like(properties.postalCode, pat),
        like(properties.city, pat),
        like(properties.ownerName, pat),
        like(properties.notes, pat)
      )
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
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  return NextResponse.json(row, { status: 201 });
}
