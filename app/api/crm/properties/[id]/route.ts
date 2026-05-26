import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexOwner, indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { normalizePropertyWriteBody } from "@/lib/crm/owners";
import { properties } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const [existing] = await db.select().from(properties).where(eq(properties.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const values = await normalizePropertyWriteBody(body, existing);
  const [row] = await db
    .update(properties)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(properties.id, id))
    .returning();
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  if (row?.ownerId) {
    await indexOwner(row.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, id));
  await db.delete(properties).where(eq(properties.id, id));
  await removeFromIndex("property", id).catch((e) => console.error("search-index property delete:", e));
  if (existing?.ownerId) {
    await indexOwner(existing.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  return NextResponse.json({ ok: true });
}
