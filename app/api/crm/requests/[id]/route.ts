import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["incoming", "matching", "invoiced", "lost", "archived"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [row] = await db
    .update(requests)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(requests.id, id))
    .returning();

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(requests).where(eq(requests.id, id));
  return NextResponse.json({ ok: true });
}
