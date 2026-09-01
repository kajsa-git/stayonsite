import { requireApprovedSession } from "@/lib/crm/auth";
import { getFortnoxConnectionStatus } from "@/lib/crm/fortnox";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getFortnoxConnectionStatus());
}
