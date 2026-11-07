import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { recordLandlordSweepFailure, recordLandlordSweepSuccess } from "@/lib/crm/landlord-dialog-alerts";
import { runLandlordImageSweep } from "@/lib/crm/landlord-image-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runLandlordImageSweep();
    if (result.errors) throw new Error("En eller flera bilder kunde inte hanteras.");
    await recordLandlordSweepSuccess("images");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Landlord image sweep failed", error instanceof Error ? error.message : "unknown");
    await recordLandlordSweepFailure("images").catch(() => console.error("Landlord image alert failed"));
    return NextResponse.json({ error: "Image sweep failed" }, { status: 503 });
  }
}
