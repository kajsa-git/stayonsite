#!/usr/bin/env node
/**
 * Bing Webmaster Tools-statistik för stayonsite.se
 *
 * Läser sökord och sidor via BWT:s JSON-API och skriver ut aggregerade tabeller
 * (API:t returnerar rader per datum – detta script summerar per sökord/sida).
 *
 * Användning:
 *   node --env-file=.env.local scripts/bing-stats.mjs            # topp 30 sökord + sidor
 *   node --env-file=.env.local scripts/bing-stats.mjs --limit 100
 *
 * Kräver BING_WEBMASTER_API_KEY i .env.local. Kontot har https://stayonsite.se/
 * verifierad – gå via detta API, inte BWT-webben (Chrome-kontot saknar åtkomst).
 */

const KEY = process.env.BING_WEBMASTER_API_KEY;
if (!KEY) {
  console.error('BING_WEBMASTER_API_KEY saknas – kör med: node --env-file=.env.local scripts/bing-stats.mjs');
  process.exit(1);
}

const SITE = 'https://stayonsite.se/';
const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) || 30 : 30;

async function get(method) {
  const url = `${API}/${method}?apikey=${KEY}&siteUrl=${encodeURIComponent(SITE)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
  return (await res.json()).d;
}

function aggregate(rows, keyField) {
  const map = new Map();
  for (const r of rows) {
    const k = String(r[keyField] ?? '').trim();
    const cur = map.get(k) ?? { clicks: 0, impr: 0, posW: 0 };
    cur.clicks += r.Clicks ?? 0;
    cur.impr += r.Impressions ?? 0;
    cur.posW += (r.AvgImpressionPosition ?? 0) * (r.Impressions || 1);
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([k, v]) => ({ key: k, clicks: v.clicks, impr: v.impr, pos: v.posW / Math.max(v.impr, 1) }))
    .sort((a, b) => b.impr - a.impr);
}

function printTable(title, rows, width) {
  console.log(`\n=== ${title} ===`);
  console.log(`${'—'.padEnd(width)} klick  visn   pos`);
  for (const r of rows.slice(0, LIMIT)) {
    console.log(`${r.key.slice(0, width).padEnd(width)} ${String(r.clicks).padStart(5)} ${String(r.impr).padStart(5)}  ${r.pos.toFixed(1).padStart(4)}`);
  }
}

const [traffic, queries, pages] = await Promise.all([
  get('GetRankAndTrafficStats'),
  get('GetQueryStats'),
  get('GetPageStats'),
]);

const totClicks = traffic.reduce((s, r) => s + (r.Clicks ?? 0), 0);
const totImpr = traffic.reduce((s, r) => s + (r.Impressions ?? 0), 0);
console.log(`Bing, ${traffic.length} dagar: ${totClicks} klick / ${totImpr} visningar`);

printTable(`Sökord (topp ${LIMIT} av ${new Set(queries.map((q) => q.Query)).size})`, aggregate(queries, 'Query'), 50);
printTable(`Sidor (topp ${LIMIT})`, aggregate(pages, 'Query'), 80);
