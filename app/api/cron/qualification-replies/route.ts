import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { runCorporateQualificationReplySweep } from "@/lib/crm/corporate-qualification-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorized(req: NextRequest): Promise<boolean> {
  const token = process.env.QUALIFICATION_SYNC_SECRET;
  if (token && req.headers.get("authorization") === `Bearer ${token}`) return true;
  return (await requireApprovedSession()) != null;
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const summary = await runCorporateQualificationReplySweep();
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Qualification reply cron failed", { error: message });
    return NextResponse.json({ success: false, error: message.slice(0, 500) }, { status: 500 });
  }
}
