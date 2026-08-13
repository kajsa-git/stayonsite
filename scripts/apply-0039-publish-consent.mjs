// Engångsapplicering: publiceringsgodkännande på crm_properties — uthyrarens
// bevis på att annonsen får visas online (at/name/source/ip). Publicering är
// fortfarande Kajsas manuella steg. Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const cols = await client.execute("PRAGMA table_info(`crm_properties`)");
const have = new Set(cols.rows.map((r) => r.name));
for (const col of ["publish_consent_at", "publish_consent_name", "publish_consent_source", "publish_consent_ip"]) {
  if (!have.has(col)) {
    await client.execute(`ALTER TABLE \`crm_properties\` ADD COLUMN \`${col}\` text`);
    console.log(`apply-0039: ${col} tillagd`);
  } else {
    console.log(`apply-0039: ${col} fanns redan`);
  }
}
console.log("apply-0039: klar");
process.exit(0);
