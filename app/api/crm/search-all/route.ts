import { requireApprovedSession } from "@/lib/crm/auth";
import { searchCrm } from "@/lib/crm/search-query";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await searchCrm(req.nextUrl.searchParams.get("q") ?? "");
  return NextResponse.json(rows);
}
