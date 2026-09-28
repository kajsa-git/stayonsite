import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { readReviewInput, reviewPropertyContent } from "@/lib/crm/property-content-review";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const status = await reviewPropertyContent(id, { force: true });
  if (status === "missing") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const input = await readReviewInput(id);
  return NextResponse.json({ status, reasons: input?.property.contentReviewReport?.reasons ?? [] });
}
