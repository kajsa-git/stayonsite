import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { normalizePhoneForStorage } from "@/lib/crm/phone-links";
import { deleteOwnerDeep } from "@/lib/crm/cascade-delete";
import { indexOwner, indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { reindexLinkedProperties } from "@/lib/crm/owners";
import { owners, properties } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET — uthyrarkortet: ägaren + kompakt objektlista i ett svar (Min dag-dialogen).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [owner] = await db.select().from(owners).where(eq(owners.id, id));
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const props = await db
    .select({
      id: properties.id,
      address: properties.address,
      city: properties.city,
      status: properties.status,
      published: properties.published,
      prospektPublished: properties.prospektPublished,
      slug: properties.slug,
      bedrooms: properties.bedrooms,
      beds: properties.beds,
      rentIn: properties.rentIn,
      rentOut: properties.rentOut,
    })
    .from(properties)
    .where(eq(properties.ownerId, id));
  return NextResponse.json({ ...owner, properties: props });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Whitelist redigerbara fält — klienten får aldrig skriva över id/createdAt.
  const ALLOWED = [
    "ownerType", "ownerArrangement", "name", "orgNr", "contactPerson", "phone", "email",
    "rating", "followUpDate", "followUpReason", "followUpNote", "notes",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) if (key in body) data[key] = body[key];
  // name är NOT NULL — tillåt aldrig att tömma den (annars constraint-fel → 500).
  if ("name" in data) {
    const nm = String(data.name ?? "").trim();
    if (nm) data.name = nm;
    else delete data.name;
  }
  // Telefonnummer lagras kanoniskt som E.164 (+46…).
  if ("phone" in data) data.phone = normalizePhoneForStorage(data.phone as string | null);

  const [row] = await db
    .update(owners)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(owners.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Promise.all([
    indexOwner(id).catch((e) => console.error("search-index owner:", e)),
    reindexLinkedProperties(id, indexProperty).catch((e) => console.error("search-index owner properties:", e)),
  ]);
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const linked = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, id));
  await db.transaction((tx) => deleteOwnerDeep(tx, id));
  await Promise.all([
    removeFromIndex("owner", id).catch((e) => console.error("search-index owner delete:", e)),
    ...linked.map((property) => indexProperty(property.id).catch((e) => console.error("search-index property:", e))),
  ]);
  return NextResponse.json({ ok: true });
}
