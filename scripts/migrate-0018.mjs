// Databevarande körning av 0018_owner_outreach_rounds.sql mot Turso.
// Körs EN gång. drizzle-kit push får inte användas (skulle droppa kolumnerna utan datamigrering).
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const statements = [
  `CREATE TABLE \`crm_owner_outreach\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`property_id\` text NOT NULL REFERENCES \`crm_properties\`(\`id\`) ON DELETE CASCADE,
    \`owner_id\` text REFERENCES \`crm_owners\`(\`id\`) ON DELETE SET NULL,
    \`request_id\` text REFERENCES \`crm_requests\`(\`id\`) ON DELETE SET NULL,
    \`status\` text DEFAULT 'ej_kontaktad' NOT NULL,
    \`started_at\` text DEFAULT (datetime('now')),
    \`next_follow_up_date\` text,
    \`next_follow_up_reason\` text,
    \`concluded_at\` text,
    \`note\` text,
    \`created_at\` text DEFAULT (datetime('now'))
  )`,
  "CREATE INDEX `crm_owner_outreach_property_id_idx` ON `crm_owner_outreach` (`property_id`)",
  "CREATE INDEX `crm_owner_outreach_owner_id_idx` ON `crm_owner_outreach` (`owner_id`)",
  "CREATE INDEX `crm_owner_outreach_request_id_idx` ON `crm_owner_outreach` (`request_id`)",
  "CREATE INDEX `crm_owner_outreach_next_follow_up_date_idx` ON `crm_owner_outreach` (`next_follow_up_date`)",
  "CREATE INDEX `crm_owner_outreach_status_idx` ON `crm_owner_outreach` (`status`)",
  `INSERT INTO \`crm_owner_outreach\`
    (\`id\`, \`property_id\`, \`owner_id\`, \`status\`, \`started_at\`, \`next_follow_up_date\`, \`next_follow_up_reason\`, \`note\`, \`created_at\`)
   SELECT lower(hex(randomblob(12))), \`id\`, \`owner_id\`, 'kontaktad',
          COALESCE(\`created_at\`, datetime('now')), \`owner_follow_up_date\`, \`owner_follow_up_reason\`, \`owner_follow_up_note\`, datetime('now')
   FROM \`crm_properties\` WHERE \`owner_follow_up_date\` IS NOT NULL`,
  "DROP INDEX IF EXISTS `crm_properties_owner_follow_up_date_idx`",
  "ALTER TABLE `crm_properties` DROP COLUMN `owner_follow_up_date`",
  "ALTER TABLE `crm_properties` DROP COLUMN `owner_follow_up_reason`",
  "ALTER TABLE `crm_properties` DROP COLUMN `owner_follow_up_note`",
];

for (const sql of statements) {
  const label = sql.trim().slice(0, 60).replace(/\s+/g, " ");
  if (sql.trim().startsWith("INSERT")) {
    const r = await client.execute(sql);
    console.log(`OK  (${r.rowsAffected} rader migrerade) ${label}…`);
  } else {
    await client.execute(sql);
    console.log(`OK  ${label}…`);
  }
}
console.log("migrate-0017: klart");
process.exit(0);
