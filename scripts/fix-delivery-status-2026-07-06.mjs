// Datarättning: de 31 kampanjmottagare vars iMessage aldrig levererades
// (chat.db error=22) märks som failed i crm_outbox_messages — CRM:et sa "sent"
// eftersom Messages accepterade sändningen innan leveransen föll asynkront.
// Ingen sändning sker här. Backup skrivs före ändring.
import { createRequire } from "module";
import fs from "fs";
const require = createRequire("/Users/kajsa/Projects/stayonsite/package.json");
const { createClient } = require("@libsql/client");
const env = fs.readFileSync("/Users/kajsa/Projects/stayonsite/.env.local", "utf8");
const get = (k) => env.match(new RegExp("^" + k + "=(.*)$", "m"))?.[1]?.trim();
const db = createClient({ url: get("TURSO_DATABASE_URL"), authToken: get("TURSO_AUTH_TOKEN") });

const FAILED_PHONES = [
  "+46739825212","+46760698340","+46738392700","+46706951424","+46701499480",
  "+46761692645","+46735770696","+46722210241","+46721454182","+46706370884",
  "+46705329446","+46736910646","+46736136547","+46707584888","+46738243610",
  "+46706529993","+46703594803","+46703482766","+46730324133","+46727294999",
  "+46706565148","+46706419506","+46706554611","+46702582180","+46702764757",
  "+46704610177","+46707545000","+46704600173","+46735894804","+46703023921",
  "+46708240600",
];

const ph = FAILED_PHONES.map(() => "?").join(",");
const rows = await db.execute({
  sql: `SELECT id, to_phone, status, created_at FROM crm_outbox_messages WHERE to_phone IN (${ph}) AND status='sent' AND created_at >= '2026-07-06' AND created_at < '2026-07-07'`,
  args: FAILED_PHONES,
});
console.log(`hittade ${rows.rows.length} kampanjrader att rätta (förväntat 31)`);
fs.writeFileSync(
  "/Users/kajsa/Projects/stayonsite/scripts/delivery-fix-backup.json",
  JSON.stringify({ fixedAt: new Date().toISOString(), reason: "iMessage error 22 — aldrig levererat", rows: rows.rows }, null, 2),
);

const res = await db.execute({
  sql: `UPDATE crm_outbox_messages SET status='failed', error='iMessage error 22 — ej levererat (mottagaren saknar iMessage; upptäckt via chat.db 2026-07-07)' WHERE to_phone IN (${ph}) AND status='sent' AND created_at >= '2026-07-06' AND created_at < '2026-07-07'`,
  args: FAILED_PHONES,
});
console.log(`uppdaterade: ${res.rowsAffected} rader → failed (backup: scripts/delivery-fix-backup.json)`);
process.exit(0);
