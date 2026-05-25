import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { properties } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(properties)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(properties.id, id))
    .returning();
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(properties).where(eq(properties.id, id));
  await removeFromIndex("property", id).catch((e) => console.error("search-index property delete:", e));
  return NextResponse.json({ ok: true });
}
