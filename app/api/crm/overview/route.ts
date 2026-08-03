import { requireApprovedSession } from "@/lib/crm/auth";
import { computeOverview } from "@/lib/crm/overview";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const overview = await computeOverview();
  return NextResponse.json({ ...overview, generatedBy: session.user?.email ?? null });
}
