/**
 * Generates public/sitemap.xml from city slugs in src/data/cities.ts.
 * Run: node scripts/generate-sitemap.mjs
 * Called automatically before each build via package.json "build" script.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Extract city slugs from cities.ts source
const citiesSource = readFileSync(resolve(root, 'src/data/cities.ts'), 'utf-8');
const slugs = [...citiesSource.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

const BASE = 'https://www.stayonsite.se';
const today = new Date().toISOString().split('T')[0];

function url(loc, priority, changefreq = 'monthly', hreflangs = null) {
  let xml = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n`;
  if (hreflangs) {
    for (const [lang, href] of Object.entries(hreflangs)) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />\n`;
    }
  }
  xml += `  </url>`;
  return xml;
}

const entries = [];

// Static pages
entries.push(url(`${BASE}/`, '1.0', 'weekly'));
entries.push(url(`${BASE}/for-husagare`, '0.9', 'weekly'));
entries.push(url(`${BASE}/for-foretag`, '0.9', 'weekly'));
entries.push(url(`${BASE}/om-oss`, '0.8', 'monthly'));
entries.push(url(`${BASE}/kontakt`, '0.8', 'monthly'));
entries.push(url(`${BASE}/en/corporate-housing-sweden`, '0.8', 'monthly'));
entries.push(url(`${BASE}/pl/zakwaterowanie-firmowe`, '0.8', 'monthly'));

// Blog section – read slugs dynamically from routes.tsx
entries.push(url(`${BASE}/blogg`, '0.8', 'weekly'));
const routesSource = readFileSync(resolve(root, 'src/routes.tsx'), 'utf-8');
const blogSlugs = [...routesSource.matchAll(/path:\s*'blogg\/([^']+)'/g)].map((m) => m[1]);
for (const slug of blogSlugs) {
  entries.push(url(`${BASE}/blogg/${slug}`, '0.7', 'monthly'));
}

// City pages – 3 languages per city with hreflang
for (const slug of slugs) {
  const sv = `${BASE}/stad/${slug}`;
  const en = `${BASE}/en/corporate-housing/${slug}`;
  const pl = `${BASE}/pl/zakwaterowanie/${slug}`;
  const hreflangs = { sv, en, pl };

  entries.push(url(sv, '0.9', 'monthly', hreflangs));
  entries.push(url(en, '0.8', 'monthly', hreflangs));
  entries.push(url(pl, '0.8', 'monthly', hreflangs));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap);
console.log(`[sitemap] Generated ${entries.length} URLs for ${slugs.length} cities (${today})`);
