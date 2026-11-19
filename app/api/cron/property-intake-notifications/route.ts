import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { runPropertyIntakeNotificationSweep } from "@/lib/crm/property-intake-notifications";
import { runPropertyIntakeFollowUpSweep } from "@/lib/crm/property-intake-follow-up";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [notifications, followUps] = await Promise.allSettled([
      runPropertyIntakeNotificationSweep(),
      runPropertyIntakeFollowUpSweep(),
    ]);
    if (notifications.status === "rejected") throw notifications.reason;
    if (followUps.status === "rejected") console.error("Bostadsuppföljningen kunde inte köras");
    const result = notifications.value;
    const intakeFollowUps = followUps.status === "fulfilled" ? followUps.value : { errors: 1 };
    return NextResponse.json({ ...result, intakeFollowUps }, { status: result.errors || intakeFollowUps.errors ? 503 : 200 });
  } catch {
    console.error("Property intake notification sweep failed");
    return NextResponse.json({ error: "Notification sweep failed" }, { status: 503 });
  }
}
