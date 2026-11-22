import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { runPropertyIntakeNotificationSweep } from "@/lib/crm/property-intake-notifications";
import { runPropertyIntakeFollowUpSweep } from "@/lib/crm/property-intake-follow-up";
import { releaseDueHomeownerNudges } from "@/lib/crm/homeowner-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [notifications, followUps, nudges] = await Promise.allSettled([
      runPropertyIntakeNotificationSweep(),
      runPropertyIntakeFollowUpSweep(),
      releaseDueHomeownerNudges(),
    ]);
    if (notifications.status === "rejected") throw notifications.reason;
    if (followUps.status === "rejected") console.error("Bostadsuppföljningen kunde inte köras");
    if (nudges.status === "rejected") console.error("Registreringspåminnelserna kunde inte köras");
    const result = notifications.value;
    const intakeFollowUps = followUps.status === "fulfilled" ? followUps.value : { errors: 1 };
    const registrationReminders = nudges.status === "fulfilled" ? nudges.value : { errors: 1 };
    const failed = result.errors || intakeFollowUps.errors || nudges.status === "rejected";
    return NextResponse.json({ ...result, intakeFollowUps, registrationReminders }, { status: failed ? 503 : 200 });
  } catch {
    console.error("Property intake notification sweep failed");
    return NextResponse.json({ error: "Notification sweep failed" }, { status: 503 });
  }
}
