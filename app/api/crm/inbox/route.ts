// Inkorgen i CRM-UI:t: inkommande iMessage/SMS-svar som Mac-agenten läst in.
// GET ?unread=1 → bara olästa; annars senaste 100. Listlogiken bor i
// src/lib/crm/inbox-list.ts (delas med MCP-verktyget crm_inbox).
import { requireApprovedSession } from "@/lib/crm/auth";
import { listInbox } from "@/lib/crm/inbox-list";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "1";
  return NextResponse.json(await listInbox({ unreadOnly }));
}
