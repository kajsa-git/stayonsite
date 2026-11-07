import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { learnStart, learnStep } from "@/lib/crm/reply-engine/learn";
import { setSetting } from "@/lib/crm/reply-engine/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// POST { start: true } — dela upp historiken i delar.
// POST {}              — analysera nästa delar; anropas tills finished = true.
export async function POST(req: NextRequest) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  try {
    const progress = body.start === true ? await learnStart({ db }) : await learnStep({ db });
    return NextResponse.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Reply engine learning failed", { error: message });
    await setSetting(db, "learn_status", `${new Date().toISOString()} fel: ${message.slice(0, 300)}`);
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 500 });
  }
}
