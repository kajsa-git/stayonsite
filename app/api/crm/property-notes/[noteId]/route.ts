import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { propertyNotes } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  const [note] = await db.select({ source: propertyNotes.source }).from(propertyNotes).where(eq(propertyNotes.id, noteId));
  if (note?.source === "publication-consent") {
    return NextResponse.json({ error: "Underlag för publiceringsmedgivande bevaras i historiken." }, { status: 409 });
  }
  await db.delete(propertyNotes).where(eq(propertyNotes.id, noteId));
  return NextResponse.json({ ok: true });
}
