import { requireApprovedSession } from "@/lib/crm/auth";
import { listOpenRequests } from "@/lib/crm/open-requests";
import { NextRequest, NextResponse } from "next/server";

// Outstanding requests (someone looking for housing) — for reverse matching from a property.
// Listlogiken bor i src/lib/crm/open-requests.ts (delas med MCP-verktyget crm_open_requests).
export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await listOpenRequests({ q: req.nextUrl.searchParams.get("q") ?? undefined }));
}
