import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexNote, removeFromIndex } from "@/lib/crm/search-index";
import { notes } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Partial<{ content: string; channel: string }> = {};
  if (typeof body.content === "string") data.content = body.content;
  if (typeof body.channel === "string") data.channel = body.channel;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [row] = await db.update(notes).set(data).where(eq(notes.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await indexNote(id).catch((e) => console.error("search-index note:", e));
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(notes).where(eq(notes.id, id));
  await removeFromIndex("note", id).catch((e) => console.error("search-index note delete:", e));
  return NextResponse.json({ ok: true });
}
