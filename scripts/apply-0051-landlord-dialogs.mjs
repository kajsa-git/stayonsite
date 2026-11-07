// Dry-run by default. This migration only adds tables and indexes; it never
// creates a dialog, enables replies or changes an existing CRM record.
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const tag = "0051_landlord_dialogs";
const apply = process.argv.includes("--apply");
const expected = {
  crm_landlord_dialogs: ["id", "owner_id", "property_id", "gmail_thread_id", "landlord_email", "enrolled_at", "active", "lease_token", "lease_until", "last_seen_fingerprint", "last_checked_at", "created_at", "updated_at"],
  crm_landlord_reply_runs: ["gmail_message_id", "dialog_id", "status", "draft_body", "outbound_gmail_message_id", "attachments_need_review", "review_notice_attempted_at", "follow_up_notice_sent_at", "error", "created_at", "updated_at"],
  crm_landlord_agent_health: ["id", "last_success_at", "last_error_at", "failure_started_at", "alert_sent_at", "lease_token", "lease_until"],
  crm_landlord_sms_dialogs: ["id", "owner_id", "property_id", "phone", "enrolled_at", "active", "last_checked_at", "lease_token", "lease_until", "created_at", "updated_at"],
  crm_landlord_sms_receipts: ["guid", "conversation_kind", "attachment_count"],
  crm_landlord_sms_runs: ["inbox_guid", "dialog_id", "status", "outbox_id", "error", "review_notice_sent_at", "attachments_need_review", "attachment_notice_sent_at", "follow_up_notice_sent_at", "created_at", "updated_at"],
  crm_landlord_image_candidates: ["id", "property_id", "gmail_message_id", "reply_run_id", "attachment_id", "file_name", "mime_type", "size_bytes", "status", "object_key", "error", "review_notice_sent_at", "lease_token", "lease_until", "created_at", "updated_at"],
  crm_landlord_property_locks: ["property_id", "lease_token", "lease_until"],
};
try {
  const preceding = await client.execute("PRAGMA table_info(crm_gmail_sync_state)");
  if (!preceding.rows.some((row) => row.name === "mailbox")) throw new Error("Migration 0050 måste vara genomförd först");
  const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
  const previous = journal.entries.find((item) => item.tag === "0050_gmail_mailbox_sync");
  const entry = journal.entries.find((item) => item.tag === tag);
  if (!previous || !entry) throw new Error("Migrationernas journal är ofullständig");
  const registered = await client.execute({ sql: "SELECT 1 FROM __drizzle_migrations WHERE created_at = ? LIMIT 1", args: [previous.when] });
  console.log(`Migration 0050: ${registered.rows.length ? "registrerad" : "måste registreras först"}`);
  if (apply && !registered.rows.length) throw new Error("Registrera migration 0050 innan 0051 appliceras");
  for (const [table, columns] of Object.entries(expected)) {
    const current = await client.execute(`PRAGMA table_info(${table})`);
    if (current.rows.length && columns.some((name) => !current.rows.some((row) => row.name === name))) {
      throw new Error(`${table} finns redan med ett annat schema`);
    }
    console.log(`${table}: ${current.rows.length ? "finns och har väntade kolumner" : apply ? "kommer att skapas" : "behöver skapas"}`);
  }
  if (apply) {
    const source = await readFile(new URL(`../drizzle/${tag}.sql`, import.meta.url), "utf8");
    const statements = source.split("--> statement-breakpoint").map((item) => item.trim()).filter(Boolean)
      .map((item) => item.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, "CREATE TABLE IF NOT EXISTS ")
        .replace(/CREATE UNIQUE INDEX (?!IF NOT EXISTS)/g, "CREATE UNIQUE INDEX IF NOT EXISTS ")
        .replace(/CREATE INDEX (?!IF NOT EXISTS)/g, "CREATE INDEX IF NOT EXISTS "));
    const tx = await client.transaction("write");
    try {
      for (const statement of statements) await tx.execute(statement);
      await tx.execute("CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)");
      await tx.execute({ sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
        args: [createHash("sha256").update(source).digest("hex"), entry.when, entry.when] });
      await tx.commit();
    } catch (error) { await tx.rollback(); throw error; }
    console.log("Migration 0051 registrerad; inga dialoger har aktiverats");
  }
} finally { client.close(); }
