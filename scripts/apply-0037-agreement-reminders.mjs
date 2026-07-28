// Engångsapplicering: crm_agreement_reminders — påminnelselogg för osignerade
// uthyrningsuppdrag från bostadsregistreringen. Del 2 av formuläret (signeringen)
// kan hoppas över; cron:en app/api/cron/agreement-reminders mejlar då en
// påminnelse med signeringslänken och loggar varje utskick här. Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

await client.execute(`CREATE TABLE IF NOT EXISTS \`crm_agreement_reminders\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`owner_id\` text NOT NULL,
  \`share_link_id\` text,
  \`channel\` text NOT NULL,
  \`recipient\` text,
  \`reminder_no\` integer NOT NULL,
  \`sent_at\` text NOT NULL,
  \`created_at\` text DEFAULT (datetime('now'))
)`);
await client.execute(
  "CREATE INDEX IF NOT EXISTS `crm_agreement_reminders_owner_id_idx` ON `crm_agreement_reminders` (`owner_id`)"
);
console.log("apply-0037: crm_agreement_reminders på plats");
process.exit(0);
