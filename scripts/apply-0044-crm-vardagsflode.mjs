// Läs-only utan --apply. Med --apply läggs enbart saknade, nullable kolumner till.
// node --env-file=.env.local scripts/apply-0044-crm-vardagsflode.mjs [--apply]
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const changes = [
  ["crm_owners", "follow_up_time"],
  ["crm_owner_outreach", "next_follow_up_time"],
  ["crm_outbox_messages", "reply_to_inbox_ids"],
  ["crm_outbox_messages", "delivered_at"],
];
const apply = process.argv.includes("--apply");
try {
  if (apply) {
    // Att registrera 0044 som senaste migration får inte hoppa över 0043.
    const requests = await db.execute("PRAGMA table_info(crm_requests)");
    for (const column of ["gads_consent", "gads_consent_captured_at"]) {
      if (!requests.rows.some((row) => row.name === column)) throw new Error(`Migration 0043 måste köras först: ${column} saknas`);
    }
  }
  for (const [table, column] of changes) {
    const columns = await db.execute(`PRAGMA table_info(${table})`);
    if (columns.rows.some((row) => row.name === column)) {
      console.log(`${table}.${column}: finns redan`);
      continue;
    }
    if (apply) {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} text`);
      console.log(`${table}.${column}: tillagd`);
    } else {
      console.log(`${table}.${column}: behöver läggas till`);
    }
  }
  if (apply) {
    // Drizzle ska inte försöka lägga till samma kolumner igen vid nästa migrering.
    // 0043 kan ha körts manuellt utan journalpost; kontrollen ovan verifierar den.
    const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
    await db.execute("CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)");
    for (const tag of ["0043_ads_consent", "0044_crm_vardagsflode"]) {
      const entry = journal.entries.find((item) => item.tag === tag);
      if (!entry) throw new Error(`Migration ${tag} saknas i Drizzle-journalen`);
      const sql = await readFile(new URL(`../drizzle/${tag}.sql`, import.meta.url), "utf8");
      await db.execute({
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
        args: [createHash("sha256").update(sql).digest("hex"), entry.when, entry.when],
      });
    }
    console.log("Migrationerna 0043 och 0044 registrerade i Drizzle-journalen");
  }
} finally {
  db.close();
}
