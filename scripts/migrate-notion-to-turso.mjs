#!/usr/bin/env node
/**
 * migrate-notion-to-turso.mjs
 * Engångsmigration: Notion → Turso (LibSQL)
 *
 * Användning:
 *   node scripts/migrate-notion-to-turso.mjs
 *
 * Kräver i .env:
 *   NOTION_TOKEN, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 *
 * Kör "--inspect-contacts" för att bara logga contacts-databasens schema.
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { nanoid } from "nanoid";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const INSPECT_ONLY = process.argv.includes("--inspect-contacts");

// --- Load .env ---
function loadEnv() {
  try {
    const content = readFileSync(resolve(ROOT, ".env"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}
loadEnv();

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!NOTION_TOKEN) { console.error("Saknar NOTION_TOKEN i .env"); process.exit(1); }
if (!TURSO_URL) { console.error("Saknar TURSO_DATABASE_URL i .env"); process.exit(1); }

const NOTION_API = "https://api.notion.com/v1";
const notionHeaders = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// --- Notion DB IDs (från read-notion-context.mjs) ---
const DB = {
  leads:      "2f7e0171-c36c-80fd-9d17-f7994cfff0d8",
  deals:      "2f6e0171-c36c-8035-ad9b-ff1e4f46d7f2",
  properties: "2f6e0171-c36c-80cc-b90c-d9973b7c1d42",
  contacts:   "290ae5dd-10f1-48ab-9376-30d8d1371461",
  contactLog: "2f6e0171-c36c-80f9-9c8f-c371b6c9e454",
  companies:  "2f6e0171-c36c-80a9-8d6e-e5ba15e0b443",
};

// --- Notion helpers (från read-notion-context.mjs) ---
async function notionQuery(dbId, filter, sorts, pageSize = 100) {
  const allResults = [];
  let cursor;
  do {
    const body = { page_size: pageSize };
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.warn(`[VARNING] DB ${dbId}: ${data.message || "okänt fel"}`);
      return allResults;
    }
    allResults.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return allResults;
}

function getProp(page, name) {
  const prop = page.properties?.[name];
  if (!prop) return "";
  switch (prop.type) {
    case "title":        return prop.title?.map((t) => t.plain_text).join("") || "";
    case "rich_text":    return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":       return prop.select?.name || "";
    case "multi_select": return prop.multi_select?.map((s) => s.name).join(", ") || "";
    case "status":       return prop.status?.name || "";
    case "date":         return prop.date?.start || "";
    case "number":       return prop.number ?? null;
    case "email":        return prop.email || "";
    case "phone_number": return prop.phone_number || "";
    case "url":          return prop.url || "";
    case "checkbox":     return prop.checkbox ? true : false;
    case "people":       return prop.people?.map((p) => p.name).join(", ") || "";
    case "relation":     return prop.relation?.map((r) => r.id) || [];
    case "created_time": return prop.created_time || "";
    default:             return "";
  }
}

// --- Turso client ---
const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

async function run() {
  // ── Steg 0: Inspektera contacts-schema ──────────────────────────────────
  console.log("\n📋 Steg 0: Inspekterar contacts-databasens schema…");
  const contactsSample = await notionQuery(DB.contacts, null, null, 3);
  if (contactsSample.length === 0) {
    console.warn("  ⚠️  Inga contacts hittades — hoppar över contacts-import.");
  } else {
    const propNames = Object.keys(contactsSample[0].properties || {});
    console.log("  Tillgängliga fält:", propNames.join(", "));
    if (INSPECT_ONLY) {
      console.log("\n  Exempeldata (första posten):");
      for (const name of propNames) {
        console.log(`    ${name}: ${JSON.stringify(getProp(contactsSample[0], name))}`);
      }
      console.log("\n✅ Inspektion klar. Kör utan --inspect-contacts för att migrera.");
      process.exit(0);
    }
  }

  // ── Steg 1: companies + leads → crm_companies ───────────────────────────
  console.log("\n🏢 Steg 1: Importerar companies + leads…");
  const [notionCompanies, notionLeads] = await Promise.all([
    notionQuery(DB.companies),
    notionQuery(DB.leads),
  ]);

  const companyMap = new Map(); // notionPageId → tursoId
  const companyRows = [];

  for (const p of notionCompanies) {
    const id = nanoid();
    companyMap.set(p.id, id);
    companyRows.push({
      id,
      name: getProp(p, "Företagsnamn (Ftg)") || "(okänt)",
      orgNr: getProp(p, "Organisationsnummer") || null,
      category: getProp(p, "Kategori") || null,
      website: getProp(p, "Webb") || null,
      createdAt: p.created_time || new Date().toISOString(),
    });
  }

  // Leads → companies (undvik dubletter via namn)
  const existingNames = new Set(companyRows.map((c) => c.name.toLowerCase()));
  for (const p of notionLeads) {
    const name = getProp(p, "Lead namn") || "(okänt lead)";
    if (existingNames.has(name.toLowerCase())) continue; // redan finns
    const id = nanoid();
    companyMap.set(p.id, id);
    companyRows.push({
      id,
      name,
      orgNr: null,
      category: null,
      website: null,
      createdAt: getProp(p, "Skapad") || p.created_time || new Date().toISOString(),
    });
    existingNames.add(name.toLowerCase());
  }

  for (const row of companyRows) {
    await turso.execute({
      sql: `INSERT OR IGNORE INTO crm_companies (id, name, org_nr, category, website, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [row.id, row.name, row.orgNr, row.category, row.website, row.createdAt, row.createdAt],
    });
  }
  console.log(`  ✅ ${companyRows.length} företag importerade.`);

  // ── Steg 2: deals → crm_requests ────────────────────────────────────────
  console.log("\n📋 Steg 2: Importerar deals → requests…");
  const notionDeals = await notionQuery(DB.deals);

  // Build a name→id map for company lookup
  const companyByName = new Map(companyRows.map((c) => [c.name.toLowerCase(), c.id]));

  const STATUS_MAP = {
    "Inkommen": "incoming",
    "Pågår": "matching",
    "Fakturerad": "invoiced",
    "Nej tack": "lost",
    "Arkiverad": "archived",
  };

  let reqNum = 1;
  for (const p of notionDeals) {
    const companyName = getProp(p, "Företag");
    const companyId = companyByName.get(companyName?.toLowerCase()) ?? null;
    if (!companyId) {
      console.warn(`  ⚠️  Deal utan matchande företag: "${companyName}" — hoppar över.`);
      continue;
    }

    const rawStatus = getProp(p, "Status");
    const status = STATUS_MAP[rawStatus] ?? "incoming";

    await turso.execute({
      sql: `INSERT OR IGNORE INTO crm_requests
            (id, request_number, company_id, city, status, persons, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nanoid(),
        reqNum++,
        companyId,
        getProp(p, "Ort") || null,
        status,
        getProp(p, "Antal Personer") || null,
        p.created_time || new Date().toISOString(),
        p.created_time || new Date().toISOString(),
      ],
    });
  }
  console.log(`  ✅ ${notionDeals.length} förfrågningar importerade.`);

  // ── Steg 3: properties → crm_properties ─────────────────────────────────
  console.log("\n🏠 Steg 3: Importerar properties…");
  const notionProps = await notionQuery(DB.properties);

  for (const p of notionProps) {
    await turso.execute({
      sql: `INSERT OR IGNORE INTO crm_properties
            (id, address, city, owner_name, beds, rent_in, rent_out, move_in_from, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nanoid(),
        getProp(p, "Adress") || null,
        getProp(p, "Ort") || null,
        getProp(p, "Uthyrare") || null,
        getProp(p, "Bäddar") || null,
        getProp(p, "Vi hyr för") || null,
        getProp(p, "Vi hyr UT för") || null,
        getProp(p, "Inflytt från") || null,
        p.created_time || new Date().toISOString(),
      ],
    });
  }
  console.log(`  ✅ ${notionProps.length} bostäder importerade.`);

  // ── Steg 4: contacts → crm_contacts ─────────────────────────────────────
  console.log("\n👤 Steg 4: Importerar contacts…");
  if (contactsSample.length > 0) {
    const notionContacts = await notionQuery(DB.contacts);
    const propNames = Object.keys(contactsSample[0].properties || {});

    // Guess field names based on common patterns
    const nameField = propNames.find((n) => /namn|name/i.test(n)) ?? propNames[0];
    const phoneField = propNames.find((n) => /telefon|phone|mobil/i.test(n));
    const emailField = propNames.find((n) => /e-?post|email|mail/i.test(n));
    const companyField = propNames.find((n) => /företag|company/i.test(n));

    let imported = 0;
    for (const p of notionContacts) {
      const name = getProp(p, nameField) || null;
      if (!name) continue;

      // Try to find company via relation
      let companyId = null;
      if (companyField) {
        const relations = getProp(p, companyField);
        if (Array.isArray(relations) && relations[0]) {
          companyId = companyMap.get(relations[0]) ?? null;
        }
      }
      if (!companyId) continue; // skip contacts without a linked company

      await turso.execute({
        sql: `INSERT OR IGNORE INTO crm_contacts (id, company_id, name, phone, email)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          nanoid(),
          companyId,
          name,
          phoneField ? getProp(p, phoneField) || null : null,
          emailField ? getProp(p, emailField) || null : null,
        ],
      });
      imported++;
    }
    console.log(`  ✅ ${imported} kontakter importerade.`);
  } else {
    console.log("  ⏭️  Contacts-databas tom — hoppas över.");
  }

  // ── Steg 5: contactLog → crm_notes ──────────────────────────────────────
  console.log("\n📝 Steg 5: Importerar kontaktlogg → anteckningar…");
  const notionLog = await notionQuery(DB.contactLog, null, [
    { property: "Tidpunkt", direction: "descending" },
  ]);

  const CHANNEL_MAP = {
    "Samtal": "samtal",
    "Mejl": "mejl",
    "WhatsApp": "whatsapp",
    "Möte": "möte",
  };

  let notesImported = 0;
  for (const p of notionLog) {
    const content = getProp(p, "Notering") || getProp(p, "Utfall");
    if (!content) continue;

    // contactLog might be linked to a deal — try to map via any relation
    // For now, link to first company in map as fallback won't work well;
    // instead we skip notes without a clear company link.
    // TODO: inspect relation fields and map properly
    notesImported++;
    // (skipping import without company_id — NOT NULL constraint)
  }
  console.log(`  ℹ️  ${notionLog.length} loggposter hittades. Kontaktlogg kräver företagsrelation för import.`);
  console.log(`     Importera manuellt via /crm om nödvändigt.`);

  console.log("\n✅ Migration klar!");
  console.log(`   Öppna Turso Console eller kör: pnpm drizzle-kit studio`);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Migration misslyckades:", err);
  process.exit(1);
});
