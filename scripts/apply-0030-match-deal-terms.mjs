// Engångsapplicering: stämplade affärsvillkor på crm_matches — erbjudandet till
// kund (offer_*, stämpel = sent_at) och löftet till uthyraren (promised_*, stämpel
// = promised_at). Låses när de skickas/bekräftas; objektets rentIn/rentOut kan
// ändras efteråt utan att skriva om historiken. Idempotent.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const COLUMNS = [
  ["offer_rent_out", "real"],
  ["offer_start_date", "text"],
  ["offer_end_date", "text"],
  ["offer_ongoing", "integer"],
  ["offer_note", "text"],
  ["promised_rent_in", "real"],
  ["promised_start_date", "text"],
  ["promised_end_date", "text"],
  ["promised_conditions", "text"],
  ["promised_at", "text"],
];

const cols = await client.execute("PRAGMA table_info(`crm_matches`)");
const existing = new Set(cols.rows.map((r) => r.name));
for (const [name, type] of COLUMNS) {
  if (existing.has(name)) {
    console.log(`apply-0030: ${name} fanns redan`);
    continue;
  }
  await client.execute(`ALTER TABLE \`crm_matches\` ADD COLUMN \`${name}\` ${type}`);
  console.log(`apply-0030: ${name} tillagd`);
}

const after = await client.execute("PRAGMA table_info(`crm_matches`)");
const missing = COLUMNS.filter(([name]) => !after.rows.some((r) => r.name === name));
if (missing.length) {
  console.error(`apply-0030: SAKNAS efter körning: ${missing.map(([n]) => n).join(", ")}`);
  process.exit(1);
}
console.log("apply-0030: klar");
process.exit(0);
