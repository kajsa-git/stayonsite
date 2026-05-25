import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexRequest, removeFromIndex } from "@/lib/crm/search-index";
import { requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["incoming", "matching", "won", "invoiced", "lost", "archived"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const [row] = await db
    .update(requests)
    .set({ ...body, updatedAt: now, ...(body.status ? { statusChangedAt: now } : {}) })
    .where(eq(requests.id, id))
    .returning();

  await indexRequest(id).catch((e) => console.error("search-index request:", e));
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(requests).where(eq(requests.id, id));
  await removeFromIndex("request", id).catch((e) => console.error("search-index request delete:", e));
  return NextResponse.json({ ok: true });
}
