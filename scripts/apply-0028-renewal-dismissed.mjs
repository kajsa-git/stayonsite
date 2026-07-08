// Engångsapplicering: renewal_dismissed_at på crm_requests — "Förlängs ej".
// Sätts från förlängningskortet i Min dag när kunden flyttat ut/inte förlänger;
// döljer kortet utan att röra affärsstatus (invoiced består) eller avflyttens
// checklista (hanteras som vanligt under In- & avflyttningar). Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const cols = await client.execute("PRAGMA table_info(`crm_requests`)");
if (!cols.rows.some((r) => r.name === "renewal_dismissed_at")) {
  await client.execute("ALTER TABLE `crm_requests` ADD COLUMN `renewal_dismissed_at` text");
  console.log("apply-0028: renewal_dismissed_at tillagd");
} else {
  console.log("apply-0028: kolumnen fanns redan");
}
console.log("apply-0028: klar");
process.exit(0);
