import { NextRequest, NextResponse } from "next/server";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { runOwnerDedupe } from "@/lib/crm/owner-dedupe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Dagligen: slår ihop uthyrare som säkert är samma person. Sammanslagning sker bara
// när OWNER_DEDUPE_AUTO=1 är satt i Vercel; annars rapporteras bara vad som skulle hända.
export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const apply = process.env.OWNER_DEDUPE_AUTO === "1";
    const result = await runOwnerDedupe({ apply });
    return NextResponse.json({ apply, groups: result.groups.length, merged: result.merged.length });
  } catch {
    console.error("Owner dedupe failed");
    return NextResponse.json({ error: "Owner dedupe failed" }, { status: 503 });
  }
}
