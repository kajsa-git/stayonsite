import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { matches } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const VALID = ["suggested", "sent", "accepted", "rejected"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status && !VALID.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...body };
  // Stamp sentAt when a suggestion is marked as sent
  if (body.status === "sent") data.sentAt = new Date().toISOString();

  const [row] = await db.update(matches).set(data).where(eq(matches.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(matches).where(eq(matches.id, id));
  return NextResponse.json({ ok: true });
}
