import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { previewRecent } from "@/lib/crm/reply-engine/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// POST { limit } — visar vad motorn skulle göra med de senaste meddelandena.
// Skriver och skickar ingenting.
export async function POST(req: NextRequest) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const limit = typeof body.limit === "number" ? body.limit : 5;
  return NextResponse.json({ results: await previewRecent({ db, limit }) });
}
