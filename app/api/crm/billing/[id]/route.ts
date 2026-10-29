import { requireApprovedSession } from "@/lib/crm/auth";
import { billingErrorResponse, saveBillingPlan } from "@/lib/crm/billing";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireApprovedSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await saveBillingPlan(await req.json(), (await params).id)); }
  catch (error) { const result = billingErrorResponse(error); return NextResponse.json(result.body, { status: result.status }); }
}
