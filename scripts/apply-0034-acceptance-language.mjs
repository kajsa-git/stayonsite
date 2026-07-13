// Engångsapplicering: language på crm_agreement_acceptances — vilken språkversion
// (sv/en) parten läste vid godkännandet. Avtal finns bara på svenska och engelska;
// svenskan har företräde vid tolkningskonflikt. Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const cols = await client.execute("PRAGMA table_info(`crm_agreement_acceptances`)");
if (!cols.rows.some((r) => r.name === "language")) {
  await client.execute("ALTER TABLE `crm_agreement_acceptances` ADD COLUMN `language` text");
  console.log("apply-0034: language tillagd");
} else {
  console.log("apply-0034: kolumnen fanns redan");
}
console.log("apply-0034: klar");
process.exit(0);
