// Dagligt svep: påminn uthyrare från bostadsregistreringen som inte signerat
// uthyrningsuppdraget (del 2 av formuläret). Logik och mejlcopy i
// src/lib/crm/agreement-reminders.ts; loggning i crm_agreement_reminders.
//
// Anropas av Vercel-cron (GET med Authorization: Bearer CRON_SECRET — kräver
// att CRON_SECRET är satt i Vercel) eller manuellt av inloggad CRM-användare.
import { NextRequest, NextResponse } from "next/server";
import { runAgreementReminderSweep } from "@/lib/crm/agreement-reminders";
import { requireApprovedSession } from "@/lib/crm/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorized(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("authorization");
  if (process.env.CRON_SECRET && header === `Bearer ${process.env.CRON_SECRET}`) return true;
  return (await requireApprovedSession()) != null;
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runAgreementReminderSweep();
  return NextResponse.json({ success: true, ...summary });
}
