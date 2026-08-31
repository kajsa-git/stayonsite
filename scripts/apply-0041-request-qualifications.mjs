import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const emailColumns = await client.execute("PRAGMA table_info(crm_emails)");
if (!emailColumns.rows.some((row) => row.name === "request_id")) {
  await client.execute("ALTER TABLE crm_emails ADD request_id text REFERENCES crm_requests(id) ON DELETE SET NULL");
}
await client.execute("CREATE INDEX IF NOT EXISTS crm_emails_request_id_idx ON crm_emails(request_id)");

const requestColumns = await client.execute("PRAGMA table_info(crm_requests)");
const existingRequestColumns = new Set(requestColumns.rows.map((row) => String(row.name)));
for (const [name, type] of [
  ["accommodation_type", "text"],
  ["parking_required", "integer"],
  ["kitchen_required", "integer"],
  ["laundry_required", "integer"],
]) {
  if (!existingRequestColumns.has(name)) {
    await client.execute(`ALTER TABLE crm_requests ADD ${name} ${type}`);
  }
}

await client.execute(`CREATE TABLE IF NOT EXISTS crm_request_qualifications (
  request_id text PRIMARY KEY NOT NULL REFERENCES crm_requests(id) ON DELETE CASCADE,
  company_id text NOT NULL REFERENCES crm_companies(id) ON DELETE CASCADE,
  contact_id text REFERENCES crm_contacts(id) ON DELETE SET NULL,
  locale text DEFAULT 'sv' NOT NULL,
  subject text NOT NULL,
  status text DEFAULT 'sending' NOT NULL,
  provider text,
  provider_message_id text,
  gmail_message_id text,
  gmail_thread_id text,
  sent_at text,
  last_processed_message_id text,
  last_reply_at text,
  attempt_count integer DEFAULT 0 NOT NULL,
  last_error text,
  created_at text DEFAULT (datetime('now')),
  updated_at text DEFAULT (datetime('now'))
)`);
await client.execute("CREATE INDEX IF NOT EXISTS crm_request_qualifications_company_id_idx ON crm_request_qualifications(company_id)");
await client.execute("CREATE INDEX IF NOT EXISTS crm_request_qualifications_status_idx ON crm_request_qualifications(status)");
await client.execute("CREATE INDEX IF NOT EXISTS crm_request_qualifications_thread_id_idx ON crm_request_qualifications(gmail_thread_id)");

console.log("apply-0041: crm_request_qualifications och request_id är på plats");
