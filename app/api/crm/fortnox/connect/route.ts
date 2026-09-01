import { requireApprovedSession } from "@/lib/crm/auth";
import { buildFortnoxAuthorizationUrl } from "@/lib/crm/fortnox";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = nanoid(32);
  const res = NextResponse.redirect(buildFortnoxAuthorizationUrl(state));
  res.cookies.set("fortnox_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/api/crm/fortnox",
  });
  return res;
}
