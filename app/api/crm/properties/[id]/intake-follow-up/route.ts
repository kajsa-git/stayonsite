import { requireApprovedSession } from "@/lib/crm/auth";
import { getPropertyIntakeFollowUp } from "@/lib/crm/property-intake-follow-up";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  return NextResponse.json(await getPropertyIntakeFollowUp(id));
}
