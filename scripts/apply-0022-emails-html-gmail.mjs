// Engångsapplicering av crm_emails html/gmail-id-kolumner + unikt index mot Turso.
// drizzle-migratorn kan inte användas här: __drizzle_migrations har glidit isär från
// journalen. Detta kör bara de nya additiva satserna och hoppar över "duplicate
// column"/"already exists" om de redan finns (kolumnerna kan ha lagts till via Studio).
// Speglar drizzle/0021_crm_emails_html_gmail_ids.sql.
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

const addColumns = [
  "ALTER TABLE `crm_emails` ADD `html` text",
  "ALTER TABLE `crm_emails` ADD `gmail_message_id` text",
  "ALTER TABLE `crm_emails` ADD `gmail_thread_id` text",
];

for (const sql of addColumns) {
  try {
    await client.execute(sql);
    console.log("OK:", sql);
  } catch (e) {
    const msg = String(e?.cause?.proto?.message ?? e?.message ?? e);
    if (msg.includes("duplicate column")) console.log("SKIP (finns redan):", sql);
    else throw e;
  }
}

// Rensa ev. dubletter på gmail_message_id (behåll lägsta rowid) innan unik-index.
await client.execute(
  "DELETE FROM `crm_emails` WHERE `gmail_message_id` IS NOT NULL AND `rowid` NOT IN (" +
    "SELECT MIN(`rowid`) FROM `crm_emails` WHERE `gmail_message_id` IS NOT NULL GROUP BY `gmail_message_id`)",
);
console.log("OK: dedup gmail_message_id");

try {
  await client.execute(
    "CREATE UNIQUE INDEX `crm_emails_gmail_message_id_unique_idx` ON `crm_emails` (`gmail_message_id`)",
  );
  console.log("OK: unik index gmail_message_id");
} catch (e) {
  const msg = String(e?.cause?.proto?.message ?? e?.message ?? e);
  if (msg.includes("already exists")) console.log("SKIP (index finns redan)");
  else throw e;
}

console.log("apply-0022: done");
process.exit(0);
