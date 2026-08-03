// Agent-endpoints för Mac-agenten (scripts/imessage-agent.mjs). Autentiseras med
// statisk bearer-token (CRM_AGENT_TOKEN) i stället för session — agenten är headless.
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { db } from "@/lib/crm/db";
import { outboxMessages } from "@/lib/crm/schema";
import { and, asc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function agentAuthorized(req: NextRequest): boolean {
  return bearerAuthorized(req, process.env.CRM_AGENT_TOKEN);
}

// GET — claima upp till 10 köade meddelanden (markeras "sending" atomiskt så en
// omstartad agent inte dubbelskickar). Rader fast i "sending" > 15 min återtas —
// agenten kraschade innan resultatet rapporterades.
export async function GET(req: NextRequest) {
  if (!agentAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staleCutoff = new Date(Date.now() - 15 * 60_000).toISOString().replace("T", " ").slice(0, 19);
  const candidates = await db
    .select({ id: outboxMessages.id })
    .from(outboxMessages)
    .where(or(eq(outboxMessages.status, "queued"), and(eq(outboxMessages.status, "sending"), lt(outboxMessages.createdAt, staleCutoff))))
    .orderBy(asc(outboxMessages.createdAt))
    .limit(10);
  if (candidates.length === 0) return NextResponse.json([]);

  const claimed = await db
    .update(outboxMessages)
    .set({ status: "sending" })
    .where(inArray(outboxMessages.id, candidates.map((c) => c.id)))
    .returning();
  return NextResponse.json(claimed);
}

// POST { id, ok, error? } — agentens leveransrapport.
export async function POST(req: NextRequest) {
  if (!agentAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id krävs" }, { status: 400 });

  const [row] = await db
    .update(outboxMessages)
    .set(
      body.ok === true
        ? { status: "sent", sentAt: sql`(datetime('now'))`, error: null }
        : { status: "failed", error: String(body.error ?? "okänt fel").slice(0, 500) },
    )
    .where(eq(outboxMessages.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
