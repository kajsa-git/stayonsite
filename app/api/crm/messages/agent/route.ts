// Agent-endpoints för Mac-agenten (scripts/imessage-agent.mjs). Autentiseras med
// statisk bearer-token (CRM_AGENT_TOKEN) i stället för session — agenten är headless.
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { db } from "@/lib/crm/db";
import { reportMessageStatus } from "@/lib/crm/message-status";
import { outboxMessages, properties } from "@/lib/crm/schema";
import { HUS_PUBLICATION_SMS_SOURCE, OLD_HUS_PUBLICATION_SENTENCE } from "@/lib/crm/hus-publication";
import { and, asc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { ensureReplyEngineSchema } from "@/lib/crm/reply-engine/store";
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

  // Re-check the listing at claim time. Images or copy can have changed after
  // the message was queued, and the owner must not receive a broken link.
  const validHusListing = sql`EXISTS (SELECT 1 FROM ${properties} WHERE ${outboxMessages.id} = 'hus-publication:' || ${properties.id} AND ${properties.published} = 1 AND ${properties.contentReviewStatus} = 'approved' AND length(trim(${properties.publishConsentAt})) > 0)`;
  await db.update(outboxMessages).set({ status: "pending_publication", body: "Bostadslänken skickas när publiceringen är klar." })
    .where(and(eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE), eq(outboxMessages.status, "queued"), sql`NOT ${validHusListing}`));
  // Older queued publication messages may still contain the retired wording.
  // Remove just that sentence before claiming; leave all other messages intact.
  await db.update(outboxMessages).set({ body: sql`replace(${outboxMessages.body}, ${OLD_HUS_PUBLICATION_SENTENCE}, '')` })
    .where(and(eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE), eq(outboxMessages.status, "queued"), sql`instr(${outboxMessages.body}, ${OLD_HUS_PUBLICATION_SENTENCE}) > 0`));
  // Kanal: Mac-agenten (SMS/iMessage) får allt utom WhatsApp. WhatsApp-agenten
  // hämtar med ?channel=whatsapp och får bara sina egna rader.
  await ensureReplyEngineSchema(db);
  const wantWhatsapp = req.nextUrl.searchParams.get("channel") === "whatsapp";
  const isWhatsapp = sql`EXISTS (SELECT 1 FROM crm_outbox_channels c WHERE c.outbox_id = ${outboxMessages.id} AND c.channel = 'whatsapp')`;
  const channelFilter = wantWhatsapp ? isWhatsapp : sql`NOT ${isWhatsapp}`;
  const eligible = and(channelFilter, or(sql`${outboxMessages.source} <> ${HUS_PUBLICATION_SMS_SOURCE}`, validHusListing));
  const staleCutoff = new Date(Date.now() - 15 * 60_000).toISOString().replace("T", " ").slice(0, 19);
  const candidates = await db
    .select({ id: outboxMessages.id })
    .from(outboxMessages)
    .where(and(eligible, or(eq(outboxMessages.status, "queued"), and(eq(outboxMessages.status, "sending"), lt(outboxMessages.createdAt, staleCutoff)))))
    .orderBy(asc(outboxMessages.createdAt))
    .limit(10);
  if (candidates.length === 0) return NextResponse.json([]);

  const claimed = await db
    .update(outboxMessages)
    .set({ status: "sending" })
    .where(and(
      inArray(outboxMessages.id, candidates.map((c) => c.id)),
      eligible,
      // Re-check status: a queued publication link may have been withdrawn
      // after selection, and a different agent may already have claimed it.
      or(eq(outboxMessages.status, "queued"), and(eq(outboxMessages.status, "sending"), lt(outboxMessages.createdAt, staleCutoff))),
    ))
    .returning();
  return NextResponse.json(claimed);
}

// POST { id, ok, error? } — agentens leveransrapport.
export async function POST(req: NextRequest) {
  if (!agentAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id krävs" }, { status: 400 });

  if (body.delivered !== true && typeof body.ok !== "boolean") return NextResponse.json({ error: "ok eller delivered krävs" }, { status: 400 });
  const row = await reportMessageStatus(id, body.delivered === true
    ? { delivered: true }
    : { ok: body.ok === true, error: String(body.error ?? "okänt fel") });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
