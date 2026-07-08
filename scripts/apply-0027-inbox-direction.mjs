// Engångsapplicering: direction-kolumn på crm_inbox_messages ('in' | 'out').
// Agenten läser nu BÅDA riktningarna ur chat.db för kända CRM-nummer, så att
// Kajsas egna svar från Messages också hamnar i kontakthistoriken. Utgående
// lagras med is_read=1 (de är historik, inte att-göra). Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const cols = await client.execute("PRAGMA table_info(`crm_inbox_messages`)");
const hasDirection = cols.rows.some((r) => r.name === "direction");
if (!hasDirection) {
  await client.execute("ALTER TABLE `crm_inbox_messages` ADD COLUMN `direction` text NOT NULL DEFAULT 'in'");
  console.log("apply-0027: direction-kolumn tillagd");
} else {
  console.log("apply-0027: direction fanns redan — inget att göra");
}
await client.execute("CREATE INDEX IF NOT EXISTS `crm_inbox_messages_direction_idx` ON `crm_inbox_messages` (`direction`)");
console.log("apply-0027: klar");
process.exit(0);
