// Mejl-panelen i Min dag: trådar som väntar på svar, förslag på nya avsändare och
// status för bakgrundssynken — i ett anrop.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { computeWaitingEmails, getMailboxSyncStatus, listSenderSuggestions } from "@/lib/crm/email-sync";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [threads, suggestions, status] = await Promise.all([
    computeWaitingEmails({ db }),
    listSenderSuggestions(db),
    getMailboxSyncStatus(db),
  ]);
  return NextResponse.json({ threads, suggestions, status });
}
