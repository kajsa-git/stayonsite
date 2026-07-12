// DELETE = återkalla länken (soft: revoked_at sätts, raden består som historik).
// Token-URL:en slutar fungera omedelbart; ny länk skapas via POST /share-links.
import { requireApprovedSession } from "@/lib/crm/auth";
import { revokeShareLink } from "@/lib/crm/share-links";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await revokeShareLink(id);
  return NextResponse.json({ ok: true });
}
