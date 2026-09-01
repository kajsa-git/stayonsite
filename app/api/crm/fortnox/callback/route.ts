import { requireApprovedSession } from "@/lib/crm/auth";
import { exchangeFortnoxCode } from "@/lib/crm/fortnox";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/crm/oversikt?fortnox=error&message=${encodeURIComponent(error)}`, req.url));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get("fortnox_oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Invalid Fortnox OAuth callback" }, { status: 400 });
  }

  await exchangeFortnoxCode(code);
  const res = NextResponse.redirect(new URL("/crm/oversikt?fortnox=connected", req.url));
  res.cookies.set("fortnox_oauth_state", "", { maxAge: 0, path: "/api/crm/fortnox" });
  return res;
}
