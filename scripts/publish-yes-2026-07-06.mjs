// Publicerar objekt efter ja-svar på SMS-kampanjen 2026-07-06 + KM Group/Rent Invest.
// Backup av tidigare läge skrivs till scripts/publish-yes-backup.json innan uppdatering.
// Kör från repo-roten: node scripts/publish-yes-2026-07-06.mjs
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

// Ja-svar (10 uthyrare, 10 objekt — Elins Notion-dubblett FQWC_IKMeATroUSkTZ98V hålls opublicerad)
const YES_IDS = [
  "ba5_qzJAJnhSJsXLR35rV", // Bettan Johansson — Mönsterås
  "0x4utFbFl66htdAreLs5h", // Sylvia — Västerås
  "Lqa4mBpClik5A_xZxWomC", // Elin Rubin — Boden (Valnötsvägen 5)
  "OpsqfLecrFiZFJacyfwi8", // Johsn Henriksson — Luleå
  "cj5H6tCcjZUfIr8WIB__R", // Surjit Shergill — Västerhaninge
  "K9v_DxCgKpgXafdukfhGG", // Andreas Waaranperä — Luleå
  "5BfA_eQN_l_jSn3tLzPzg", // Per Wennberg — Stockholm
  "tqwTMiHCQYXRX_rEYSKKr", // Martina — Staffanstorp
  "rtBVXOHqd3Y9m-YkwLreq", // Gustav — Kiruna
  "2g3fOkFZthr_4-OBlV2rO", // Morgan Gustafsson — Linköping
];

// Egna bolag: KMGroup AB (Masurgatan) + Rent Invest (samtliga 8)
const OWN_IDS = [
  "BU91WhLn5ldrZziyoNQP-", // KMGroup AB — Masurgatan 84, Gävle
  "ehzXQqeT__rN6glg7z5qg", // Rent Invest — Tallgatan 8, Gävle
  "mmpI_O7y8tUP0ARnusV80", // Rent Invest — Skyttestigen 9F, Gävle
  "hbvEHXT5d6SZ8h06JptZf", // Rent Invest — Skogsbrovägen, Järbo
  "ErVMmYCLCHNBQqFz5PYkZ", // Rent Invest — Backvägen 13, Skutskär
  "b3yz4HTf8ntKRjdJsN89c", // Rent Invest — Södra Hasselgatan 9, Sandviken
  "6AnRf-5F_QWEZzz5-TDiK", // Rent Invest — Vinkingavägen 75, Gävle
  "9bowHHAgbtSXn_sgPDCPR", // Rent Invest — Rödrävsgatan 1, Västerås
  "AW84e_txV2-DlBBgUhNlq", // Rent Invest — Vikingavägen 134, Gävle
];

const ALL = [...YES_IDS, ...OWN_IDS];
const placeholders = ALL.map(() => "?").join(",");

const before = await client.execute({
  sql: `SELECT id, address, city, slug, published, status FROM crm_properties WHERE id IN (${placeholders})`,
  args: ALL,
});
if (before.rows.length !== ALL.length) {
  console.error(`FEL: hittade ${before.rows.length} av ${ALL.length} objekt — avbryter.`);
  process.exit(1);
}
fs.writeFileSync(
  "scripts/publish-yes-backup.json",
  JSON.stringify({ timestamp: new Date().toISOString(), rows: before.rows }, null, 2),
);
console.log(`Backup skriven: ${before.rows.length} rader → scripts/publish-yes-backup.json`);

const res = await client.execute({
  sql: `UPDATE crm_properties SET published = 1, updated_at = datetime('now') WHERE id IN (${placeholders})`,
  args: ALL,
});
console.log(`Uppdaterade: ${res.rowsAffected} objekt → published=1`);

const after = await client.execute({
  sql: `SELECT COUNT(*) AS n FROM crm_properties WHERE published = 1 AND status = 'available'`,
  args: [],
});
console.log(`Totalt publicerade (available): ${after.rows[0].n}`);
