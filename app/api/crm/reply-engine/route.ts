import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { historyStats } from "@/lib/crm/reply-engine/learn";
import { ENGINE_MODES, getSettings, listDecisions, setMode, setSetting, type EngineMode } from "@/lib/crm/reply-engine/store";

export const dynamic = "force-dynamic";

// GET — läge, playbook, historikens storlek och de senaste besluten.
export async function GET() {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [settings, decisions, stats] = await Promise.all([getSettings(db), listDecisions(db, 150), historyStats(db)]);
  return NextResponse.json({ settings, decisions, stats });
}

// PATCH { mode } | { playbook } — byt läge eller spara Kajsas ändringar i playbooken.
export async function PATCH(req: NextRequest) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  if (typeof body.mode === "string") {
    if (!ENGINE_MODES.includes(body.mode as EngineMode)) return NextResponse.json({ error: "Ogiltigt läge" }, { status: 400 });
    return NextResponse.json({ settings: await setMode(db, body.mode as EngineMode) });
  }
  if (typeof body.playbook === "string") {
    if (body.playbook.length > 40_000) return NextResponse.json({ error: "Playbooken är för lång" }, { status: 400 });
    await setSetting(db, "playbook", body.playbook);
    await setSetting(db, "playbook_updated_at", new Date().toISOString());
    return NextResponse.json({ settings: await getSettings(db) });
  }
  return NextResponse.json({ error: "Ange mode eller playbook" }, { status: 400 });
}
