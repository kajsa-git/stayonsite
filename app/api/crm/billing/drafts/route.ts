import { requireApprovedSession } from "@/lib/crm/auth";
import { billingErrorResponse, createBillingDraft } from "@/lib/crm/billing";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await createBillingDraft(await req.json(), session.user.id)); }
  catch (error) { const result = billingErrorResponse(error); return NextResponse.json(result.body, { status: result.status }); }
}
