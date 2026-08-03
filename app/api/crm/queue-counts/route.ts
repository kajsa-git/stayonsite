import { requireApprovedSession } from "@/lib/crm/auth";
import { computeQueueCounts } from "@/lib/crm/queue-counts";
import { NextResponse } from "next/server";

// Badge-räknarna — aggregatet bor i src/lib/crm/queue-counts.ts (delas med MCP).
export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await computeQueueCounts());
}
