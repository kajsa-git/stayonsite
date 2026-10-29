import { requireApprovedSession } from "@/lib/crm/auth";
import { billingErrorResponse, getBillingOverview, saveBillingPlan } from "@/lib/crm/billing";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await getBillingOverview()); }
  catch (error) { const result = billingErrorResponse(error); return NextResponse.json(result.body, { status: result.status }); }
}

export async function POST(req: NextRequest) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await saveBillingPlan(await req.json()), { status: 201 }); }
  catch (error) { const result = billingErrorResponse(error); return NextResponse.json(result.body, { status: result.status }); }
}
