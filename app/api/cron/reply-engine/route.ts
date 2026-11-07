import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { runReplyEngine } from "@/lib/crm/reply-engine/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Svarsmotorn. Anropas av GitHub Actions (.github/workflows/reply-engine.yml) med
// samma hemlighet som mejlsynken, direkt efter att nya SMS kommit in, och av
// "Kör nu" i CRM:et med en vanlig inloggning.
async function authorized(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("authorization");
  for (const token of [process.env.REPLY_ENGINE_SECRET, process.env.EMAIL_SYNC_SECRET, process.env.QUALIFICATION_SYNC_SECRET]) {
    if (token && header === `Bearer ${token}`) return true;
  }
  return (await requireApprovedSession()) != null;
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const summary = await runReplyEngine();
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Reply engine failed", { error: message });
    return NextResponse.json({ success: false, error: message.slice(0, 500) }, { status: 500 });
  }
}
