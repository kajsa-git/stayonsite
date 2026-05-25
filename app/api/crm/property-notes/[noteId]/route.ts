import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyNotes } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  await db.delete(propertyNotes).where(eq(propertyNotes.id, noteId));
  return NextResponse.json({ ok: true });
}
