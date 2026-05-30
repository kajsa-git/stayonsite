// Engångsapplicering: crm_properties.prospekt_published mot Turso.
// Gör /prospekt-länken oberoende av hemsidan (published). Backfill sätter
// prospekt_published = published för befintliga rader (bevarar nuvarande länkar).
// Idempotent: ADD hoppas över om kolumnen finns; backfill körs ENDAST när kolumnen
// nyss lades till (så att senare manuella av-/påslag inte skrivs över vid omkörning).
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

let added = false;
try {
  await client.execute("ALTER TABLE `crm_properties` ADD `prospekt_published` integer DEFAULT 0");
  added = true;
  console.log("OK: ADD prospekt_published");
} catch (e) {
  const msg = String(e?.cause?.proto?.message ?? e?.message ?? e);
  if (msg.includes("duplicate column")) console.log("SKIP (finns redan): prospekt_published");
  else throw e;
}

if (added) {
  const res = await client.execute("UPDATE `crm_properties` SET `prospekt_published` = 1 WHERE `published` = 1");
  console.log(`OK: backfill prospekt_published=1 för ${res.rowsAffected} publicerade objekt`);
} else {
  console.log("SKIP backfill (kolumnen fanns redan — rör inte befintliga på-/avslag)");
}

console.log("apply-0023: done");
process.exit(0);
