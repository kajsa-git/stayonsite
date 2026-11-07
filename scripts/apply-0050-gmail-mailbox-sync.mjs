// Dry-run by default; additive migration with a journal entry, safe to repeat.
// Tabellerna skapas också av appen själv vid första mejlsynken (CREATE ... IF NOT EXISTS),
// så skriptet behövs i första hand för att registrera migrationen i journalen.
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const tag = "0050_gmail_mailbox_sync";
const apply = process.argv.includes("--apply");
try {
  const previous = await client.execute("PRAGMA table_info(crm_rental_reviews)");
  if (!previous.rows.length) throw new Error("Migration 0049 måste köras först");
  const state = await client.execute("PRAGMA table_info(crm_gmail_sync_state)");
  const suggestions = await client.execute("PRAGMA table_info(crm_email_sender_suggestions)");
  console.log(`crm_gmail_sync_state: ${state.rows.length ? "finns" : apply ? "skapas" : "behöver skapas"}`);
  console.log(`crm_email_sender_suggestions: ${suggestions.rows.length ? "finns" : apply ? "skapas" : "behöver skapas"}`);
  if (apply) {
    const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
    const entry = journal.entries.find((item) => item.tag === tag);
    if (!entry) throw new Error(`${tag} saknas i Drizzle-journalen`);
    const sql = await readFile(new URL(`../drizzle/${tag}.sql`, import.meta.url), "utf8");
    const tx = await client.transaction("write");
    try {
      for (const statement of sql.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean)) {
        await tx.execute(statement);
      }
      await tx.execute("CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)");
      await tx.execute({ sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
        args: [createHash("sha256").update(sql).digest("hex"), entry.when, entry.when] });
      await tx.commit();
    } catch (error) { await tx.rollback(); throw error; }
    console.log("Migration 0050 registrerad");
  }
} finally { client.close(); }
