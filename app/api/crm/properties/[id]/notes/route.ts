import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyNotes } from "@/lib/crm/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(propertyNotes)
    .where(eq(propertyNotes.propertyId, id))
    .orderBy(desc(propertyNotes.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (!body.channel || !body.content) {
    return NextResponse.json({ error: "channel and content required" }, { status: 400 });
  }
  const user = session.user as typeof session.user & { id: string };
  const [row] = await db
    .insert(propertyNotes)
    .values({ id: nanoid(), propertyId: id, channel: body.channel, content: body.content, authorId: user.id })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
