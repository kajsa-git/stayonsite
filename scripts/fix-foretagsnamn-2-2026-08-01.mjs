// Engångsstädning 2026-08-01 del 2: mejlapp-etiketter och webbplatshållare
// får riktiga namn — ENDAST där det finns belägg:
//   SMS-signatur (Emana Heldic), befintligt kontaktnamn (Angelika Palison),
//   tydlig adress (mattias.lindqvist@, Sjoborg.nilla@, claireenglen523@),
//   verifierad företagsdomän (Fun Dining, Format Lambda, Kaidosk OÜ, MasterFix PDR).
// Okända (sansalar92, deniskir60, ranoomsyria7, gamethegod164) lämnas/normaliseras
// till platshållare. Sätter även kontaktnamn där det saknas. Idempotent, backup först.
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const FIXES = [
  { id: "TeJX-dJp2RPFGAiqluDCr", to: "Claire Englen", contactName: "Claire Englen" },        // claireenglen523@gmail.com
  { id: "EvnI7t3cIh4TRMAph6rF1", to: "Fun Dining", contactName: null },                       // cl@fundining.se (fundining.se, GBG)
  { id: "bBnBDBS8aUdH6KvAYJgCc", to: "Emana Heldic", contactName: "Emana Heldic" },           // SMS-signatur "Hälsningar, Emana Heldic"
  { id: "MSBAu3IyhcLLiMEAqVd6C", to: "Webbförfrågan · icloud.com", contactName: null },       // gamethegod164@ — okänd, konsekvent platshållare
  { id: "pGY67tTZBHZtcbch34oDS", to: "Mattias Lindqvist", contactName: "Mattias Lindqvist" }, // mattias.lindqvist@hotmail.com
  { id: "P9uEdIX_pw3sFHW8HA5ul", to: "Format Lambda", contactName: "Lukasz Goralski" },       // format-lambda.eu/.pl — industribygg PL/DE/FI
  { id: "2nh9Y2k0e1Z_84CARNjLQ", to: "Angelika Palison", contactName: null },                 // kontaktnamnet fanns redan
  { id: "qQ0VGNZ5gHEpzYFelhnF7", to: "Nilla Sjöborg", contactName: "Nilla Sjöborg" },         // Sjoborg.nilla@gmail.com
  { id: "EfvZhcgiLHi0XFxMAzbxK", to: "Johan (Linköping)", contactName: "Johan" },             // SMS "mvh Johan"; efternamn okänt
  { id: "Mdb-otUk6cSWWEg048bEF", to: "Kaidosk OÜ", contactName: null },                       // info@kaidosk.ee, telefon matchar bolaget
  { id: "TmyQdkbyqtdYiWimuz22D", to: "MasterFix PDR", contactName: null },                    // info@masterfixpdr.se
];

const backup = { when: new Date().toISOString(), companies: [], contacts: [] };
let changed = 0;
for (const fix of FIXES) {
  const { rows } = await db.execute({ sql: "SELECT id, name FROM crm_companies WHERE id = ?", args: [fix.id] });
  const row = rows[0];
  if (!row) { console.log(`SAKNAS: ${fix.id}`); continue; }
  if (row.name !== fix.to) {
    backup.companies.push(row);
    await db.execute({
      sql: "UPDATE crm_companies SET name = ?, updated_at = ? WHERE id = ?",
      args: [fix.to, new Date().toISOString(), fix.id],
    });
    const { rows: idx } = await db.execute({ sql: "SELECT id, keywords FROM crm_search_index WHERE entity_type = 'company' AND entity_id = ?", args: [fix.id] });
    if (idx[0]) {
      const kw = String(idx[0].keywords ?? "").replace(String(row.name).toLowerCase(), fix.to.toLowerCase());
      await db.execute({ sql: "UPDATE crm_search_index SET title = ?, keywords = ?, updated_at = ? WHERE id = ?", args: [fix.to, kw, new Date().toISOString(), idx[0].id] });
    }
    console.log(`✓ "${row.name}" → "${fix.to}"`);
    changed++;
  }
  if (fix.contactName) {
    const { rows: cts } = await db.execute({ sql: "SELECT id, name FROM crm_contacts WHERE company_id = ? AND (name IS NULL OR name = '')", args: [fix.id] });
    for (const ct of cts) {
      backup.contacts.push(ct);
      await db.execute({ sql: "UPDATE crm_contacts SET name = ? WHERE id = ?", args: [fix.contactName, ct.id] });
      console.log(`  kontakt: → "${fix.contactName}"`);
    }
  }
}

if (backup.companies.length || backup.contacts.length) {
  fs.writeFileSync("scripts/foretagsnamn-fix-2-backup.json", JSON.stringify(backup, null, 2));
}
console.log(`Klart: ${changed} företag omdöpta.`);
process.exit(0);
