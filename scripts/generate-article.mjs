#!/usr/bin/env node
/**
 * Automatic blog article generator for StayOnSite.
 *
 * Uses Claude API (with web search) to:
 * 1. Pick a timely topic relevant to worker housing / property rental
 * 2. Generate a full React TSX article component
 * 3. Update blog-posts.ts, routes.tsx, and generate-sitemap.mjs
 *
 * Usage:
 *   node scripts/generate-article.mjs                    # auto-pick topic
 *   node scripts/generate-article.mjs --topic "Ämnet"    # specify topic
 *
 * Env vars: ANTHROPIC_API_KEY (required)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ---------- Config ----------
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 12000;

// Parse --topic flag
const topicArg = process.argv.find((a, i) => process.argv[i - 1] === '--topic');

// ---------- Existing data ----------
const blogPostsPath = resolve(root, 'src/data/blog-posts.ts');
const routesPath = resolve(root, 'src/routes.tsx');
const sitemapPath = resolve(root, 'scripts/generate-sitemap.mjs');
const blogDir = resolve(root, 'src/pages/blogg');

const blogPostsSource = readFileSync(blogPostsPath, 'utf-8');
const routesSource = readFileSync(routesPath, 'utf-8');
const sitemapSource = readFileSync(sitemapPath, 'utf-8');

// Extract existing slugs to avoid duplicates
const existingSlugs = [...blogPostsSource.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

// City slugs for internal linking
const citiesSource = readFileSync(resolve(root, 'src/data/cities.ts'), 'utf-8');
const citySlugs = [...citiesSource.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]).slice(0, 30);

// ---------- Claude API ----------
async function callClaude(messages, tools = null) {
  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages,
  };
  if (tools) body.tools = tools;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      ...(tools ? { 'anthropic-beta': 'web-search-2025-03-05' } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err}`);
  }
  return res.json();
}

// ---------- Step 1: Pick topic ----------
async function pickTopic() {
  if (topicArg) return topicArg;

  console.log('[article] Picking topic with web search...');

  const today = new Date().toISOString().split('T')[0];

  const res = await callClaude([
    {
      role: 'user',
      content: `Du är content-strateg för StayOnSite, ett svenskt B2B-boendebolag som hyr ut personalboende till byggföretag.

Datum: ${today}

EXISTERANDE ARTIKLAR (undvik överlapp):
${existingSlugs.map(s => `- ${s}`).join('\n')}

Sök på webben efter aktuella nyheter inom:
- Svenska byggprojekt, infrastruktur, industrisatsningar
- Bostadsmarknad, uthyrningslagar, skatteförändringar
- Arbetskraftsinvandring, montörer, tillfälligt boende
- Energi, grön omställning, datacenter

⚠️ BRAND SAFETY — KRITISKT:
Innan du föreslår ett ämne, SÖK och VERIFIERA att:
- Alla företag/projekt du nämner fortfarande är AKTIVA (inte i konkurs, rekonstruktion, eller avbrutna)
- Inga kontroverser pågår kring projekten (miljöskandaler, bedrägerier, strejker)
- Statistik och siffror är från de senaste 6 månaderna
- Myndighetsuttalanden är aktuella och inte tillbakadragna

FÖRBJUDNA ÄMNEN (kan skada StayOnSites trovärdighet):
- Företag i konkurs eller rekonstruktion (t.ex. Northvolt gick i konkurs 2024)
- Projekt som avbrutits eller skjutits upp kraftigt
- Spekulativa investeringar som inte är beslutade
- Politiskt kontroversiella ämnen (invandringspolitik, kärnkraftsdebatt)
- Prisuppgifter som kan bli felaktiga snabbt

BRA ÄMNEN (trygga och hjälpsamma):
- Praktiska guider (hur man hyr ut, skattetips, checklista för montörboende)
- Bekräftade infrastrukturprojekt (Trafikverket, kommunala beslut)
- Lagändringar som redan är beslutade
- Branschstatistik från SCB, Boverket, Byggföretagen
- Regionala analyser (var behövs boende just nu?)

Föreslå EN artikel som:
1. Är aktuell och sökbar (folk googlar efter det)
2. Relaterar till personalboende eller fastighetsuthyrning
3. Inte överlappar med existerande artiklar
4. Riktar sig till antingen företag ELLER husägare
5. INTE kan bli pinsam om ett nämnt företag/projekt får problem

Svara i EXAKT detta JSON-format (inget annat):
{
  "slug": "url-vänlig-slug-2026",
  "titleSv": "Rubrik på svenska",
  "titleEn": "English title",
  "titlePl": "Polski tytuł",
  "descSv": "Kort beskrivning på svenska (max 160 tecken)",
  "descEn": "Short English description (max 160 chars)",
  "descPl": "Krótki opis po polsku (max 160 znaków)",
  "category": "Guide|Marknad|Lagstiftning|Analys|Tips",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 8,
  "componentName": "PascalCaseComponentName",
  "outline": "Kort outline av artikelns struktur (3-5 rubriker)"
}`
    }
  ], [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }]);

  // Extract text from response
  const textBlock = res.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No text in topic response');

  // Parse JSON from response (might be wrapped in ```json)
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in topic response: ' + textBlock.text.slice(0, 500));

  return JSON.parse(jsonMatch[0]);
}

// ---------- Step 2: Generate article ----------
async function generateArticle(topic) {
  console.log(`[article] Generating: "${topic.titleSv}"`);

  const today = new Date().toISOString().split('T')[0];

  const res = await callClaude([
    {
      role: 'user',
      content: `Du är en erfaren SEO-copywriter för StayOnSite (stayonsite.se), ett svenskt B2B-boendebolag.

Skriv en komplett React TSX-komponent för en bloggartikel.

ÄMNE: ${topic.titleSv}
SLUG: ${topic.slug}
OUTLINE: ${topic.outline}
KATEGORI: ${topic.category}
DATUM: ${today}

KRAV:
1. Artikeln ska vara 1000-1500 ord, på SVENSKA
2. Inkludera minst 2 <blockquote> med citat (från myndigheter, branschorganisationer, rapporter)
3. Inkludera minst 1 tabell med data
4. Använd <Link to="/stad/SLUG"> för att länka till stadssidor (tillgängliga: ${citySlugs.slice(0, 15).join(', ')})
5. Länka till andra artiklar: ${existingSlugs.map(s => `/blogg/${s}`).join(', ')}
6. Avsluta med en CTA som nämner StayOnSite, telefonnummer 076-249 84 86, och länkar till /for-foretag och /for-husagare
7. Framhäv StayOnSites USP: 0% avgift, garanterad hyra, professionella hyresgäster, svar inom 24h
8. HTML-entiteter: använd &mdash; &ndash; &quot; etc. (inte unicode)

⚠️ BRAND SAFETY:
- SÖK och VERIFIERA att alla nämnda företag/projekt fortfarande är aktiva innan du skriver om dem
- Nämn ALDRIG företag i konkurs, rekonstruktion eller med pågående skandaler positivt
- Använd bara statistik som du hittar via web search och som är från senaste 12 månaderna
- Citera bara verkliga rapporter/uttalanden som du kan verifiera finns
- Om du är osäker på ett faktum — utelämna det istället för att gissa
- Fokusera på BRANSCHÖVERGRIPANDE trender snarare än enskilda företag
- Skriv tidlöst: undvik "just nu", "nyligen" — använd specifika datum istället

EXAKT TEMPLATE (följ denna):
\`\`\`tsx
import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import { Link } from 'react-router-dom';

const ${topic.componentName} = () => {
  const post = getBlogPost('${topic.slug}')!;
  return (
    <BlogLayout post={post}>
      {/* ARTIKELINNEHÅLL HÄR - bara JSX-element: <p>, <h2>, <h3>, <ul>, <li>, <blockquote>, <table>, <Link>, <strong>, <a> */}
    </BlogLayout>
  );
};

export default ${topic.componentName};
\`\`\`

VIKTIGT:
- Returnera BARA TSX-koden, inget annat
- Alla strängar i JSX (inte i JS)
- Använd {' '} för mellanslag runt <Link>-element
- Använd className, inte class
- Inga Framer Motion-importer (SSG-problem med opacity)
- Tabeller: använd <div className="overflow-x-auto my-8"><table className="w-full">...</table></div>

Sök på webben för att hitta aktuella fakta, statistik och citat att inkludera.`
    }
  ], [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]);

  const textBlock = res.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No text in article response');

  // Extract TSX from response
  const tsxMatch = textBlock.text.match(/```tsx\n([\s\S]*?)```/) || textBlock.text.match(/```\n([\s\S]*?)```/);
  if (tsxMatch) return tsxMatch[1].trim();

  // If no code block, try to find the component directly
  const componentMatch = textBlock.text.match(/(import BlogLayout[\s\S]*export default \w+;)/);
  if (componentMatch) return componentMatch[1].trim();

  throw new Error('Could not extract TSX from response');
}

// ---------- Step 3: Update files ----------
function updateBlogPosts(topic) {
  console.log('[article] Updating blog-posts.ts...');
  const today = new Date().toISOString().split('T')[0];

  const newEntry = `  {
    slug: '${topic.slug}',
    title: {
      sv: '${topic.titleSv.replace(/'/g, "\\'")}',
      en: '${topic.titleEn.replace(/'/g, "\\'")}',
      pl: '${topic.titlePl.replace(/'/g, "\\'")}',
    },
    description: {
      sv: '${topic.descSv.replace(/'/g, "\\'")}',
      en: '${topic.descEn.replace(/'/g, "\\'")}',
      pl: '${topic.descPl.replace(/'/g, "\\'")}',
    },
    author: 'Kajsa Lindwall',
    publishedDate: '${today}',
    category: '${topic.category}',
    tags: [${topic.tags.map(t => `'${t}'`).join(', ')}],
    readingTime: ${topic.readingTime},
  }`;

  // Insert before the closing ];
  const updated = blogPostsSource.replace(
    /\n\];/,
    `,\n${newEntry}\n];`
  );
  writeFileSync(blogPostsPath, updated);
}

function updateRoutes(topic) {
  console.log('[article] Updating routes.tsx...');

  // Add import
  const lastBlogImport = routesSource.match(/import \w+ from '\.\/pages\/blogg\/\w+'/g);
  const lastImport = lastBlogImport ? lastBlogImport[lastBlogImport.length - 1] : null;

  let updated = routesSource;
  if (lastImport) {
    updated = updated.replace(
      lastImport,
      `${lastImport}\nimport ${topic.componentName} from './pages/blogg/${topic.componentName}'`
    );
  }

  // Add route (before lp/husagare)
  updated = updated.replace(
    "{ path: 'lp/husagare'",
    `{ path: 'blogg/${topic.slug}', element: <${topic.componentName} /> },\n      { path: 'lp/husagare'`
  );

  writeFileSync(routesPath, updated);
}

function updateSitemap(topic) {
  console.log('[article] Updating generate-sitemap.mjs...');

  // Add slug to the blogSlugs array
  const updated = sitemapSource.replace(
    /const blogSlugs = \[([^\]]+)\];/,
    (match, inner) => {
      const trimmed = inner.trim();
      return `const blogSlugs = [${trimmed}, '${topic.slug}'];`;
    }
  );

  writeFileSync(sitemapPath, updated);
}

// ---------- Main ----------
async function main() {
  console.log('[article] Starting article generation...');

  // Step 1: Pick or parse topic
  let topic;
  if (topicArg) {
    // If --topic is a string, we need to generate full topic metadata
    console.log(`[article] Custom topic: "${topicArg}"`);
    topic = await pickTopic(); // Will use topicArg
  } else {
    topic = await pickTopic();
  }

  // Validate topic is an object (not a string)
  if (typeof topic === 'string') {
    throw new Error('Topic should be a JSON object, got string');
  }

  console.log(`[article] Topic: ${topic.titleSv}`);
  console.log(`[article] Slug: ${topic.slug}`);
  console.log(`[article] Component: ${topic.componentName}`);

  // Check for duplicate slug
  if (existingSlugs.includes(topic.slug)) {
    throw new Error(`Slug "${topic.slug}" already exists!`);
  }

  // Step 2: Generate article TSX
  const tsx = await generateArticle(topic);

  // Step 3: Write article file
  const articlePath = resolve(blogDir, `${topic.componentName}.tsx`);
  if (existsSync(articlePath)) {
    throw new Error(`File already exists: ${articlePath}`);
  }
  writeFileSync(articlePath, tsx + '\n');
  console.log(`[article] Written: ${articlePath}`);

  // Step 4: Update blog-posts.ts
  updateBlogPosts(topic);

  // Step 5: Update routes.tsx
  updateRoutes(topic);

  // Step 6: Update generate-sitemap.mjs
  updateSitemap(topic);

  console.log('[article] Done! New article ready.');
  console.log(`[article] File: src/pages/blogg/${topic.componentName}.tsx`);
  console.log(`[article] URL: /blogg/${topic.slug}`);
  console.log('[article] Run "pnpm build" to generate static HTML.');

  return topic;
}

main().catch(err => {
  console.error('[article] Error:', err.message);
  process.exit(1);
});
