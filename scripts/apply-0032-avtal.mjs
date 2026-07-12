// Engångsapplicering: crm_agreement_acceptances — signerade avtal. Kundens
// uppdragsbekräftelse (request-scope, gate i erbjudandelänken) och uthyrarens
// uthyrningsuppdrag (owner+property-scope, fas 3). Avtalstexterna versioneras i
// kod (src/lib/crm/avtal.ts); raderna är bevis och skrivs aldrig om. Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

await client.execute(`CREATE TABLE IF NOT EXISTS \`crm_agreement_acceptances\` (
  \`id\` text PRIMARY KEY NOT NULL,
  \`agreement_type\` text NOT NULL,
  \`version\` text NOT NULL,
  \`request_id\` text,
  \`owner_id\` text,
  \`property_id\` text,
  \`share_link_id\` text,
  \`accepted_name\` text NOT NULL,
  \`accepted_at\` text NOT NULL,
  \`user_agent\` text,
  \`created_at\` text DEFAULT (datetime('now'))
)`);
await client.execute("CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_request_id_idx` ON `crm_agreement_acceptances` (`request_id`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_owner_id_idx` ON `crm_agreement_acceptances` (`owner_id`)");
await client.execute("CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_type_idx` ON `crm_agreement_acceptances` (`agreement_type`)");

const check = await client.execute("PRAGMA table_info(`crm_agreement_acceptances`)");
console.log(`apply-0032: crm_agreement_acceptances har ${check.rows.length} kolumner`);
console.log("apply-0032: klar");
process.exit(0);
