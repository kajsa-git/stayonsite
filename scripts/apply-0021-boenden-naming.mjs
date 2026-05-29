// Engångsapplicering: publik namngivning på crm_properties (public_name, slug + unikt index).
// Samma mönster som apply-0020.mjs — additiva ALTER + CREATE INDEX, idempotent (skippar om de finns).
// drizzle-migratorn kan inte användas här: __drizzle_migrations har glidit isär från journalen.
// Körs från repo-roten (läser ./.env.local):  node scripts/apply-0021-boenden-naming.mjs
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
  "ALTER TABLE `crm_properties` ADD `public_name` text",
  "ALTER TABLE `crm_properties` ADD `slug` text",
  "CREATE UNIQUE INDEX `crm_properties_slug_idx` ON `crm_properties` (`slug`)",
];

for (const sql of stmts) {
  try {
    await client.execute(sql);
    console.log("OK:", sql);
  } catch (e) {
    const msg = String(e?.cause?.proto?.message ?? e?.message ?? e);
    if (msg.includes("duplicate column") || msg.includes("already exists")) console.log("SKIP (finns redan):", sql);
    else throw e;
  }
}
console.log("apply-0021: done");
process.exit(0);
