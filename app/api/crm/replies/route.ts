// "Att svara på" i Min dag: olästa SMS och mejl som väntar på svar, per person.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { computeReplyInbox } from "@/lib/crm/reply-inbox";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await computeReplyInbox({ db }));
}
