import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await client.execute(`CREATE TABLE IF NOT EXISTS crm_integrations (
  provider text PRIMARY KEY NOT NULL,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  expires_at integer,
  refresh_token_expires_at integer,
  refresh_lock_id text,
  refresh_locked_until text,
  connected_at text DEFAULT (datetime('now')),
  updated_at text DEFAULT (datetime('now'))
)`);

const requestColumns = await client.execute("PRAGMA table_info(crm_requests)");
const existing = new Set(requestColumns.rows.map((row) => String(row.name)));
for (const column of [
  "fortnox_invoice_number",
  "fortnox_invoice_url",
  "fortnox_invoice_created_at",
  "fortnox_invoice_error",
]) {
  if (!existing.has(column)) {
    await client.execute(`ALTER TABLE crm_requests ADD ${column} text`);
    console.log(`apply-0040: ${column} tillagd`);
  } else {
    console.log(`apply-0040: ${column} fanns redan`);
  }
}

console.log("apply-0040: crm_integrations och Fortnox-kolumner är på plats");
