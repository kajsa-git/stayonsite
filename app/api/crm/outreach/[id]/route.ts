import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { ownerOutreach } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const TERMINAL = ["bekraftad", "nej"];
const VALID_STATUS = ["ej_kontaktad", "kontaktad", "i_dialog", "bekraftad", "nej"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};

  if (typeof body.status === "string") {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
    // Terminal status avslutar rundan; återöppning rensar avslutsdatum.
    if (TERMINAL.includes(body.status)) {
      patch.concludedAt = new Date().toISOString();
      patch.nextFollowUpDate = null;
      patch.nextFollowUpReason = null;
    } else {
      patch.concludedAt = null;
    }
  }
  if ("nextFollowUpDate" in body) patch.nextFollowUpDate = body.nextFollowUpDate || null;
  if ("nextFollowUpReason" in body) patch.nextFollowUpReason = body.nextFollowUpReason || null;
  if ("note" in body) patch.note = body.note || null;
  if ("requestId" in body) patch.requestId = body.requestId || null;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [row] = await db.update(ownerOutreach).set(patch).where(eq(ownerOutreach.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(ownerOutreach).where(eq(ownerOutreach.id, id));
  return NextResponse.json({ ok: true });
}
