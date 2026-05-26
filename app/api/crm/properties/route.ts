import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexOwner, indexProperty } from "@/lib/crm/search-index";
import { mergeOwnerIntoProperty, normalizePropertyWriteBody } from "@/lib/crm/owners";
import { owners, properties } from "@/lib/crm/schema";
import { and, eq, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  let query = db
    .select({ property: properties, owner: owners })
    .from(properties)
    .leftJoin(owners, eq(properties.ownerId, owners.id));

  const conditions = [];
  if (ownerId) conditions.push(eq(properties.ownerId, ownerId));
  if (q) {
    const pat = `%${q}%`;
    conditions.push(
      or(
        like(properties.address, pat),
        like(properties.postalCode, pat),
        like(properties.city, pat),
        like(properties.ownerName, pat),
        like(properties.notes, pat),
        like(owners.name, pat),
        like(owners.phone, pat),
        like(owners.email, pat),
        like(owners.contactPerson, pat)
      )
    );
  }
  if (conditions.length) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const rows = await query;
  return NextResponse.json(rows.map(mergeOwnerIntoProperty));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = nanoid();
  const values = await normalizePropertyWriteBody(body);
  const [row] = await db.insert(properties).values({ id, ...values }).returning();
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  if (row?.ownerId) await indexOwner(row.ownerId).catch((e) => console.error("search-index owner:", e));
  return NextResponse.json(row, { status: 201 });
}
