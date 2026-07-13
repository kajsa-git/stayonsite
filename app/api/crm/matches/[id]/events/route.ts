// Förhandlingshistoriken för en affär — omstämplingar av erbjudande/löfte i
// fallande tidsordning. Visas i villkorsdialogerna så man ser vad som erbjöds/
// lovades när, medan förhandlingen snurrar.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { matchEvents } from "@/lib/crm/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(matchEvents)
    .where(eq(matchEvents.matchId, id))
    .orderBy(desc(matchEvents.createdAt))
    .limit(30);
  return NextResponse.json(rows);
}
