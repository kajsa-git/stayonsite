import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { deleteOwnerDeep } from "@/lib/crm/cascade-delete";
import { indexOwner, indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { reindexLinkedProperties } from "@/lib/crm/owners";
import { owners, properties } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(owners)
    .set({ ...body, updatedAt: new Date().toISOString() })
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
