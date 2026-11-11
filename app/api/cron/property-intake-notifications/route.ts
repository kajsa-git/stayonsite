import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { runPropertyIntakeNotificationSweep } from "@/lib/crm/property-intake-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runPropertyIntakeNotificationSweep();
    return NextResponse.json(result, { status: result.errors ? 503 : 200 });
  } catch {
    console.error("Property intake notification sweep failed");
    return NextResponse.json({ error: "Notification sweep failed" }, { status: 503 });
  }
}
