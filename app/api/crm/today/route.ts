import { requireApprovedSession } from "@/lib/crm/auth";
import { computeToday } from "@/lib/crm/today";
import { NextResponse } from "next/server";

// Dagens aktivitet — kompakt sammanfattning för Min dag. Aggregatet bor i
// src/lib/crm/today.ts (delas med MCP-verktyget crm_today).
export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await computeToday());
}
