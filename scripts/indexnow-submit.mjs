#!/usr/bin/env node
/**
 * IndexNow submitter for stayonsite.se
 *
 * Pingar IndexNow (Bing, Yandex m.fl. – Bing driver bl.a. ChatGPT-sök) så att
 * nya/ändrade sidor indexeras snabbt. Bra för både SEO och GEO.
 *
 * Nyckeln verifieras av IndexNow genom att hämta https://www.stayonsite.se/<KEY>.txt,
 * så nyckelfilen i public/ MÅSTE vara deployad innan en submit lyckas.
 *
 * Användning:
 *   node scripts/indexnow-submit.mjs                # submitta alla URL:er från sitemap.xml
 *   node scripts/indexnow-submit.mjs --all          # samma som ovan
 *   node scripts/indexnow-submit.mjs <url> [url...]  # submitta specifika URL:er
 *
 * Node 24 (global fetch). Inga beroenden.
 */

import { readdirSync } from 'node:fs';

const HOST = 'www.stayonsite.se';
const ORIGIN = `https://${HOST}`;
const SITEMAP_URL = `${ORIGIN}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Hitta nyckelfilen i public/ (filnamnet ÄR nyckeln). */
function resolveKey() {
  const pubDir = new URL('../public/', import.meta.url);
  const file = readdirSync(pubDir).find((f) => /^[a-f0-9]{8,128}\.txt$/.test(f));
  if (!file) {
    throw new Error('Ingen IndexNow-nyckelfil hittades i public/ (förväntar <hex>.txt).');
  }
  return file.replace(/\.txt$/, '');
}

/** Hämta alla <loc>-URL:er från den live-deployade sitemapen. */
async function urlsFromSitemap() {
  const res = await fetch(SITEMAP_URL, { headers: { 'User-Agent': 'StayOnSite-IndexNow/1.0' } });
  if (!res.ok) {
    throw new Error(`Kunde inte hämta sitemap (${res.status}) – är den deployad på ${SITEMAP_URL}?`);
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  // Bara URL:er på rätt host (IndexNow kräver samma host som nyckeln).
  return [...new Set(locs.filter((u) => u.startsWith(ORIGIN)))];
}

async function main() {
  const key = resolveKey();
  const keyLocation = `${ORIGIN}/${key}.txt`;

  const args = process.argv.slice(2).filter((a) => a !== '--all');
  const explicit = args.filter((a) => /^https?:\/\//.test(a));

  let urlList;
  if (explicit.length > 0) {
    urlList = [...new Set(explicit)];
    console.log(`[indexnow] Submittar ${urlList.length} angiven(a) URL:er.`);
  } else {
    urlList = await urlsFromSitemap();
    console.log(`[indexnow] Hämtade ${urlList.length} URL:er från sitemap.`);
  }

  if (urlList.length === 0) {
    console.log('[indexnow] Inga URL:er att submitta – avslutar.');
    return;
  }

  // IndexNow tillåter upp till 10 000 URL:er per request.
  const body = { host: HOST, key, keyLocation, urlList };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => '');
  if (res.status === 200 || res.status === 202) {
    console.log(`[indexnow] ✅ ${res.status} – ${urlList.length} URL:er accepterade.`);
    return;
  }

  const hints = {
    400: 'Ogiltig request (felaktig JSON eller saknad parameter).',
    403: 'Nyckeln kunde inte verifieras – ligger nyckelfilen live på keyLocation?',
    422: 'URL:er matchar inte host/nyckel, eller ogiltigt format.',
    429: 'För många requests – vänta och försök igen.',
  };
  console.error(`[indexnow] ❌ ${res.status} – ${hints[res.status] || 'Okänt fel.'} ${text}`.trim());
  process.exit(1);
}

main().catch((err) => {
  console.error('[indexnow] FATAL:', err.message);
  process.exit(1);
});
