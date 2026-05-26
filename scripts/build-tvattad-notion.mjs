#!/usr/bin/env node
/**
 * build-tvattad-notion.mjs
 * Läser objektsbanken + företag + kontakter i Notion, löser upp relationerna
 * (Uthyrare → företag + kontaktperson, Ort → ortnamn), kvalitetsklassar varje
 * objekt (Klar / Granska / Skräp) och skapar en NY Notion-databas "Objektsbank –
 * tvättad" som Kajsa kan granska/rätta innan import till CRM:et.
 *
 * Skriver INGET i CRM-databasen. Skapar bara en ny Notion-databas + rader.
 *
 * Användning: node scripts/build-tvattad-notion.mjs [--parent <page_id>]
 * Kräver i .env: NOTION_TOKEN
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    try {
      for (const line of readFileSync(resolve(ROOT, file), "utf-8").split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i === -1) continue;
        const k = t.slice(0, i).trim();
        if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
      }
    } catch {}
  }
}
loadEnv();

const TOKEN = process.env.NOTION_TOKEN;
if (!TOKEN) { console.error("Saknar NOTION_TOKEN"); process.exit(1); }
const API = "https://api.notion.com/v1";
const H = { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };

const DB = {
  properties: "2f6e0171-c36c-80cc-b90c-d9973b7c1d42",
  companies: "2f6e0171-c36c-80a9-8d6e-e5ba15e0b443",
  contacts: "290ae5dd-10f1-48ab-9376-30d8d1371461",
};

const argParent = (() => {
  const i = process.argv.indexOf("--parent");
  return i !== -1 ? process.argv[i + 1] : null;
})();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function notion(path, { method = "GET", body } = {}, attempt = 0) {
  const res = await fetch(`${API}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 429 && attempt < 5) {
    const wait = Number(res.headers.get("retry-after") || 1) * 1000 || 1000;
    await sleep(wait + 250);
    return notion(path, { method, body }, attempt + 1);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${data.message || JSON.stringify(data).slice(0, 200)}`);
  return data;
}

async function queryAll(dbId) {
  const out = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await notion(`/databases/${dbId}/query`, { method: "POST", body });
    out.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
    await sleep(120);
  } while (cursor);
  return out;
}

function prop(page, name) {
  const p = page.properties?.[name];
  if (!p) return null;
  switch (p.type) {
    case "title": return p.title?.map((t) => t.plain_text).join("") || "";
    case "rich_text": return p.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select": return p.select?.name || "";
    case "multi_select": return p.multi_select?.map((s) => s.name) || [];
    case "status": return p.status?.name || "";
    case "date": return p.date?.start || "";
    case "number": return p.number ?? null;
    case "email": return p.email || "";
    case "phone_number": return p.phone_number || "";
    case "url": return p.url || "";
    case "relation": return p.relation?.map((r) => r.id) || [];
    default: return null;
  }
}

function pageTitle(page) {
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") return v.title?.map((t) => t.plain_text).join("") || "";
  }
  return "";
}

const txt = (s) => (s ? [{ text: { content: String(s).slice(0, 2000) } }] : []);

async function main() {
  console.log("📥 Hämtar företag, kontakter och objekt från Notion…");
  const [companies, contacts, properties] = await Promise.all([
    queryAll(DB.companies),
    queryAll(DB.contacts),
    queryAll(DB.properties),
  ]);
  console.log(`   ${companies.length} företag, ${contacts.length} kontakter, ${properties.length} objekt.`);

  const contactById = new Map(
    contacts.map((c) => [c.id, { name: pageTitle(c), phone: prop(c, "Telefon"), email: prop(c, "E-post"), roll: prop(c, "Roll/Titel") }])
  );
  const companyById = new Map(
    companies.map((c) => [c.id, {
      name: prop(c, "Företagsnamn (Ftg)") || pageTitle(c),
      orgNr: prop(c, "Organisationsnummer"),
      categories: prop(c, "Kategori") || [],
      kontaktIds: prop(c, "Kontakter") || [],
    }])
  );

  // Resolva ort-relationer (hämtar varje unik ort-sida en gång).
  const ortIds = new Set();
  for (const p of properties) (prop(p, "Ort") || []).forEach((id) => ortIds.add(id));
  const ortById = new Map();
  console.log(`🔎 Löser upp ${ortIds.size} orter…`);
  for (const id of ortIds) {
    try { ortById.set(id, pageTitle(await notion(`/pages/${id}`))); } catch { ortById.set(id, ""); }
    await sleep(160);
  }

  const rows = properties.map((p) => {
    const address = prop(p, "Adress") || "";
    const ort = (prop(p, "Ort") || []).map((id) => ortById.get(id)).filter(Boolean).join(", ");
    const uthyrareId = (prop(p, "Uthyrare") || [])[0];
    const company = uthyrareId ? companyById.get(uthyrareId) : null;
    const kontakt = company ? contactById.get((company.kontaktIds || [])[0]) : null;
    const rentIn = prop(p, "Vi hyr för");
    const rentOut = prop(p, "Vi hyr UT för");

    const missing = [];
    if (!address.trim()) missing.push("Adress");
    if (rentIn == null && rentOut == null) missing.push("Hyra");
    if (!uthyrareId) missing.push("Uthyrare");

    const junk = !address.trim() || /\(\s*\d+\s*kopplingar\s*\)/i.test(address);
    const summaryish = /\d\s*,\s*\d/.test(address) && /sovrum/i.test(address);
    const status = junk ? "Skräp" : missing.length || summaryish ? "Granska" : "Klar";

    return {
      notionId: p.id,
      address, ort,
      uthyrare: company?.name || (uthyrareId ? "(okänd – företag saknas)" : ""),
      orgNr: company?.orgNr || "",
      kontaktperson: kontakt?.name || "",
      telefon: kontakt?.phone || "",
      epost: kontakt?.email || "",
      sovrum: prop(p, "Sovrum"), baddar: prop(p, "Bäddar"), badrum: prop(p, "Badrum"), kvm: prop(p, "Kvm"),
      rentIn, rentOut,
      inflytt: prop(p, "Inflytt från") || "",
      tillganglighet: prop(p, "Tillgänglighet") || "",
      priskommentar: prop(p, "Priskommentar") || "",
      missing, status,
    };
  });

  const counts = rows.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
  const owners = new Set(rows.map((r) => r.uthyrare).filter((u) => u && !u.startsWith("("))).size;
  console.log(`📊 ${counts["Klar"] || 0} klara · ${counts["Granska"] || 0} att granska · ${counts["Skräp"] || 0} skräp · ${owners} unika uthyrare`);

  // Hitta en förälder-sida att skapa databasen under.
  let parentId = argParent || process.env.NOTION_TVATTAD_PARENT;
  if (!parentId) {
    const search = await notion(`/search`, { method: "POST", body: { filter: { value: "page", property: "object" }, page_size: 50 } });
    const pages = search.results || [];
    const pick = pages.find((p) => /crm|stayonsite|objekt|tvätt/i.test(pageTitle(p))) || pages.find((p) => p.parent?.type === "workspace") || pages[0];
    parentId = pick?.id;
    if (parentId) console.log(`🗂  Använder förälder-sida: "${pageTitle(pick)}" (${parentId})`);
  }
  if (!parentId && process.env.NOTION_STANDUPS_PAGE_ID) {
    parentId = process.env.NOTION_STANDUPS_PAGE_ID;
    console.log(`🗂  Fallback: lägger databasen under Standups-sidan (${parentId}) — du kan flytta den i Notion.`);
  }
  if (!parentId) {
    console.error("❌ Hittade ingen förälder-sida som boten har åtkomst till. Kör med --parent <page_id> eller dela en sida med integrationen.");
    process.exit(1);
  }

  console.log("🆕 Skapar databas 'Objektsbank – tvättad'…");
  const database = await notion(`/databases`, {
    method: "POST",
    body: {
      parent: { type: "page_id", page_id: parentId },
      title: [{ type: "text", text: { content: "Objektsbank – tvättad" } }],
      properties: {
        "Adress": { title: {} },
        "Status": { select: { options: [
          { name: "Klar", color: "green" }, { name: "Granska", color: "yellow" }, { name: "Skräp", color: "red" },
        ] } },
        "Saknar": { multi_select: { options: [
          { name: "Adress", color: "red" }, { name: "Hyra", color: "orange" }, { name: "Uthyrare", color: "yellow" },
        ] } },
        "Ort": { rich_text: {} },
        "Uthyrare": { rich_text: {} },
        "Org.nr": { rich_text: {} },
        "Kontaktperson": { rich_text: {} },
        "Telefon": { phone_number: {} },
        "E-post": { email: {} },
        "Sovrum": { number: {} },
        "Bäddar": { number: {} },
        "Badrum": { number: {} },
        "Kvm": { number: {} },
        "Vi hyr för": { number: {} },
        "Vi hyr ut för": { number: {} },
        "Inflytt": { date: {} },
        "Tillgänglighet": { rich_text: {} },
        "Priskommentar": { rich_text: {} },
        "Notion-id": { rich_text: {} },
      },
    },
  });
  console.log(`   ✅ Databas skapad: ${database.url}`);

  const isoDate = (s) => (/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null);
  let n = 0;
  for (const r of rows) {
    const props = {
      "Adress": { title: txt(r.address || "(namnlöst objekt)") },
      "Status": { select: { name: r.status } },
      "Saknar": { multi_select: r.missing.map((m) => ({ name: m })) },
      "Ort": { rich_text: txt(r.ort) },
      "Uthyrare": { rich_text: txt(r.uthyrare) },
      "Org.nr": { rich_text: txt(r.orgNr) },
      "Kontaktperson": { rich_text: txt(r.kontaktperson) },
      "Telefon": { phone_number: r.telefon || null },
      "E-post": { email: r.epost || null },
      "Sovrum": { number: r.sovrum ?? null },
      "Bäddar": { number: r.baddar ?? null },
      "Badrum": { number: r.badrum ?? null },
      "Kvm": { number: r.kvm ?? null },
      "Vi hyr för": { number: r.rentIn ?? null },
      "Vi hyr ut för": { number: r.rentOut ?? null },
      "Inflytt": { date: isoDate(r.inflytt) ? { start: isoDate(r.inflytt) } : null },
      "Tillgänglighet": { rich_text: txt(r.tillganglighet) },
      "Priskommentar": { rich_text: txt(r.priskommentar) },
      "Notion-id": { rich_text: txt(r.notionId) },
    };
    await notion(`/pages`, { method: "POST", body: { parent: { database_id: database.id }, properties: props } });
    n++;
    if (n % 25 === 0) console.log(`   …${n}/${rows.length} rader`);
    await sleep(340);
  }

  console.log(`\n✅ Klart! ${n} rader i "Objektsbank – tvättad".`);
  console.log(`   ${database.url}`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
