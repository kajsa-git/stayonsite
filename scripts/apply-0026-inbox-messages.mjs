// Engångsapplicering: crm_inbox_messages mot Turso — inkommande iMessage/SMS-svar.
// Mac-agenten (scripts/imessage-agent.mjs) läser chat.db och postar hit; endast
// avsändare som finns i CRM:et (ägare/kontakter) ingestas. Idempotent.
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

await client.execute(`CREATE TABLE IF NOT EXISTS \`crm_inbox_messages\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`guid\` text NOT NULL,
  \`from_phone\` text NOT NULL,
  \`body\` text NOT NULL,
  \`service\` text,
  \`sent_at\` text NOT NULL,
  \`owner_id\` text,
  \`contact_id\` text,
  \`company_id\` text,
  \`is_read\` integer NOT NULL DEFAULT 0,
  \`created_at\` text DEFAULT (datetime('now'))
)`);
await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS `crm_inbox_messages_guid_idx` ON `crm_inbox_messages` (`guid`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_inbox_messages_from_phone_idx` ON `crm_inbox_messages` (`from_phone`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_inbox_messages_is_read_idx` ON `crm_inbox_messages` (`is_read`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_inbox_messages_owner_id_idx` ON `crm_inbox_messages` (`owner_id`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_inbox_messages_company_id_idx` ON `crm_inbox_messages` (`company_id`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_inbox_messages_sent_at_idx` ON `crm_inbox_messages` (`sent_at`)");

console.log("apply-0026: crm_inbox_messages klar");
process.exit(0);
