#!/usr/bin/env node
/**
 * import-kunder.mjs — upsertar kundlista → crm_companies.
 * Skapar nya företag OCH backfillar befintliga: fyller postnr/ort/land/kundnr,
 * skapar primär kontakt med telefon (namn ur mejlet), tar bort temp-anteckningen.
 * Torrkörning som default; --commit för att skriva. Idempotent.
 * ★ = rekonstruerad (avhuggen i källan) e-post — domän MX-verifierad, brevlåda ej.
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { nanoid } from "nanoid";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const f of [".env.local", ".env"]) {
  try { for (const l of readFileSync(resolve(ROOT, f), "utf-8").split("\n")) { const t = l.trim(); if (!t || t.startsWith("#")) continue; const i = t.indexOf("="); if (i === -1) continue; const k = t.slice(0, i).trim(); if (!process.env[k]) process.env[k] = t.slice(i + 1).trim(); } } catch {}
}
const COMMIT = process.argv.includes("--commit");
const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const norm = (s) => (s || "").toString().toLowerCase().replace(/[\s.,()\-_/]+/g, "").trim();
const nameFromEmail = (email) => email.split("@")[0].split(/[._-]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

// kundnr, namn, orgnr, postnr, ort, land, tel, email, lang(sv/en), emailGuess?
const KUNDER = [
  [29, "MM Properties North AB", "559526-2949", "112 61", "Stockholm", "Sverige", "722038459", "william@mondanfastigheter.se", "sv", true],
  [22, "UAB AG Construction Group", "306108772", "LT-68306", "Marijampole", "Lithuania", "", "vadyba@agconstruction.com", "en", true],
  [2, "Reviver AB", "559406-2050", "121 07", "Stockholm-Globen", "Sverige", "0708-399 220", "reviver@levfakturor.se", "sv", false],
  [25, "Bilfinger Sweden AB", "556681-6111", "442 40", "Kungälv", "Sverige", "46706836058", "philip.af.wetterstedt@bilfinger.com", "sv", true],
  [24, "Datacenterworld.pl sp. z o.o.", "5242876112", "05-092", "Dziekanów Polski", "Poland", "48514164932", "Pawel@datacenterworld.pl", "en", true],
  [9, "BS Logistic AB", "556381-7799", "681 25", "Kristinehamn", "Sverige", "706629338", "mats.johansson@bslogistic.se", "sv", true],
  [26, "Mellanskog Ekonomisk Förening", "785000-3349", "752 37", "Uppsala", "Sverige", "", "leverantorsfaktura@mellanskog.se", "sv", true],
  [30, "Rent House & Apartments sp. z o.o", "386024139", "45-315", "Opole", "Poland", "", "kozienice.renthouse@gmail.com", "en", true],
  [28, "Victor Energy AB", "556909-8865", "771 30", "Ludvika", "Sverige", "", "simon@victorenergy.com", "sv", true],
  [6, "IPS COR SERVICES LTD", "635525", "D12 A725", "Dublin 12", "Ireland", "37063250203", "info@ipscorservices.ie", "en", false],
  [8, "Rhino Project Partner", "559416-1845", "892 34", "Domsjö", "Sverige", "730531323", "kevin@rhinoprojectpartner.com", "sv", false],
  [16, "WP Welding AB", "556796-1718", "838 76", "Frösön", "Sverige", "727093030", "jonas.kvist@wpwelding.se", "sv", false],
  [19, "Workershotel Sweden AB", "559300-7833", "444 92", "Jörlanda", "Sverige", "708949669", "anders@workershotel.se", "sv", false],
  [21, "S.O.F AB", "559488-7779", "132 31", "Saltsjö-Boo", "Sverige", "720029015", "roman@absof.se", "sv", false],
  [5, "Solkompaniet Park EPC AB", "559325-2348", "120 50", "Årsta", "Sverige", "707479275", "faktura.park@solkompaniet.se", "sv", true],
  [15, "Workforce Housing International B.V", "93251777", "1016 EA", "Amsterdam", "Netherlands", "31648458693", "e.yarden@w-hi.com", "en", false],
  [14, "Real Estate Ollopa11", "13697786", "EC1V 2NX", "London", "United Kingdom", "736942993", "anders@workersstay.com", "sv", true],
  [27, "Pmp Montex S.R.O", "502094-1455", "", "", "Slovakia", "", "ludovit.kiss@pmpmontex.sk", "en", false],
  [11, "SOLAR STALKONSTRUKCJA SP. Z O.", "502096-1172", "100 74", "Stockholm", "Sverige", "", "a.yurchenko@solarsk.com.ua", "en", false],
];

async function main() {
  console.log(`\n${COMMIT ? "🚀 SKARP KÖRNING" : "🔍 TORRKÖRNING (inget skrivs)"}\n`);
  const existing = (await turso.execute("SELECT id, name, org_nr FROM crm_companies")).rows;
  const byOrg = new Map(existing.filter((c) => c.org_nr).map((c) => [norm(c.org_nr), c.id]));
  const byName = new Map(existing.map((c) => [norm(c.name), c.id]));

  let created = 0, updated = 0;
  for (const [kundnr, name, orgNr, postnr, ort, land, tel, email, lang] of KUNDER) {
    const id = (orgNr && byOrg.get(norm(orgNr))) || byName.get(norm(name)) || null;
    const action = id ? "uppdaterar" : "skapar";
    console.log(`  ${action.padEnd(11)} ${name}  ·  ${[postnr, ort].filter(Boolean).join(" ")}${land ? `, ${land}` : ""}  ·  ${tel ? "📞 " + tel : "ingen tel"}  ·  ${email}`);
    if (id) updated++; else created++;
    if (!COMMIT) continue;

    if (id) {
      await turso.execute({
        sql: `UPDATE crm_companies SET customer_number=?, postal_code=?, city=?, country=?, invoice_email=COALESCE(invoice_email, ?), languages=COALESCE(languages, ?), updated_at=datetime('now') WHERE id=?`,
        args: [String(kundnr), postnr || null, ort || null, land || null, email || null, JSON.stringify([lang]), id],
      });
      await turso.execute({ sql: `DELETE FROM crm_notes WHERE company_id=? AND channel='annat' AND content LIKE 'Kundnr %'`, args: [id] });
      if (tel) {
        const has = (await turso.execute({ sql: `SELECT count(*) c FROM crm_contacts WHERE company_id=? AND phone=?`, args: [id, tel] })).rows[0].c;
        if (!has) await turso.execute({ sql: `INSERT INTO crm_contacts (id, company_id, name, phone, email, is_primary) VALUES (?, ?, ?, ?, ?, 1)`, args: [nanoid(), id, nameFromEmail(email), tel, email || null] });
      }
    } else {
      const cid = nanoid();
      await turso.execute({
        sql: `INSERT INTO crm_companies (id, name, org_nr, lead_source, invoice_email, languages, customer_number, postal_code, city, country, created_at, updated_at)
              VALUES (?, ?, ?, 'befintlig', ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [cid, name, orgNr || null, email || null, JSON.stringify([lang]), String(kundnr), postnr || null, ort || null, land || null],
      });
      if (tel) await turso.execute({ sql: `INSERT INTO crm_contacts (id, company_id, name, phone, email, is_primary) VALUES (?, ?, ?, ?, ?, 1)`, args: [nanoid(), cid, nameFromEmail(email), tel, email || null] });
    }
  }

  console.log(`\n${COMMIT ? "✅ Klart!" : "Plan:"} ${created} att skapa, ${updated} att uppdatera (backfill).`);
  if (!COMMIT) console.log(`Kör med --commit för att skriva.\n`);
  process.exit(0);
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
