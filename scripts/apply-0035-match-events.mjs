// Engångsapplicering: crm_match_events — händelselogg per affär. Varje
// omstämpling av erbjudande-/löftesvillkor sparas med en kopia av värdena,
// så förhandlingshistoriken (pris, löptid, vad som ingår) aldrig går förlorad.
// Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

await client.execute(`CREATE TABLE IF NOT EXISTS \`crm_match_events\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`match_id\` text NOT NULL,
  \`request_id\` text,
  \`actor\` text NOT NULL,
  \`type\` text NOT NULL,
  \`data\` text,
  \`created_at\` text DEFAULT (datetime('now'))
)`);
await client.execute("CREATE INDEX IF NOT EXISTS `crm_match_events_match_id_idx` ON `crm_match_events` (`match_id`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_match_events_request_id_idx` ON `crm_match_events` (`request_id`)");

const check = await client.execute("PRAGMA table_info(`crm_match_events`)");
console.log(`apply-0035: crm_match_events har ${check.rows.length} kolumner`);
console.log("apply-0035: klar");
process.exit(0);
