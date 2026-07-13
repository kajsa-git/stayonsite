// Engångsapplicering: fristående uppdragsavtal (Kajsas beslut 2026-07-13).
//  1) crm_share_links byggs om: request_id blir nullbar + ny owner_id —
//     uthyrarens avtalslänk ska kunna skickas utan att någon affär finns.
//     (SQLite kan inte ändra NOT NULL med ALTER → ny tabell + kopiera + byt namn.)
//  2) crm_agreement_acceptances får company_id (uppdragsbekräftelsen gäller
//     FÖRETAGET i 12 månader, inte bara en enskild förfrågan) + backfill.
// Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// 1) share_links-ombyggnad — bara om owner_id saknas
const linkCols = await client.execute("PRAGMA table_info(`crm_share_links`)");
if (!linkCols.rows.some((r) => r.name === "owner_id")) {
  await client.batch([
    `CREATE TABLE \`crm_share_links_new\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`token\` text NOT NULL,
      \`audience\` text NOT NULL,
      \`request_id\` text,
      \`match_id\` text,
      \`owner_id\` text,
      \`created_by\` text,
      \`revoked_at\` text,
      \`expires_at\` text,
      \`last_viewed_at\` text,
      \`view_count\` integer DEFAULT 0 NOT NULL,
      \`created_at\` text DEFAULT (datetime('now'))
    )`,
    `INSERT INTO \`crm_share_links_new\` (id, token, audience, request_id, match_id, created_by, revoked_at, expires_at, last_viewed_at, view_count, created_at)
      SELECT id, token, audience, request_id, match_id, created_by, revoked_at, expires_at, last_viewed_at, view_count, created_at FROM \`crm_share_links\``,
    "DROP TABLE `crm_share_links`",
    "ALTER TABLE `crm_share_links_new` RENAME TO `crm_share_links`",
    "CREATE UNIQUE INDEX IF NOT EXISTS `crm_share_links_token_idx` ON `crm_share_links` (`token`)",
    "CREATE INDEX IF NOT EXISTS `crm_share_links_request_id_idx` ON `crm_share_links` (`request_id`)",
    "CREATE INDEX IF NOT EXISTS `crm_share_links_match_id_idx` ON `crm_share_links` (`match_id`)",
    "CREATE INDEX IF NOT EXISTS `crm_share_links_owner_id_idx` ON `crm_share_links` (`owner_id`)",
  ]);
  console.log("apply-0036: crm_share_links ombyggd (request_id nullbar, owner_id tillagd)");
} else {
  console.log("apply-0036: crm_share_links redan ombyggd");
}

// 2) acceptances: company_id + backfill
const accCols = await client.execute("PRAGMA table_info(`crm_agreement_acceptances`)");
if (!accCols.rows.some((r) => r.name === "company_id")) {
  await client.execute("ALTER TABLE `crm_agreement_acceptances` ADD COLUMN `company_id` text");
  await client.execute(
    "CREATE INDEX IF NOT EXISTS `crm_agreement_acceptances_company_id_idx` ON `crm_agreement_acceptances` (`company_id`)"
  );
  const upd = await client.execute(
    `UPDATE crm_agreement_acceptances
     SET company_id = (SELECT company_id FROM crm_requests r WHERE r.id = crm_agreement_acceptances.request_id)
     WHERE agreement_type = 'uppdragsbekraftelse' AND request_id IS NOT NULL AND company_id IS NULL`
  );
  console.log(`apply-0036: company_id tillagd + ${upd.rowsAffected} rader backfyllda`);
} else {
  console.log("apply-0036: company_id fanns redan");
}
console.log("apply-0036: klar");
process.exit(0);
