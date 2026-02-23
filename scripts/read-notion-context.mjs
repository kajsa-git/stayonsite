#!/usr/bin/env node
/**
 * read-notion-context.mjs
 * Reads CRM data from Kajsa's Notion workspace and outputs a structured
 * summary for standup agents.
 *
 * Usage: node scripts/read-notion-context.mjs
 * Output: JSON to stdout with leads, deals, properties, recent activity, tasks
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// --- Load .env ---
function loadEnv() {
  try {
    const envContent = readFileSync(resolve(ROOT, ".env"), "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}
loadEnv();

const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN) {
  console.error("Missing NOTION_TOKEN in .env");
  process.exit(1);
}

const NOTION_API = "https://api.notion.com/v1";
const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// Database IDs
const DB = {
  leads: "2f7e0171-c36c-80fd-9d17-f7994cfff0d8",
  deals: "2f6e0171-c36c-8035-ad9b-ff1e4f46d7f2",
  properties: "2f6e0171-c36c-80cc-b90c-d9973b7c1d42",
  contacts: "290ae5dd-10f1-48ab-9376-30d8d1371461",
  contactLog: "2f6e0171-c36c-80f9-9c8f-c371b6c9e454",
  tasks: "2f6e0171-c36c-8067-9c2f-f59fedf16f34",
  companies: "2f6e0171-c36c-80a9-8d6e-e5ba15e0b443",
  cities: "2f6e0171-c36c-80e6-a0bf-c075e8d53e42",
};

// Collects warnings during execution
const warnings = [];

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
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = `Database ${dbId}: ${data.message || "unknown error"}`;
      console.error(`[WARNING] ${msg}`);
      warnings.push(msg);
      return allResults; // Return what we have so far
    }
    allResults.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return allResults;
}

// Extract text from Notion property
function getProp(page, name) {
  const prop = page.properties?.[name];
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title?.map((t) => t.plain_text).join("") || "";
    case "rich_text":
      return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":
      return prop.select?.name || "";
    case "multi_select":
      return prop.multi_select?.map((s) => s.name).join(", ") || "";
    case "status":
      return prop.status?.name || "";
    case "date":
      return prop.date?.start || "";
    case "number":
      return prop.number ?? null;
    case "email":
      return prop.email || "";
    case "phone_number":
      return prop.phone_number || "";
    case "url":
      return prop.url || "";
    case "checkbox":
      return prop.checkbox ? "Ja" : "Nej";
    case "people":
      return prop.people?.map((p) => p.name).join(", ") || "";
    case "relation":
      return `(${prop.relation?.length || 0} kopplingar)`;
    case "created_time":
      return prop.created_time || "";
    default:
      return "";
  }
}

async function getLeads() {
  const results = await notionQuery(
    DB.leads,
    null,
    [{ property: "Skapad", direction: "descending" }]
  );
  return results.map((p) => ({
    namn: getProp(p, "Lead namn"),
    status: getProp(p, "Status"),
    källa: getProp(p, "Lead källa"),
    nästaUppföljning: getProp(p, "Nästa uppföljning"),
    anteckningar: getProp(p, "Anteckningar"),
    telefon: getProp(p, "Telefon"),
    epost: getProp(p, "E-post"),
    kontakt: getProp(p, "Kontakt"),
    skapad: getProp(p, "Skapad"),
    ejSvar: getProp(p, "Ej svar"),
  }));
}

async function getDeals() {
  const results = await notionQuery(
    DB.deals,
    null,
    [{ property: "Nästa uppföljning", direction: "ascending" }]
  );
  return results.map((p) => ({
    id: getProp(p, "ID"),
    status: getProp(p, "Status"),
    företag: getProp(p, "Företag"),
    kontaktperson: getProp(p, "Kontaktperson"),
    ort: getProp(p, "Ort"),
    antalPersoner: getProp(p, "Antal Personer"),
    nästaAktivitet: getProp(p, "Nästa Aktivitet"),
    nästaUppföljning: getProp(p, "Nästa uppföljning"),
    tidsperiod: getProp(p, "Time period"),
  }));
}

async function getProperties() {
  const results = await notionQuery(DB.properties);
  return results.map((p) => ({
    adress: getProp(p, "Adress"),
    ort: getProp(p, "Ort"),
    uthyrare: getProp(p, "Uthyrare"),
    sovrum: getProp(p, "Sovrum"),
    bäddar: getProp(p, "Bäddar"),
    badrum: getProp(p, "Badrum"),
    viHyrFör: getProp(p, "Vi hyr för"),
    viHyrUtFör: getProp(p, "Vi hyr UT för"),
    tillgänglighet: getProp(p, "Tillgänglighet"),
    inflyttFrån: getProp(p, "Inflytt från"),
  }));
}

async function getRecentContactLog() {
  const results = await notionQuery(
    DB.contactLog,
    null,
    [{ property: "Tidpunkt", direction: "descending" }],
    20
  );
  return results.map((p) => ({
    tidpunkt: getProp(p, "Tidpunkt"),
    kanal: getProp(p, "Kanal"),
    utfall: getProp(p, "Utfall"),
    notering: getProp(p, "Notering"),
  }));
}

async function getTasks() {
  const results = await notionQuery(
    DB.tasks,
    { property: "Status", status: { does_not_equal: "Klart" } },
    [{ property: "Prioritet", direction: "ascending" }]
  );
  return results.map((p) => ({
    uppgift: getProp(p, "Uppgift"),
    status: getProp(p, "Status"),
    prioritet: getProp(p, "Prioritet"),
    slutdatum: getProp(p, "Slutdatum"),
    anteckningar: getProp(p, "Anteckningar"),
    skapad: p.created_time || "",
  }));
}

async function getCompanies() {
  const results = await notionQuery(DB.companies);
  return results.map((p) => ({
    namn: getProp(p, "Företagsnamn (Ftg)"),
    kategori: getProp(p, "Kategori"),
    webb: getProp(p, "Webb"),
    orgnr: getProp(p, "Organisationsnummer"),
  }));
}

async function getCities() {
  const results = await notionQuery(DB.cities);
  return results.map((p) => ({
    ort: getProp(p, "Ort"),
  }));
}

async function getLatestStandup() {
  // Get the most recent standup page content for context
  const STANDUPS_PAGE_ID = process.env.NOTION_STANDUPS_PAGE_ID;
  if (!STANDUPS_PAGE_ID) return null;

  const res = await fetch(
    `${NOTION_API}/blocks/${STANDUPS_PAGE_ID}/children?page_size=100`,
    { headers }
  );
  const data = await res.json();
  if (!data.results) return null;

  // Find the latest weekly standup page
  const standupPages = data.results
    .filter(
      (b) =>
        b.type === "child_page" &&
        b.child_page?.title?.startsWith("StayOnSite Vecko-Standup")
    )
    .reverse();

  if (standupPages.length === 0) return null;
  const latestId = standupPages[0].id;
  const title = standupPages[0].child_page.title;

  // Read its content
  const contentRes = await fetch(
    `${NOTION_API}/blocks/${latestId}/children?page_size=100`,
    { headers }
  );
  const contentData = await contentRes.json();
  if (!contentData.results) return { title, content: "(tom)" };

  const texts = contentData.results
    .map((block) => {
      const rt =
        block[block.type]?.rich_text ||
        block[block.type]?.text;
      if (rt && Array.isArray(rt))
        return rt.map((t) => t.plain_text).join("");
      if (block.type === "child_page")
        return `[Undersida: ${block.child_page?.title}]`;
      return "";
    })
    .filter(Boolean);

  return { title, content: texts.join("\n").slice(0, 3000) };
}

// --- RSS news fetcher for omvärldsbevakning ---
const NEWS_FEEDS = [
  { name: "Fastighetstidningen", url: "https://fastighetstidningen.se/feed/" },
  { name: "Dagens Fastigheter", url: "https://www.dagensfastigheter.se/rss" },
  { name: "DI", url: "https://www.di.se/rss" },
];

// Only show news relevant to StayOnSite's market
const NEWS_KEYWORDS = [
  "bostad", "hyra", "hyres", "uthyr", "fastighet", "bygg", "bostads",
  "infrastruktur", "entrepren", "projekt", "kommun", "region",
  "energi", "industri", "etabler", "investering", "boverket",
  "stål", "skog", "gruv", "vindkraft", "datacenter", "försvars",
  "arbetskraft", "personal", "rekryter", "boende", "lägenhets",
  "samtrygg", "qasa", "forenom", "corporate housing",
  "privatuthyrning", "andrahand", "blockhyra",
];

async function fetchNews() {
  const allNews = [];
  for (const feed of NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "StayOnSite-CRM/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      // Simple XML title extraction (no parser dependency)
      const items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)];
      for (const item of items.slice(0, 5)) {
        const titleMatch = item[0].match(/<title><!\[CDATA\[(.*?)\]\]>/i)
          || item[0].match(/<title>(.*?)<\/title>/i)
          || item[0].match(/<Title>(.*?)<\/Title>/i);
        const dateMatch = item[0].match(/<pubDate>(.*?)<\/pubDate>/i);
        let title = titleMatch ? (titleMatch[1] || "").trim() : null;
        if (!title) continue;
        // Decode common HTML/XML entities
        title = title
          .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&ndash;/g, "–");
        const date = dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : "";
        allNews.push({ source: feed.name, title, date });
      }
    } catch {
      // Feed unavailable — skip silently
    }
  }
  // Filter to only relevant news
  const relevant = allNews.filter((n) => {
    const text = n.title.toLowerCase();
    return NEWS_KEYWORDS.some((kw) => text.includes(kw));
  });
  // Sort by date descending, take top 8
  relevant.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return relevant.slice(0, 8);
}

// --- Compact text output (--compact flag) ---
function formatCompact(leads, deals, properties, contactLog, tasks, companies, cities, news) {
  const today = new Date();
  const in7days = new Date(today);
  in7days.setDate(in7days.getDate() + 7);
  const todayStr = today.toISOString().slice(0, 10);

  const lines = [];
  lines.push(`STAYONSITE CRM (${todayStr})`);
  lines.push(`Leads: ${leads.length} | Affärer: ${deals.length} | Objekt: ${properties.length} | Företag: ${companies.length} | Orter: ${cities.length}`);
  if (warnings.length) lines.push(`Varningar: ${warnings.join("; ")}`);
  lines.push("");

  // Leads needing follow-up (next 7 days) — max 10
  const urgent = leads.filter((l) => {
    if (!l.nästaUppföljning) return false;
    return l.nästaUppföljning <= in7days.toISOString().slice(0, 10);
  });
  if (urgent.length) {
    lines.push(`UPPFÖLJNING (${urgent.length} st inom 7 dagar):`);
    for (const l of urgent.slice(0, 10)) {
      const note = l.anteckningar ? l.anteckningar.replace(/Kontaktad \S+\s*/g, "").replace(/Ej svar \S+\s*/g, "ej svar ").trim().slice(0, 40) : "";
      lines.push(`  ${l.namn} | ${l.status || "-"} | ${l.nästaUppföljning}${note ? " | " + note : ""}`);
    }
    if (urgent.length > 10) lines.push(`  +${urgent.length - 10} till`);
    lines.push("");
  }

  // Hot deals only
  const hot = deals.filter((d) => d.status === "Heta affärer" || d.status === "Skickat förslag");
  if (hot.length) {
    lines.push(`HETA AFFÄRER (${hot.length} st):`);
    for (const d of hot.slice(0, 8)) {
      const desc = d.ort || d.företag || d.kontaktperson || d.id || "?";
      const pers = d.antalPersoner ? ` (${d.antalPersoner}p)` : "";
      lines.push(`  ${desc}${pers} — ${d.status}`);
    }
    lines.push("");
  }

  // Properties — only show entries with missing critical fields
  if (properties.length) {
    const requiredFields = ["adress", "ort", "uthyrare", "viHyrFör"];
    const fieldLabels = { adress: "Adress", ort: "Ort", uthyrare: "Uthyrare", viHyrFör: "Hyra" };
    const incomplete = properties
      .map((p) => {
        const missing = requiredFields.filter((f) => !p[f] || String(p[f]).trim() === "");
        return missing.length ? { adress: p.adress || p.ort || "(namnlöst objekt)", missing } : null;
      })
      .filter(Boolean);
    if (incomplete.length) {
      lines.push(`OBJEKTSBANKEN — SAKNADE FÄLT (${incomplete.length} av ${properties.length} objekt):`);
      for (const obj of incomplete) {
        const missingLabels = obj.missing.map((f) => fieldLabels[f]).join(", ");
        lines.push(`  ${obj.adress} — saknar: ${missingLabels}`);
      }
      lines.push("");
    }
  }

  // Cities
  if (cities.length) {
    lines.push(`ORTER: ${cities.map((c) => c.ort).filter(Boolean).join(", ")}`);
    lines.push("");
  }

  // Recent contacts (last 5)
  if (contactLog.length) {
    lines.push(`SENASTE KONTAKTER:`);
    for (const c of contactLog.slice(0, 5)) {
      const note = c.notering ? ` "${c.notering.slice(0, 50)}"` : "";
      lines.push(`  ${c.tidpunkt?.slice(0, 10) || "?"} ${c.kanal || "?"} → ${c.utfall || "?"}${note}`);
    }
    lines.push("");
  }

  // K daily doos — all open tasks with age tracking
  if (tasks.length) {
    const STALE_DAYS = 7;
    const tasksWithAge = tasks.map((t) => {
      const created = t.skapad ? new Date(t.skapad) : null;
      const ageDays = created ? Math.floor((today - created) / (1000 * 60 * 60 * 24)) : null;
      return { ...t, ageDays };
    });
    const stale = tasksWithAge.filter((t) => t.ageDays !== null && t.ageDays >= STALE_DAYS);
    const fresh = tasksWithAge.filter((t) => t.ageDays === null || t.ageDays < STALE_DAYS);

    if (stale.length) {
      lines.push(`K DAILY DOOS — GAMLA UPPGIFTER (${stale.length} st, >${STALE_DAYS} dagar):`);
      lines.push(`  → Åtgärda: genomför | pausa till datum | ta bort | bryt ner i steg`);
      for (const t of stale) {
        const deadline = t.slutdatum ? ` deadline ${t.slutdatum}` : "";
        lines.push(`  ${t.uppgift} [${t.ageDays}d]${t.prioritet ? " [" + t.prioritet + "]" : ""}${deadline}`);
      }
      lines.push("");
    }
    if (fresh.length) {
      lines.push(`K DAILY DOOS — AKTUELLA (${fresh.length} st):`);
      for (const t of fresh) {
        const age = t.ageDays !== null ? ` [${t.ageDays}d]` : "";
        lines.push(`  ${t.uppgift}${age}${t.prioritet ? " [" + t.prioritet + "]" : ""}`);
      }
      lines.push("");
    }
  }

  // Lead sources + company categories (one-liners)
  const sources = {};
  for (const l of leads) sources[l.källa || "Okänd"] = (sources[l.källa || "Okänd"] || 0) + 1;
  lines.push(`LEAD-KÄLLOR: ${Object.entries(sources).sort((a,b) => b[1]-a[1]).map(([k, v]) => `${k}(${v})`).join(", ")}`);

  // Top 5 company categories only (skip composite labels)
  const cats = {};
  for (const c of companies) {
    const cat = (c.kategori || "-").split(",")[0].trim();
    cats[cat] = (cats[cat] || 0) + 1;
  }
  const topCats = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0, 5);
  lines.push(`BRANSCHER: ${topCats.map(([k, v]) => `${k}(${v})`).join(", ")}`);

  // Omvärldsbevakning — RSS news
  if (news && news.length) {
    lines.push("");
    lines.push(`OMVÄRLDSBEVAKNING (${news.length} nyheter):`);
    for (const n of news) {
      lines.push(`  ${n.date} [${n.source}] ${n.title}`);
    }
  }

  return lines.join("\n");
}

// --- Main ---
async function main() {
  const isCompact = process.argv.includes("--compact");

  const [leads, deals, properties, contactLog, tasks, companies, cities, lastStandup, news] =
    await Promise.all([
      getLeads(),
      getDeals(),
      getProperties(),
      getRecentContactLog(),
      getTasks(),
      getCompanies(),
      getCities(),
      isCompact ? Promise.resolve(null) : getLatestStandup(),
      isCompact ? fetchNews() : Promise.resolve([]),
    ]);

  if (isCompact) {
    console.log(formatCompact(leads, deals, properties, contactLog, tasks, companies, cities, news));
    return;
  }

  const context = {
    genererat: new Date().toISOString(),
    status: warnings.length === 0 ? "ok" : "partial",
    warnings,
    sammanfattning: {
      antalLeads: leads.length,
      antalAffärer: deals.length,
      antalObjekt: properties.length,
      antalFöretag: companies.length,
      antalOrter: cities.length,
    },
    leads,
    affärsmöjligheter: deals,
    objektsbank: properties,
    kontaktlogg: contactLog,
    uppgifter: tasks,
    företag: companies,
    orter: cities,
    senastStandup: lastStandup,
  };

  console.log(JSON.stringify(context, null, 2));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
