// Engångsapplicering: crm_requests annonsattribution-kolumner mot Turso.
// Lägger till gclid + gclid_captured_at + gads_lead_uploaded_at + gads_won_uploaded_at
// så Offline Conversion Import kan attribuera leads/affärer till annonsklick.
// Idempotent: varje ADD hoppas över om kolumnen redan finns. Inga backfills behövs
// (alla nya kolumner är nullbara och börjar tomma).
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

const columns = [
  "ADD `gclid` text",
  "ADD `gclid_captured_at` text",
  "ADD `gads_lead_uploaded_at` text",
  "ADD `gads_won_uploaded_at` text",
];

for (const col of columns) {
  const name = col.match(/`([^`]+)`/)[1];
  try {
    await client.execute(`ALTER TABLE \`crm_requests\` ${col}`);
    console.log(`OK: ${name}`);
  } catch (e) {
    const msg = String(e?.cause?.proto?.message ?? e?.message ?? e);
    if (msg.includes("duplicate column")) console.log(`SKIP (finns redan): ${name}`);
    else throw e;
  }
}

console.log("apply-0024: done");
process.exit(0);
