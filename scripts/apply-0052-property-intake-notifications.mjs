// Additive migration only. Dry-run unless --apply is passed explicitly.
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const tag = "0052_property_intake_notifications";
const apply = process.argv.includes("--apply");
const columns = ["property_id", "owner_name", "owner_phone", "owner_email", "owner_type", "address", "city", "created_at", "last_activity_at", "completed_at", "failed_images", "interrupted_notified_at", "completed_notified_at", "active_kind", "message_snapshot", "lease_token", "lease_until", "retry_after"];

try {
  const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
  const previous = journal.entries.find((item) => item.tag === "0051_landlord_dialogs");
  const entry = journal.entries.find((item) => item.tag === tag);
  if (!previous || !entry) throw new Error("Migrationernas journal är ofullständig");
  const registered = await client.execute({ sql: "SELECT 1 FROM __drizzle_migrations WHERE created_at = ? LIMIT 1", args: [previous.when] });
  if (!registered.rows.length) throw new Error("Migration 0051 måste vara registrerad först");
  const current = await client.execute("PRAGMA table_info(crm_property_intake_notifications)");
  if (current.rows.length && columns.some((name) => !current.rows.some((row) => row.name === name))) {
    throw new Error("Notistabellen finns redan med ett annat schema");
  }
  console.log(`Notistabellen: ${current.rows.length ? "finns och har väntade kolumner" : apply ? "kommer att skapas" : "behöver skapas"}`);
  if (apply) {
    const source = await readFile(new URL(`../drizzle/${tag}.sql`, import.meta.url), "utf8");
    const statements = source.split("--> statement-breakpoint").map((item) => item.trim()).filter(Boolean)
      .map((item) => item.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, "CREATE TABLE IF NOT EXISTS ")
        .replace(/CREATE INDEX (?!IF NOT EXISTS)/g, "CREATE INDEX IF NOT EXISTS "));
    const tx = await client.transaction("write");
    try {
      for (const statement of statements) await tx.execute(statement);
      await tx.execute({ sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
        args: [createHash("sha256").update(source).digest("hex"), entry.when, entry.when] });
      await tx.commit();
    } catch (error) { await tx.rollback(); throw error; }
    console.log("Migration 0052 registrerad; befintliga bostäder har inte ändrats");
  }
} finally { client.close(); }
