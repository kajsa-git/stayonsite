import { after, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { learnFromHistory } from "@/lib/crm/reply-engine/learn";
import { setSetting } from "@/lib/crm/reply-engine/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// POST — läs igenom alla tidigare SMS/WhatsApp och mejl och bygg om playbooken.
// Körs i bakgrunden; förloppet syns i learnStatus.
export async function POST() {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await setSetting(db, "learn_status", `${new Date().toISOString()} startar`);
  after(async () => {
    try {
      await learnFromHistory({ db });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Reply engine learning failed", { error: message });
      await setSetting(db, "learn_status", `${new Date().toISOString()} fel: ${message.slice(0, 300)}`);
    }
  });
  return NextResponse.json({ started: true }, { status: 202 });
}
