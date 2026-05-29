// Engångsapplicering av 0020 (in-/avflyttningsfält) direkt mot Turso.
// drizzle-migratorn kan inte användas här: __drizzle_migrations har glidit isär
// från journalen (vissa migrationer applicerade out-of-band). Detta kör bara de
// nya additiva ALTER-satserna och hoppar över "duplicate column" om de redan finns.
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

const stmts = [
  "ALTER TABLE `crm_requests` ADD `end_date_ongoing` integer",
  "ALTER TABLE `crm_requests` ADD `move_in_checklist` text",
  "ALTER TABLE `crm_requests` ADD `move_out_checklist` text",
  "ALTER TABLE `crm_requests` ADD `move_in_done_at` text",
  "ALTER TABLE `crm_requests` ADD `move_out_done_at` text",
];

for (const sql of stmts) {
  try {
    await client.execute(sql);
    console.log("OK:", sql);
  } catch (e) {
    const msg = String(e?.cause?.proto?.message ?? e?.message ?? e);
    if (msg.includes("duplicate column")) console.log("SKIP (finns redan):", sql);
    else throw e;
  }
}
console.log("apply-0020: done");
process.exit(0);
