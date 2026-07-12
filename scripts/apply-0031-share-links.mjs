// Engångsapplicering: crm_share_links — tokeniserade externa länkar (kundens
// erbjudandesida /erbjudande/<token>; uthyrarens sida i fas 3). token = nanoid(32)
// och är själva behörigheten. Lösa referenser (FK av i libSQL) — radering via
// src/lib/crm/cascade-delete.ts. Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

await client.execute(`CREATE TABLE IF NOT EXISTS \`crm_share_links\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`token\` text NOT NULL,
  \`audience\` text NOT NULL,
  \`request_id\` text NOT NULL,
  \`match_id\` text,
  \`created_by\` text,
  \`revoked_at\` text,
  \`expires_at\` text,
  \`last_viewed_at\` text,
  \`view_count\` integer DEFAULT 0 NOT NULL,
  \`created_at\` text DEFAULT (datetime('now'))
)`);
await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS `crm_share_links_token_idx` ON `crm_share_links` (`token`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_share_links_request_id_idx` ON `crm_share_links` (`request_id`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_share_links_match_id_idx` ON `crm_share_links` (`match_id`)");

const check = await client.execute("PRAGMA table_info(`crm_share_links`)");
console.log(`apply-0031: crm_share_links har ${check.rows.length} kolumner`);
console.log("apply-0031: klar");
process.exit(0);
