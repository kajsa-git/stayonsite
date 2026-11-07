import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { runLandlordDialogSweep } from "@/lib/crm/landlord-dialog-workflow";
import { recordLandlordSweepFailure, recordLandlordSweepSuccess } from "@/lib/crm/landlord-dialog-alerts";
import { sendPendingLandlordFollowUpQuestions } from "@/lib/crm/landlord-followup-notices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const full = req.nextUrl.pathname.endsWith("landlord-dialog-replies-full");
  const kind = full ? "full" : "minute";
  try {
    // Once an hour, read enrolled threads to catch messages that were missed
    // during a prolonged outage. Normal minute checks use one mailbox search.
    const result = await runLandlordDialogSweep({ full });
    if (result.errors) throw new Error("En eller flera dialoger kunde inte kontrolleras.");
    await sendPendingLandlordFollowUpQuestions("mejl");
    await recordLandlordSweepSuccess(kind);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Landlord reply sweep failed", error instanceof Error ? error.message : "unknown");
    await recordLandlordSweepFailure(kind).catch((alertError) => console.error("Landlord sweep alert failed", alertError instanceof Error ? alertError.message : "unknown"));
    return NextResponse.json({ error: "Reply sweep failed" }, { status: 503 });
  }
}
