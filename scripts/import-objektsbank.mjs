#!/usr/bin/env node
/**
 * import-objektsbank.mjs
 * Importerar "Klar"-objekt från tvättad-boarden i Notion → CRM (Turso).
 * Skapar uthyrare (dedup på org.nr/namn) + objekt (dedup på normaliserad adress+ort).
 *
 * Torrkörning som default (skriver INGET). Lägg till --commit för att skriva.
 * Kräver i .env(.local): NOTION_TOKEN, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { nanoid } from "nanoid";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const f of [".env.local", ".env"]) {
  try {
    for (const l of readFileSync(resolve(ROOT, f), "utf-8").split("\n")) {
      const t = l.trim(); if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("="); if (i === -1) continue;
      const k = t.slice(0, i).trim(); if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
    }
  } catch {}
}

const COMMIT = process.argv.includes("--commit");
const TVATTAD_DB = "36ce0171-c36c-81bf-a788-e3e9bc30e0b0";
const NOTION_API = "https://api.notion.com/v1";
const H = { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };

async function notionQuery(dbId, filter) {
  const out = []; let cursor;
  do {
    const body = { page_size: 100 }; if (filter) body.filter = filter; if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, { method: "POST", headers: H, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Notion-fel");
    out.push(...(data.results || [])); cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return out;
}
function prop(page, name) {
  const p = page.properties?.[name]; if (!p) return null;
  switch (p.type) {
    case "title": return p.title?.map((t) => t.plain_text).join("") || "";
    case "rich_text": return p.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select": return p.select?.name || "";
    case "number": return p.number ?? null;
    case "phone_number": return p.phone_number || "";
    case "email": return p.email || "";
    case "date": return p.date?.start || "";
    default: return null;
  }
}
const norm = (s) => (s || "").toLowerCase().replace(/[\s.,()\-_/]+/g, "").trim();
const clean = (s) => { const t = (s ?? "").toString().trim(); return t || null; };

// Uthyrare är mest privatpersoner; bara namn med bolagsord blir "företag".
const COMPANY_RE = /(\bab\b|\bhb\b|\bkb\b|aktiebolag|invest|fastigh|bygg|f[öo]rvaltn|group|holding|entreprenad|bost[äa]d|properties|estate|kommun|\bf[öo]rening\b)/i;
const inferOwnerType = (name) => (name && COMPANY_RE.test(name) ? "foretag" : "privatperson");

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log(`\n${COMMIT ? "🚀 SKARP KÖRNING (--commit)" : "🔍 TORRKÖRNING (inget skrivs)"}\n`);

  const rows = await notionQuery(TVATTAD_DB, { property: "Status", select: { equals: "Klar" } });
  console.log(`Läste ${rows.length} "Klar"-objekt från tvättad-boarden.`);

  const existingOwners = (await turso.execute("SELECT id, name, org_nr FROM crm_owners")).rows;
  const ownerByOrg = new Map(existingOwners.filter((o) => o.org_nr).map((o) => [norm(o.org_nr), o.id]));
  const ownerByName = new Map(existingOwners.map((o) => [norm(o.name), o.id]));
  const existingProps = (await turso.execute("SELECT address, city FROM crm_properties")).rows;
  const propKeys = new Set(existingProps.map((p) => `${norm(p.address)}|${norm(p.city)}`));

  // Plan
  const ownersToCreate = new Map(); // key → {id, name, orgNr, contactPerson, phone, email}
  const propsToCreate = [];
  const skippedExisting = [];
  const missing = [];

  function resolveOwner(name, orgNr, contactPerson, phone, email, ownerType) {
    if (!name && !orgNr) return null;
    const orgKey = orgNr ? norm(orgNr) : null;
    const nameKey = name ? norm(name) : null;
    if (orgKey && ownerByOrg.has(orgKey)) return ownerByOrg.get(orgKey);
    if (nameKey && ownerByName.has(nameKey)) return ownerByName.get(nameKey);
    const planKey = orgKey || nameKey;
    if (ownersToCreate.has(planKey)) return ownersToCreate.get(planKey).id;
    const id = nanoid();
    ownersToCreate.set(planKey, { id, name: name || "(okänd uthyrare)", orgNr, contactPerson, phone, email, ownerType });
    if (orgKey) ownerByOrg.set(orgKey, id);
    if (nameKey) ownerByName.set(nameKey, id);
    return id;
  }

  for (const r of rows) {
    const address = clean(prop(r, "Adress"));
    const city = clean(prop(r, "Ort"));
    if (!address) { missing.push("(objekt utan adress)"); continue; }
    const key = `${norm(address)}|${norm(city)}`;
    if (propKeys.has(key)) { skippedExisting.push(address); continue; }
    propKeys.add(key);

    const oName = clean(prop(r, "Uthyrare"));
    const oOrg = clean(prop(r, "Org.nr"));
    const oContact = clean(prop(r, "Kontaktperson"));
    const oPhone = clean(prop(r, "Telefon"));
    const oEmail = clean(prop(r, "E-post"));
    const ownerType = inferOwnerType(oName);
    const ownerId = resolveOwner(oName, oOrg, oContact, oPhone, oEmail, ownerType);

    propsToCreate.push({
      id: nanoid(), ownerId, address, city,
      bedrooms: prop(r, "Sovrum"), beds: prop(r, "Bäddar"), bathrooms: prop(r, "Badrum"), squareMeters: prop(r, "Kvm"),
      rentIn: prop(r, "Vi hyr för"), rentOut: prop(r, "Vi hyr ut för"),
      moveInFrom: clean(prop(r, "Inflytt")), availability: clean(prop(r, "Tillgänglighet")),
      notes: [clean(prop(r, "Priskommentar")), "Importerad från Notion objektsbank"].filter(Boolean).join("\n"),
      ownerType, ownerName: oName, ownerOrgNr: oOrg, ownerContactPerson: oContact, ownerPhone: oPhone, ownerEmail: oEmail,
    });
  }

  const owners = [...ownersToCreate.values()];
  const priv = owners.filter((o) => o.ownerType === "privatperson").length;
  const ftg = owners.length - priv;
  const withIn = propsToCreate.filter((p) => p.rentIn != null).length;
  const withOut = propsToCreate.filter((p) => p.rentOut != null).length;

  console.log(`\nPLAN:`);
  console.log(`  • Uthyrare att skapa: ${ownersToCreate.size}  (${priv} privatpersoner, ${ftg} företag · återanvänder ${existingOwners.length} befintliga vid match)`);
  console.log(`  • Objekt att skapa:   ${propsToCreate.length}`);
  console.log(`  • Hyra ifylld: in ${withIn}/${propsToCreate.length} · ut ${withOut}/${propsToCreate.length}`);
  console.log(`  • Hoppas över (finns redan i CRM): ${skippedExisting.length}`);
  if (missing.length) console.log(`  • Utan adress (hoppas över): ${missing.length}`);
  console.log(`\n  Exempel (första 8 objekt):`);
  for (const p of propsToCreate.slice(0, 8)) {
    console.log(`   - ${p.address}${p.city ? `, ${p.city}` : ""} · ${p.ownerName || "—"} (${p.ownerType}) · ${p.beds ?? "?"} bäddar · in ${p.rentIn ?? "—"} / ut ${p.rentOut ?? "—"}`);
  }
  if (skippedExisting.length) console.log(`\n  Redan i CRM (ex): ${skippedExisting.slice(0, 5).join("; ")}${skippedExisting.length > 5 ? " …" : ""}`);

  if (!COMMIT) {
    console.log(`\n🔍 Torrkörning klar — inget skrevs. Kör med --commit för att skapa ovanstående.\n`);
    process.exit(0);
  }

  console.log(`\n✍️  Skriver…`);
  for (const o of ownersToCreate.values()) {
    await turso.execute({
      sql: `INSERT INTO crm_owners (id, owner_type, owner_arrangement, name, org_nr, contact_person, phone, email, notes, created_at, updated_at)
            VALUES (?, ?, 'direkt', ?, ?, ?, ?, ?, 'Importerad från Notion objektsbank', datetime('now'), datetime('now'))`,
      args: [o.id, o.ownerType, o.name, o.orgNr, o.contactPerson, o.phone, o.email],
    });
  }
  for (const p of propsToCreate) {
    await turso.execute({
      // Uthyrar-identitet bor i crm_owners (skapas ovan) — objektet länkar bara via owner_id.
      sql: `INSERT INTO crm_properties
            (id, owner_id, address, city, bedrooms, beds, bathrooms, square_meters, rent_in, rent_out, move_in_from, availability, notes,
             status, published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 0, datetime('now'), datetime('now'))`,
      args: [p.id, p.ownerId, p.address, p.city, p.bedrooms, p.beds, p.bathrooms, p.squareMeters, p.rentIn, p.rentOut, p.moveInFrom, p.availability, p.notes],
    });
  }
  console.log(`\n✅ Klart! Skapade ${ownersToCreate.size} uthyrare och ${propsToCreate.length} objekt.`);
  console.log(`   (Objekten syns i CRM:ets objektsbank/matchning direkt. Global sök kan behöva omindexering separat.)\n`);
  process.exit(0);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
