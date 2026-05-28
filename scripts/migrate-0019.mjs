// Additiv migration 0019: nya kolumner på crm_properties. Säker att köra mot live.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const statements = [
  "ALTER TABLE `crm_properties` ADD `dishwasher` integer",
  "ALTER TABLE `crm_properties` ADD `all_included` integer",
  "ALTER TABLE `crm_properties` ADD `excluded_note` text",
  "ALTER TABLE `crm_properties` ADD `linens_included` integer",
  "ALTER TABLE `crm_properties` ADD `heat_water_included` integer",
  "ALTER TABLE `crm_properties` ADD `special_note` text",
];

for (const sql of statements) {
  await client.execute(sql);
  console.log(`OK  ${sql}`);
}
console.log("migrate-0019: klart");
process.exit(0);
