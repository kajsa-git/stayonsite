// Svarsmotorns lagring. Tabellerna skapas av appen själv (CREATE ... IF NOT EXISTS),
// samma mönster som Gmail-synken, så att driftsättningen aldrig kräver en manuell
// migrering och befintliga tabeller (t.ex. utkorgen) aldrig ändras.
import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "../db";
import type * as schema from "../schema";

export type DB = LibSQLDatabase<typeof schema>;

export const REPLY_ENGINE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS crm_reply_engine_settings (
    key text PRIMARY KEY NOT NULL,
    value text,
    updated_at text DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS crm_reply_decisions (
    id text PRIMARY KEY NOT NULL,
    source_type text NOT NULL,
    source_id text NOT NULL,
    channel text NOT NULL,
    party_type text,
    owner_id text,
    contact_id text,
    company_id text,
    to_address text,
    thread_id text,
    inbound_at text,
    inbound_text text,
    party_role text,
    intent text,
    stage text,
    outcome_goal text,
    summary text,
    action text NOT NULL,
    reply_text text,
    reply_subject text,
    reason text,
    risk_flags text,
    confidence real,
    outbox_id text,
    gmail_draft_id text,
    gmail_message_id text,
    follow_up_at text,
    follow_up_count integer DEFAULT 0 NOT NULL,
    follow_up_status text,
    feedback text,
    final_text text,
    model text,
    mode text,
    created_at text DEFAULT (datetime('now')),
    updated_at text DEFAULT (datetime('now'))
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS crm_reply_decisions_source_unique_idx ON crm_reply_decisions (source_type, source_id)`,
  `CREATE INDEX IF NOT EXISTS crm_reply_decisions_follow_up_idx ON crm_reply_decisions (follow_up_status, follow_up_at)`,
  `CREATE INDEX IF NOT EXISTS crm_reply_decisions_created_idx ON crm_reply_decisions (created_at)`,
  `CREATE INDEX IF NOT EXISTS crm_reply_decisions_owner_idx ON crm_reply_decisions (owner_id)`,
  `CREATE INDEX IF NOT EXISTS crm_reply_decisions_company_idx ON crm_reply_decisions (company_id)`,
  // Kanal per utkorgsrad. Saknas raden är det SMS/iMessage (Mac-agenten).
  `CREATE TABLE IF NOT EXISTS crm_outbox_channels (
    outbox_id text PRIMARY KEY NOT NULL,
    channel text NOT NULL,
    created_at text DEFAULT (datetime('now'))
  )`,
] as const;

const ensured = new WeakMap<object, Promise<void>>();

export function ensureReplyEngineSchema(db: DB = defaultDb): Promise<void> {
  let pending = ensured.get(db);
  if (!pending) {
    pending = (async () => {
      for (const statement of REPLY_ENGINE_SCHEMA_STATEMENTS) await db.run(sql.raw(statement));
    })();
    pending.catch(() => ensured.delete(db));
    ensured.set(db, pending);
  }
  return pending;
}

// ─── Inställningar ───────────────────────────────────────────────────────────

export type EngineMode = "off" | "shadow" | "draft" | "auto";
export const ENGINE_MODES: EngineMode[] = ["off", "shadow", "draft", "auto"];

export interface EngineSettings {
  mode: EngineMode;
  /** Bara meddelanden som kommit in efter denna tidpunkt hanteras (ISO). */
  activatedAt: string | null;
  playbook: string;
  playbookUpdatedAt: string | null;
  learnStatus: string | null;
}

async function getSetting(db: DB, key: string): Promise<string | null> {
  const rows = await db.all<{ value: string | null }>(sql`SELECT value FROM crm_reply_engine_settings WHERE key = ${key}`);
  return rows[0]?.value ?? null;
}

export async function setSetting(db: DB, key: string, value: string | null): Promise<void> {
  await ensureReplyEngineSchema(db);
  await db.run(sql`INSERT INTO crm_reply_engine_settings (key, value, updated_at) VALUES (${key}, ${value}, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
}

export async function getSettings(db: DB = defaultDb): Promise<EngineSettings> {
  await ensureReplyEngineSchema(db);
  const [mode, activatedAt, playbook, playbookUpdatedAt, learnStatus] = await Promise.all([
    getSetting(db, "mode"),
    getSetting(db, "activated_at"),
    getSetting(db, "playbook"),
    getSetting(db, "playbook_updated_at"),
    getSetting(db, "learn_status"),
  ]);
  return {
    mode: ENGINE_MODES.includes(mode as EngineMode) ? (mode as EngineMode) : "off",
    activatedAt,
    playbook: playbook ?? "",
    playbookUpdatedAt,
    learnStatus,
  };
}

/** Byter läge. När motorn slås på från "off" börjar den bara med nya meddelanden. */
export async function setMode(db: DB, mode: EngineMode): Promise<EngineSettings> {
  const current = await getSettings(db);
  await setSetting(db, "mode", mode);
  if (mode !== "off" && (current.mode === "off" || !current.activatedAt)) {
    await setSetting(db, "activated_at", new Date().toISOString());
  }
  return getSettings(db);
}

// ─── Beslut ──────────────────────────────────────────────────────────────────

export type DecisionAction =
  | "auto_sent"
  | "draft"
  | "handover"
  | "no_reply"
  | "shadow"
  | "skipped"
  | "error";

export interface DecisionRow {
  id: string;
  source_type: string;
  source_id: string;
  channel: string;
  party_type: string | null;
  owner_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  to_address: string | null;
  thread_id: string | null;
  inbound_at: string | null;
  inbound_text: string | null;
  party_role: string | null;
  intent: string | null;
  stage: string | null;
  outcome_goal: string | null;
  summary: string | null;
  action: DecisionAction;
  reply_text: string | null;
  reply_subject: string | null;
  reason: string | null;
  risk_flags: string | null;
  confidence: number | null;
  outbox_id: string | null;
  gmail_draft_id: string | null;
  gmail_message_id: string | null;
  follow_up_at: string | null;
  follow_up_count: number;
  follow_up_status: string | null;
  feedback: string | null;
  final_text: string | null;
  model: string | null;
  mode: string | null;
  created_at: string;
  updated_at: string;
}

export type DecisionInsert = Partial<DecisionRow> & Pick<DecisionRow, "id" | "source_type" | "source_id" | "channel" | "action">;

const DECISION_COLUMNS = [
  "id", "source_type", "source_id", "channel", "party_type", "owner_id", "contact_id", "company_id",
  "to_address", "thread_id", "inbound_at", "inbound_text", "party_role", "intent", "stage", "outcome_goal",
  "summary", "action", "reply_text", "reply_subject", "reason", "risk_flags", "confidence", "outbox_id",
  "gmail_draft_id", "gmail_message_id", "follow_up_at", "follow_up_count", "follow_up_status", "feedback",
  "final_text", "model", "mode",
] as const;

/** Sparar ett beslut. Returnerar false om källan redan hanterats (idempotent). */
export async function insertDecision(db: DB, row: DecisionInsert): Promise<boolean> {
  await ensureReplyEngineSchema(db);
  const cols = DECISION_COLUMNS.filter((c) => row[c] !== undefined);
  const values = cols.map((c) => {
    const v = row[c];
    return v === null || v === undefined ? sql`NULL` : sql`${v}`;
  });
  const result = await db.run(sql`INSERT INTO crm_reply_decisions (${sql.raw(cols.join(", "))})
    VALUES (${sql.join(values, sql`, `)}) ON CONFLICT(source_type, source_id) DO NOTHING`);
  return (result.rowsAffected ?? 0) > 0;
}

export async function updateDecision(db: DB, id: string, patch: Partial<DecisionRow>): Promise<void> {
  const cols = DECISION_COLUMNS.filter((c) => c !== "id" && patch[c] !== undefined);
  if (!cols.length) return;
  const sets = cols.map((c) => {
    const v = patch[c];
    return v === null ? sql`${sql.raw(c)} = NULL` : sql`${sql.raw(c)} = ${v}`;
  });
  await db.run(sql`UPDATE crm_reply_decisions SET ${sql.join(sets, sql`, `)}, updated_at = datetime('now') WHERE id = ${id}`);
}

export async function decidedSourceIds(db: DB, sourceType: string, ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  await ensureReplyEngineSchema(db);
  const rows = await db.all<{ source_id: string }>(
    sql`SELECT source_id FROM crm_reply_decisions WHERE source_type = ${sourceType} AND source_id IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`,
  );
  return new Set(rows.map((r) => r.source_id));
}

export async function listDecisions(db: DB = defaultDb, limit = 100): Promise<DecisionRow[]> {
  await ensureReplyEngineSchema(db);
  return db.all<DecisionRow>(sql`SELECT * FROM crm_reply_decisions ORDER BY created_at DESC, rowid DESC LIMIT ${limit}`);
}

/** Antal automatiska utskick till en part det senaste dygnet (spärr mot loopar). */
export async function recentAutoCount(db: DB, party: { ownerId?: string | null; contactId?: string | null; companyId?: string | null }, hours = 24): Promise<number> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const conds = [
    party.ownerId ? sql`owner_id = ${party.ownerId}` : null,
    party.contactId ? sql`contact_id = ${party.contactId}` : null,
    !party.contactId && party.companyId ? sql`company_id = ${party.companyId}` : null,
  ].filter(Boolean) as ReturnType<typeof sql>[];
  if (!conds.length) return 0;
  const rows = await db.all<{ n: number }>(sql`SELECT count(*) AS n FROM crm_reply_decisions
    WHERE action = 'auto_sent' AND created_at >= ${since.replace("T", " ").slice(0, 19)}
    AND (${sql.join(conds, sql` OR `)})`);
  return Number(rows[0]?.n ?? 0);
}

// ─── Kanaler för utkorgen ────────────────────────────────────────────────────

export type MessageChannel = "sms" | "whatsapp";

export async function setOutboxChannel(db: DB, outboxId: string, channel: MessageChannel): Promise<void> {
  await ensureReplyEngineSchema(db);
  if (channel === "sms") return;
  await db.run(sql`INSERT INTO crm_outbox_channels (outbox_id, channel) VALUES (${outboxId}, ${channel})
    ON CONFLICT(outbox_id) DO UPDATE SET channel = excluded.channel`);
}

/** Inkommande kanal ("service" från agenten) → kanal för svaret. */
export function channelForService(service: string | null | undefined): MessageChannel {
  return /whats/i.test(service ?? "") ? "whatsapp" : "sms";
}
