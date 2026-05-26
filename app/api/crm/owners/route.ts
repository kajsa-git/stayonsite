import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexOwner } from "@/lib/crm/search-index";
import { owners, properties } from "@/lib/crm/schema";
import { asc, eq, like, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 100;

  let query = db
    .select({
      id: owners.id,
      ownerType: owners.ownerType,
      ownerArrangement: owners.ownerArrangement,
      name: owners.name,
      orgNr: owners.orgNr,
      contactPerson: owners.contactPerson,
      phone: owners.phone,
      email: owners.email,
      rating: owners.rating,
      followUpDate: owners.followUpDate,
      followUpReason: owners.followUpReason,
      followUpNote: owners.followUpNote,
      notes: owners.notes,
      createdAt: owners.createdAt,
      updatedAt: owners.updatedAt,
      propertyCount: sql<number>`count(${properties.id})`,
    })
    .from(owners)
    .leftJoin(properties, eq(properties.ownerId, owners.id));

  if (q) {
    const pat = `%${q}%`;
    query = query.where(
      or(
        like(owners.name, pat),
        like(owners.orgNr, pat),
        like(owners.contactPerson, pat),
        like(owners.phone, pat),
        like(owners.email, pat),
        like(owners.notes, pat),
      )
    ) as typeof query;
  }

  const rows = await query.groupBy(owners.id).orderBy(asc(owners.name)).limit(limit);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = body.id ?? nanoid();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const [row] = await db
    .insert(owners)
    .values({
      id,
      ownerType: body.ownerType ?? null,
      ownerArrangement: body.ownerArrangement ?? null,
      name,
      orgNr: body.orgNr ?? null,
      contactPerson: body.contactPerson ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      rating: body.rating ?? null,
      followUpDate: body.followUpDate ?? null,
      followUpReason: body.followUpReason ?? null,
      followUpNote: body.followUpNote ?? null,
      notes: body.notes ?? null,
    })
    .returning();
  await indexOwner(id).catch((e) => console.error("search-index owner:", e));
  return NextResponse.json(row, { status: 201 });
}
