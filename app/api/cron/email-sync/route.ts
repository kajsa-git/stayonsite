import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { runMailboxSync } from "@/lib/crm/email-sync";
import { GmailAuthError } from "@/lib/crm/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Schemat i vercel.json använder CRON_SECRET. Manuell körning finns i GitHub Actions
// och via "Synka nu" i Min dag med en godkänd inloggning.
async function authorized(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("authorization");
  for (const token of [process.env.CRON_SECRET, process.env.EMAIL_SYNC_SECRET, process.env.QUALIFICATION_SYNC_SECRET]) {
    if (token && header === `Bearer ${token}`) return true;
  }
  return (await requireApprovedSession()) != null;
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const summary = await runMailboxSync();
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Email sync failed", { error: message });
    const status = error instanceof GmailAuthError ? 403 : 500;
    return NextResponse.json({ success: false, error: message.slice(0, 500) }, { status });
  }
}
