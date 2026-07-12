// Engångsapplicering: kalkyl på crm_matches — scenariokalkyl för paret
// förfrågan × boende. JSON-lista med antaganden (hyra in/ut, månader, övriga
// kostnader per scenario); nyckeltalen räknas i UI:t (src/lib/crm/kalkyl.ts).
// Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const cols = await client.execute("PRAGMA table_info(`crm_matches`)");
if (!cols.rows.some((r) => r.name === "kalkyl")) {
  await client.execute("ALTER TABLE `crm_matches` ADD COLUMN `kalkyl` text");
  console.log("apply-0029: kalkyl tillagd");
} else {
  console.log("apply-0029: kolumnen fanns redan");
}
console.log("apply-0029: klar");
process.exit(0);
