// Engångsapplicering: crm_outbox_messages mot Turso — utkorg för iMessage/SMS.
// CRM:t köar, Mac-agenten (scripts/imessage-agent.mjs) skickar via Messages.app.
// Idempotent: CREATE TABLE/INDEX IF NOT EXISTS.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await client.execute(`CREATE TABLE IF NOT EXISTS \`crm_outbox_messages\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`to_phone\` text NOT NULL,
  \`body\` text NOT NULL,
  \`owner_id\` text,
  \`contact_id\` text,
  \`status\` text NOT NULL DEFAULT 'queued',
  \`error\` text,
  \`created_at\` text DEFAULT (datetime('now')),
  \`sent_at\` text
)`);
await client.execute("CREATE INDEX IF NOT EXISTS `crm_outbox_messages_status_idx` ON `crm_outbox_messages` (`status`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_outbox_messages_to_phone_idx` ON `crm_outbox_messages` (`to_phone`)");

console.log("apply-0025: crm_outbox_messages klar");
process.exit(0);
