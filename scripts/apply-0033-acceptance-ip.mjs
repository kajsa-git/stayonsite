// Engångsapplicering: ip på crm_agreement_acceptances — stärker bevisvärdet i
// avtalsgodkännanden (namn + tid + user-agent + IP). Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const cols = await client.execute("PRAGMA table_info(`crm_agreement_acceptances`)");
if (!cols.rows.some((r) => r.name === "ip")) {
  await client.execute("ALTER TABLE `crm_agreement_acceptances` ADD COLUMN `ip` text");
  console.log("apply-0033: ip tillagd");
} else {
  console.log("apply-0033: kolumnen fanns redan");
}
console.log("apply-0033: klar");
process.exit(0);
