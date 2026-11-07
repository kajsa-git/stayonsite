import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { GmailAuthError } from "@/lib/crm/gmail";
import { approveEmailDraft, discardEmailDraft } from "@/lib/crm/reply-engine/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { body } — skicka motorns mejlförslag (ev. redigerat) i rätt tråd.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  const body = typeof raw.body === "string" ? raw.body : "";
  try {
    return NextResponse.json({ decision: await approveEmailDraft(db, id, body) });
  } catch (error) {
    if (error instanceof GmailAuthError) return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kunde inte skicka" }, { status: 400 });
  }
}

// DELETE — släng förslaget (räknas som feedback till motorn).
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await discardEmailDraft(db, id);
  return NextResponse.json({ ok: true });
}
