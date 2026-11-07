import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { recordLandlordSweepFailure, recordLandlordSweepSuccess } from "@/lib/crm/landlord-dialog-alerts";
import { runLandlordSmsSweep } from "@/lib/crm/landlord-sms-workflow";
import { sendPendingLandlordFollowUpQuestions } from "@/lib/crm/landlord-followup-notices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runLandlordSmsSweep();
    if (result.errors) throw new Error("En eller flera SMS-dialoger kunde inte kontrolleras.");
    await sendPendingLandlordFollowUpQuestions("sms");
    await recordLandlordSweepSuccess("sms");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Landlord SMS sweep failed", error instanceof Error ? error.message : "unknown");
    await recordLandlordSweepFailure("sms").catch(() => console.error("Landlord SMS alert failed"));
    return NextResponse.json({ error: "SMS reply sweep failed" }, { status: 503 });
  }
}
