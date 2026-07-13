// DELETE = annullera en avtalssignering. Att återkalla en LÄNK upphäver inte
// ett redan signerat avtal — det här gör det (testsigneringar, ånger, fel person).
// Destruktivt: klienten kräver bekräftelse innan anropet. Parten möts av gaten
// igen nästa gång de öppnar sin länk.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { agreementAcceptances } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(agreementAcceptances).where(eq(agreementAcceptances.id, id));
  return NextResponse.json({ ok: true });
}
