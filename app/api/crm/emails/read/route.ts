// ✓ Hanterad: markera inkommande mejl som lästa (de försvinner då ur Min dag).
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { markEmailsRead } from "@/lib/crm/email-sync";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => ({}) as Record<string, unknown>);
  const ids = Array.isArray(raw.ids) ? raw.ids.filter((id: unknown): id is string => typeof id === "string" && id.length > 0) : [];
  if (!ids.length || ids.length > 500) {
    return NextResponse.json({ error: "ids (1–500 mejl-id:n) krävs" }, { status: 400 });
  }
  const updated = await markEmailsRead(db, ids);
  return NextResponse.json({ updated });
}
