// Engångsstädning 2026-08-01: uppenbara formfel i företagsnamn.
// Bara mekaniska rättningar — inga gissningar om vilket bolag som avses:
// HTML-entities, taglines i namnfältet, trunkerade/felskrivna bolagsformer,
// versalskrik. Aberga verifierad mot allabolag (org 559088-5751) — namnet ÄR
// utan Å; får AB-suffix + org_nr. Uppdaterar även crm_search_index (title +
// keywords) så företagen förblir sökbara. Idempotent; backup skrivs först.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const FIXES = [
  { id: "NR90okKj7_p2vi7E7QLs9", to: "Aberga VVS & Svets AB", orgNr: "559088-5751" }, // &amp; + AB + org (allabolag)
  { id: "dsjwqCNO857TEY_K27fTr", to: "Avarn Security Group" },            // tagline bort
  { id: "qiLUTMnhRri4jl5X2YcYY", to: "IFK Göteborg" },                    // tagline bort
  { id: "mRTu1dZgpN5H9tVsfup2n", to: "Bröderna Nygård Aktiebolag" },      // versalskrik
  { id: "WJ0xWAbax2o-hbkuQsKge", to: "Solar Stalkonstrukcja Sp. z o.o." },// trunkerad bolagsform + versaler
  { id: "myMz7QkE2V81qhKD8DITz", to: "Inter Centrum Sp. z o.o." },        // saknad punkt
  { id: "kvah8YsBxGXaOiVUBxfQZ", to: "W&G Serwis Sp. z o.o." },           // mellanslag i o. o.
  { id: "IvVXnH8oC2HCA7o8aPYOd", to: "Workforce Housing International B.V." }, // saknad punkt
  { id: "PEu5SFjuQ3gI9BDRCL1XX", to: "PMP Montex s.r.o." },               // bolagsform + initialer
  { id: "4UuR4VVLsIpA6Hu-4EfvN", to: "IPS COR Services Ltd" },            // versalskrik (behåller initialerna)
];

const backup = [];
let changed = 0;
for (const fix of FIXES) {
  const { rows } = await db.execute({ sql: "SELECT id, name, org_nr FROM crm_companies WHERE id = ?", args: [fix.id] });
  const row = rows[0];
  if (!row) { console.log(`SAKNAS: ${fix.id} (${fix.to})`); continue; }
  if (row.name === fix.to && (!fix.orgNr || row.org_nr === fix.orgNr)) { console.log(`redan klar: ${fix.to}`); continue; }
  backup.push(row);

  await db.execute({
    sql: "UPDATE crm_companies SET name = ?, org_nr = COALESCE(?, org_nr), updated_at = ? WHERE id = ?",
    args: [fix.to, fix.orgNr ?? null, new Date().toISOString(), fix.id],
  });

  // Sökindex: byt namnet i title och keywords så bolaget förblir sökbart.
  const { rows: idx } = await db.execute({ sql: "SELECT id, title, keywords FROM crm_search_index WHERE entity_type = 'company' AND entity_id = ?", args: [fix.id] });
  if (idx[0]) {
    const newKeywords = String(idx[0].keywords ?? "").replace(String(row.name).toLowerCase(), fix.to.toLowerCase());
    await db.execute({
      sql: "UPDATE crm_search_index SET title = ?, keywords = ?, updated_at = ? WHERE id = ?",
      args: [fix.to, newKeywords, new Date().toISOString(), idx[0].id],
    });
  }
  console.log(`✓ "${row.name}" → "${fix.to}"${fix.orgNr ? ` (+org_nr ${fix.orgNr})` : ""}`);
  changed++;
}

if (backup.length) fs.writeFileSync("scripts/foretagsnamn-fix-backup.json", JSON.stringify({ when: new Date().toISOString(), rows: backup }, null, 2));
console.log(`Klart: ${changed} ändrade, backup: ${backup.length} rader.`);
process.exit(0);
