#!/usr/bin/env node
/**
 * Automatic blog article generator for StayOnSite.
 *
 * Uses Claude API (with web search) to:
 * 1. Pick a timely topic relevant to worker housing / property rental
 * 2. Generate a full React TSX article component
 * 3. Update blog-posts.ts and app/blogg/[slug]/page.tsx import map
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

const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 12000;
const MAX_RETRIES = 3;
const PRIMARY_SOURCE_HOSTS = [
  'riksdagen.se',
  'regeringen.se',
  'svenskforfattningssamling.se',
  'skatteverket.se',
  'boverket.se',
  'scb.se',
  'trafikverket.se',
  'av.se',
  'migrationsverket.se',
  'arbetsformedlingen.se',
  'domstol.se',
  'kriminalvarden.se',
  'energimyndigheten.se',
  'naturvardsverket.se',
  'tillvaxtverket.se',
  'skolverket.se',
  'byggforetagen.se',
  'europa.eu',
];

// Parse --topic flag
const topicArg = process.argv.find((a, i) => process.argv[i - 1] === '--topic');

// ---------- Existing data ----------
const blogPostsPath = resolve(root, 'src/data/blog-posts.ts');
const blogPagePath = resolve(root, 'app/(sv)/blogg/[slug]/page.tsx');
const blogDir = resolve(root, 'src/views/blogg');
const gbpQueuePath = resolve(root, 'content/gbp/posts.json');

const blogPostsSource = readFileSync(blogPostsPath, 'utf-8');
const blogPageSource = readFileSync(blogPagePath, 'utf-8');

// Extract existing slugs to avoid duplicates
const existingSlugs = [...blogPostsSource.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

// City slugs for internal linking — ALL slugs, no slicing
const citiesSource = readFileSync(resolve(root, 'src/data/cities.ts'), 'utf-8');
const citySlugs = [...citiesSource.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
const citySlugSet = new Set(citySlugs);

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

  if (topicArg) {
    console.log(`[article] Custom topic: "${topicArg}" — generating metadata...`);
  } else {
    console.log('[article] Picking topic with web search...');
  }

  const today = new Date().toISOString().split('T')[0];
  const topicInstruction = topicArg
    ? `\n\nANVÄNDAREN HAR VALT ÄMNE: "${topicArg}"\nGenerera metadata för detta specifika ämne. Sök på webben för att hitta aktuell info.\n`
    : '';

  const res = await callClaude([
    {
      role: 'user',
      content: `Du är content-strateg för StayOnSite, ett svenskt B2B-boendebolag som hyr ut personalboende till byggföretag.
${topicInstruction}
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
  "audience": "foretag|husagare|bada",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 8,
  "componentName": "PascalCaseComponentName",
  "outline": "Kort outline av artikelns struktur (3-5 rubriker)"
}`
    }
  ], [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }]);

  // Extract JSON from response — try all text blocks, handle various formats
  const textBlocks = res.content.filter(b => b.type === 'text');
  if (textBlocks.length === 0) throw new Error('No text in topic response');

  const allText = textBlocks.map(b => b.text).join('\n');

  // Try: ```json block, then raw JSON object
  const jsonBlockMatch = allText.match(/```(?:json)?\s*\n(\{[\s\S]*?\})\s*\n```/);
  const rawJsonMatch = allText.match(/(\{[\s\S]*"slug"[\s\S]*"componentName"[\s\S]*\})/);
  const jsonStr = jsonBlockMatch?.[1] || rawJsonMatch?.[1];

  if (!jsonStr) {
    throw new Error('No JSON in topic response. Full text:\n' + allText.slice(0, 1000));
  }

  return JSON.parse(jsonStr);
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
2. Länka centrala sakuppgifter direkt till minst 3 externa originalkällor med <a href="https://..." target="_blank" rel="noreferrer">Källägare – dokumenttitel</a>. Minst 2 ska vara primärkällor (myndighet, lagtext, kommun, projektägare eller ansvarig branschorganisation)
3. Inkludera minst 1 tabell med data
4. Använd <Link href="/stad/SLUG"> för att länka till stadssidor. VIKTIGT: Länka BARA till dessa exakta slugs, inga andra: ${citySlugs.join(', ')}
5. Länka till andra artiklar: ${existingSlugs.map(s => `/blogg/${s}`).join(', ')}
6. Avsluta med en CTA som nämner StayOnSite, telefonnummer 076-249 84 86, och länkar till /for-foretag och /for-husagare
7. Framhäv StayOnSites USP: 0% avgift för husägare, garanterad hyra, professionella hyresgäster, boendeplan inom 24 timmar (vi återkommer alltid inom en arbetsdag – ofta inom några timmar)
8. HTML-entiteter: använd &mdash; &ndash; &quot; etc. (inte unicode)
9. Avsluta med en <h2>Vanliga frågor</h2>-sektion (före CTA:n) med 3-4 <h3>-frågor och korta konkreta svar (2-4 meningar) — de blir FAQ-schema
10. COPY-REGLER (får inte brytas): Lova aldrig "allt ingår"/all-inclusive — skriv "vanligtvis ingår X; exakt omfattning avtalas per projekt". StayOnSites eget pris anges ENDAST som "från 5 900 kr per person och månad" (hitta inte på andra StayOnSite-priser). Grundat 2016. Ange inte betyg eller antal omdömen i artikeln eftersom de ändras över tid.

⚠️ BRAND SAFETY:
- SÖK och VERIFIERA att alla nämnda företag/projekt fortfarande är aktiva innan du skriver om dem
- Nämn ALDRIG företag i konkurs, rekonstruktion eller med pågående skandaler positivt
- Använd bara statistik som du hittar via web search och som är från senaste 12 månaderna
- Citera bara verkliga rapporter/uttalanden som du kan verifiera finns
- Skriv inte ett direktcitat om du inte har verifierat den exakta ordalydelsen i originalkällan; parafrasera annars och länka källan
- Hitta aldrig på en URL. Varje extern källänk ska vara en sida du faktiskt öppnat i webbsökningen
- Om du är osäker på ett faktum — utelämna det istället för att gissa
- Fokusera på BRANSCHÖVERGRIPANDE trender snarare än enskilda företag
- Skriv tidlöst: undvik "just nu", "nyligen" — använd specifika datum istället

EXAKT TEMPLATE (följ denna):
\`\`\`tsx
import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

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
- Externa källor ska vara klickbara <a>-länkar i brödtexten, inte bara källnamn i <cite>

Sök på webben för att hitta aktuella fakta, statistik och citat att inkludera.`
    }
  ], [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]);

  const textBlocks = res.content.filter(b => b.type === 'text');
  if (textBlocks.length === 0) throw new Error('No text in article response');

  const allText = textBlocks.map(b => b.text).join('\n');

  // Strategy 1: ```tsx code block
  const tsxBlock = allText.match(/```tsx\s*\n([\s\S]*?)```/);
  if (tsxBlock) return tsxBlock[1].trim();

  // Strategy 2: any code block
  const anyBlock = allText.match(/```(?:jsx|javascript|js)?\s*\n([\s\S]*?)```/);
  if (anyBlock && anyBlock[1].includes('BlogLayout')) return anyBlock[1].trim();

  // Strategy 3: raw component without code blocks
  const componentMatch = allText.match(/(import BlogLayout[\s\S]*?export default \w+;)/);
  if (componentMatch) return componentMatch[1].trim();

  // Strategy 4: find anything that looks like a React component
  const reactMatch = allText.match(/(import .+from .+BlogLayout[\s\S]*?export default \w+;)/);
  if (reactMatch) return reactMatch[1].trim();

  throw new Error('Could not extract TSX from response. Response starts with:\n' + allText.slice(0, 500));
}

// ---------- Step 2b: Extract SEO/GEO data (snabba svar + FAQ) ----------
async function extractSeoData(tsx) {
  console.log('[article] Extracting keyTakeaways + faq from article...');

  const res = await callClaude([
    {
      role: 'user',
      content: `Här är en svensk bloggartikel (React TSX) för stayonsite.se:

\`\`\`tsx
${tsx}
\`\`\`

Extrahera ur artikelns FAKTISKA innehåll:

- "keyTakeaways": 3-5 punkter på SVENSKA. Varje punkt ska vara ett konkret, fristående, citerbart faktum ur artikeln — specifika siffror, datum, lagar, priser där artikeln har dem. Ingen marknadsföring, inga vaga påståenden. Max ~160 tecken per punkt.
- "faq": artikelns "Vanliga frågor"-sektion som [{"q": "...", "a": "..."}]. Kondensera varje svar till 1-3 meningar med artikelns egna formuleringar. Max 6 st. Om sektionen saknas: null.

Svara med ENDAST en JSON-objekt, ingen annan text:
{"keyTakeaways": ["...", "..."], "faq": [{"q": "...", "a": "..."}] }`
    }
  ]);

  const textBlocks = res.content.filter(b => b.type === 'text');
  if (textBlocks.length === 0) throw new Error('No text in SEO extraction response');
  const allText = textBlocks.map(b => b.text).join('\n');

  const jsonBlockMatch = allText.match(/```(?:json)?\s*\n(\{[\s\S]*?\})\s*\n```/);
  const rawJsonMatch = allText.match(/(\{[\s\S]*"keyTakeaways"[\s\S]*\})/);
  const jsonStr = jsonBlockMatch?.[1] || rawJsonMatch?.[1];
  if (!jsonStr) throw new Error('No JSON in SEO extraction response');

  const seo = JSON.parse(jsonStr);
  if (!Array.isArray(seo.keyTakeaways) || seo.keyTakeaways.length === 0) {
    throw new Error('SEO extraction returned no keyTakeaways');
  }
  return seo;
}

// ---------- Step 2c: Validate city links ----------
function validateCityLinks(tsx) {
  // Find all <Link href="/stad/SLUG"> references
  const linkPattern = /<Link href="\/stad\/([^"]+)">/g;
  let match;
  let fixed = tsx;
  const removed = [];

  while ((match = linkPattern.exec(tsx)) !== null) {
    const slug = match[1];
    if (!citySlugSet.has(slug)) {
      // Replace <Link href="/stad/bad-slug">Text</Link> with just Text
      const linkRegex = new RegExp(
        `\\{' '\\}\\s*<Link href="/stad/${slug}">([^<]+)</Link>`,
        'g'
      );
      const linkRegex2 = new RegExp(
        `<Link href="/stad/${slug}">([^<]+)</Link>`,
        'g'
      );
      fixed = fixed.replace(linkRegex, (_, text) => text);
      fixed = fixed.replace(linkRegex2, (_, text) => text);
      removed.push(slug);
    }
  }

  if (removed.length > 0) {
    console.log(`[article] ⚠️  Removed ${removed.length} broken city link(s): ${removed.join(', ')}`);
  }
  return fixed;
}

// ---------- Step 2c: Validate JSX ----------
function validateJsx(tsx) {
  const errors = [];

  // Check matching tags — build a simple stack
  // Match opening tags like <Tag or <Tag ... and self-closing <Tag />
  const tagPattern = /<\/?([A-Za-z][A-Za-z0-9]*)[^>]*?\/?>/g;
  const selfClosingTags = new Set([
    'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'source', 'track', 'wbr',
  ]);
  const stack = [];
  let m;

  while ((m = tagPattern.exec(tsx)) !== null) {
    const full = m[0];
    const tagName = m[1];

    // Skip self-closing tags (both HTML void elements and /> syntax)
    if (selfClosingTags.has(tagName.toLowerCase()) || full.endsWith('/>')) continue;

    if (full.startsWith('</')) {
      // Closing tag
      if (stack.length === 0) {
        errors.push(`Unexpected closing </${tagName}> with no matching open tag`);
      } else {
        const last = stack.pop();
        if (last !== tagName) {
          errors.push(`Mismatched tags: <${last}> closed by </${tagName}>`);
          // Put it back if it might match something else
          stack.push(last);
        }
      }
    } else {
      // Opening tag
      stack.push(tagName);
    }
  }

  // Check for common JSX issues
  // Unescaped quotes in attributes
  if (tsx.includes('class=')) {
    errors.push('Uses "class=" instead of "className="');
  }

  return errors;
}

function sourcePublisher(url) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  const names = {
    'riksdagen.se': 'Sveriges riksdag',
    'regeringen.se': 'Regeringen',
    'svenskforfattningssamling.se': 'Svensk författningssamling',
    'skatteverket.se': 'Skatteverket',
    'boverket.se': 'Boverket',
    'scb.se': 'SCB',
    'trafikverket.se': 'Trafikverket',
    'av.se': 'Arbetsmiljöverket',
    'migrationsverket.se': 'Migrationsverket',
    'arbetsformedlingen.se': 'Arbetsförmedlingen',
    'domstol.se': 'Sveriges Domstolar',
    'kriminalvarden.se': 'Kriminalvården',
    'energimyndigheten.se': 'Energimyndigheten',
    'naturvardsverket.se': 'Naturvårdsverket',
    'tillvaxtverket.se': 'Tillväxtverket',
    'skolverket.se': 'Skolverket',
    'byggforetagen.se': 'Byggföretagen',
  };
  const matched = Object.keys(names).find((domain) => host === domain || host.endsWith(`.${domain}`));
  return matched ? names[matched] : host;
}

function extractSourceLinks(tsx) {
  const links = [];
  const pattern = /<a\s+[^>]*href=["'](https:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = pattern.exec(tsx)) !== null) {
    const url = match[1];
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'stayonsite.se' || host.endsWith('.stayonsite.se')) continue;

    const title = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .trim();

    if (!links.some((link) => link.url === url)) {
      links.push({
        title: title || url,
        publisher: sourcePublisher(url),
        url,
        checkedDate: new Date().toISOString().split('T')[0],
      });
    }
  }

  return links;
}

async function validateSourceLinks(tsx) {
  const sources = extractSourceLinks(tsx);
  if (sources.length < 3) {
    throw new Error(`Artikeln har ${sources.length} externa källänkar; minst 3 krävs`);
  }

  const primaryCount = sources.filter((source) => {
    const host = new URL(source.url).hostname.replace(/^www\./, '');
    return PRIMARY_SOURCE_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  }).length;

  if (primaryCount < 2) {
    throw new Error(`Artikeln har ${primaryCount} godkända primärkällor; minst 2 krävs`);
  }

  const checks = await Promise.all(sources.map(async (source) => {
    try {
      const res = await fetch(source.url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
        headers: { 'user-agent': 'StayOnSite editorial source checker/1.0' },
      });
      return { source, ok: res.status < 500, status: res.status };
    } catch (error) {
      return { source, ok: false, status: error.message };
    }
  }));

  const broken = checks.filter((check) => !check.ok);
  if (broken.length > 0) {
    throw new Error(`Källkontroll misslyckades: ${broken.map((check) => `${check.source.url} (${check.status})`).join(', ')}`);
  }

  console.log(`[article] ✅ ${sources.length} källänkar verifierade, varav ${primaryCount} primärkällor`);
  return sources;
}

async function fixJsxWithClaude(tsx, errors) {
  console.log(`[article] 🔧 Fixing ${errors.length} JSX error(s) with Claude...`);

  const res = await callClaude([
    {
      role: 'user',
      content: `Fix the following JSX/TSX errors in this React component. Return ONLY the fixed TSX code, nothing else.

ERRORS FOUND:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

RULES:
- All HTML tags must be properly nested and closed
- Use className, not class
- Self-closing tags must use />
- <Link> components must have matching </Link>
- <blockquote> must have matching </blockquote>
- <cite> must have matching </cite>
- Do NOT wrap the code in \`\`\`tsx code blocks

SOURCE CODE:
${tsx}`
    }
  ]);

  const textBlocks = res.content.filter(b => b.type === 'text');
  if (textBlocks.length === 0) throw new Error('No text in JSX fix response');

  const allText = textBlocks.map(b => b.text).join('\n');

  // Extract fixed code
  const tsxBlock = allText.match(/```tsx\s*\n([\s\S]*?)```/);
  if (tsxBlock) return tsxBlock[1].trim();

  const anyBlock = allText.match(/```(?:jsx|javascript|js)?\s*\n([\s\S]*?)```/);
  if (anyBlock && anyBlock[1].includes('BlogLayout')) return anyBlock[1].trim();

  // If no code block, assume the whole response is the fixed code
  if (allText.includes('BlogLayout') && allText.includes('export default')) {
    return allText.trim();
  }

  throw new Error('Could not extract fixed TSX from Claude response');
}

// ---------- Step 3: Update files ----------
function updateBlogPosts(topic, seo, sources) {
  console.log('[article] Updating blog-posts.ts...');
  const today = new Date().toISOString().split('T')[0];
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const AUDIENCES = ['foretag', 'husagare', 'bada'];
  const audience = AUDIENCES.includes(topic.audience) ? topic.audience : 'bada';

  let seoFields = `    audience: '${audience}',\n`;
  if (seo?.keyTakeaways?.length) {
    seoFields += `    keyTakeaways: [\n${seo.keyTakeaways.map(k => `      '${esc(k)}',`).join('\n')}\n    ],\n`;
  }
  if (seo?.faq?.length) {
    seoFields += `    faq: [\n${seo.faq.map(f => `      {\n        q: '${esc(f.q)}',\n        a: '${esc(f.a)}',\n      },`).join('\n')}\n    ],\n`;
  }
  if (sources?.length) {
    seoFields += `    sources: [\n${sources.map(source => `      {\n        title: '${esc(source.title)}',\n        publisher: '${esc(source.publisher)}',\n        url: '${esc(source.url)}',\n        checkedDate: '${source.checkedDate}',\n      },`).join('\n')}\n    ],\n`;
  }

  const newEntry = `  {
    slug: '${topic.slug}',
    title: {
      sv: '${esc(topic.titleSv)}',
      en: '${esc(topic.titleEn)}',
      pl: '${esc(topic.titlePl)}',
    },
    description: {
      sv: '${esc(topic.descSv)}',
      en: '${esc(topic.descEn)}',
      pl: '${esc(topic.descPl)}',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '${today}',
    category: '${topic.category}',
    tags: [${topic.tags.map(t => `'${esc(t)}'`).join(', ')}],
    readingTime: ${topic.readingTime},
${seoFields}  }`;

  // Insert before the closing ];
  // Existing last entry already ends with a trailing comma, so don't add one.
  const updated = blogPostsSource.replace(
    /\n\];/,
    `\n${newEntry},\n];`
  );
  writeFileSync(blogPostsPath, updated);
}

function updateBlogPage(topic) {
  console.log('[article] Updating app/blogg/[slug]/page.tsx import map...');

  let updated = readFileSync(blogPagePath, 'utf-8');

  // Add import after the last blog article import
  const lastImportMatch = updated.match(/import \w+ from '@\/views\/blogg\/\w+'/g);
  const lastImport = lastImportMatch ? lastImportMatch[lastImportMatch.length - 1] : null;

  if (lastImport) {
    updated = updated.replace(
      lastImport,
      `${lastImport}\nimport ${topic.componentName} from '@/views/blogg/${topic.componentName}'`
    );
  }

  // Add to componentMap (before the closing brace)
  updated = updated.replace(
    /(\n\}\n)/,
    `  '${topic.slug}': ${topic.componentName},\n}\n`
  );

  writeFileSync(blogPagePath, updated);
}

function updateGbpQueue(topic) {
  console.log('[article] Queueing Google Business Profile post...');
  const queue = JSON.parse(readFileSync(gbpQueuePath, 'utf-8'));
  if (!Array.isArray(queue.posts)) throw new Error('Invalid GBP post queue');

  const id = `blog-${topic.slug}`;
  if (queue.posts.some((post) => post.id === id)) {
    console.log(`[article] GBP post ${id} already queued — skipping`);
    return;
  }

  const imagesByAudience = {
    foretag: [
      '/images/gbp/gavle-project-housing-living-room.jpg',
      '/images/gbp/gavle-company-housing-kitchen.jpg',
      '/images/gbp/gavle-project-housing-hallway.jpg',
    ],
    husagare: [
      '/images/gbp/gavle-company-housing-exterior.jpg',
      '/images/gbp/gavle-company-housing-kitchen.jpg',
    ],
    bada: [
      '/images/gbp/gavle-corporate-housing-bedroom.jpg',
      '/images/gbp/gavle-project-housing-living-room.jpg',
    ],
  };
  const audience = imagesByAudience[topic.audience] ? topic.audience : 'bada';
  const imagePool = imagesByAudience[audience];
  const imageIndex = [...topic.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % imagePool.length;
  const today = new Date().toISOString().slice(0, 10);

  queue.posts.push({
    id,
    lane: 'article',
    publishAfter: today,
    languageCode: 'sv-SE',
    summary: `Ny guide: ${topic.titleSv}\n\n${topic.descSv}\n\nVi har samlat det viktigaste för företag och bostadsägare som planerar personalboende, projektboende eller företagsuthyrning. Bilden visar ett exempel på möblerat företagsboende i Gävle.`,
    targetPath: `/blogg/${topic.slug}`,
    image: imagePool[imageIndex],
    imageDescription: 'Exempel på möblerat företagsboende i Gävle.',
    callToAction: 'LEARN_MORE',
  });
  queue.updatedAt = today;
  writeFileSync(gbpQueuePath, `${JSON.stringify(queue, null, 2)}\n`);
}

// ---------- Retry helper ----------
async function withRetry(fn, label, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.error(`[article] ${label} attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      console.log(`[article] Retrying in 3s...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// ---------- Notion error notification ----------
async function notifyNotionError(errorMsg) {
  try {
    const envContent = readFileSync(resolve(root, '.env'), 'utf-8');
    let notionToken, standupPageId;
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key === 'NOTION_TOKEN') notionToken = val;
      if (key === 'NOTION_STANDUPS_PAGE_ID') standupPageId = val;
    }
    if (!notionToken || !standupPageId) return;

    const today = new Date().toISOString().split('T')[0];
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { page_id: standupPageId },
        icon: { type: 'emoji', emoji: '🚨' },
        properties: { title: [{ text: { content: `OBS FEL — Artikelgenerering ${today}` } }] },
        children: [
          {
            type: 'callout',
            callout: {
              rich_text: [{ type: 'text', text: { content: `OBS FEL — kontakta IT-support ❤️\n\nFelmeddelande: ${errorMsg}` } }],
              icon: { type: 'emoji', emoji: '🚨' },
              color: 'red_background',
            },
          },
        ],
      }),
    });
    console.log('[article] Error notification sent to Notion');
  } catch (e) {
    console.error('[article] Could not notify Notion:', e.message);
  }
}

// ---------- Main ----------
async function main() {
  console.log('[article] Starting article generation...');

  // Step 1: Pick topic (with retry)
  const topic = await withRetry(() => pickTopic(), 'Topic picking');

  // Validate topic
  if (typeof topic === 'string') {
    throw new Error('Topic should be a JSON object, got string. Check --topic usage.');
  }

  console.log(`[article] Topic: ${topic.titleSv}`);
  console.log(`[article] Slug: ${topic.slug}`);
  console.log(`[article] Component: ${topic.componentName}`);

  // Check for duplicate slug
  if (existingSlugs.includes(topic.slug)) {
    throw new Error(`Slug "${topic.slug}" already exists!`);
  }

  // Step 2: Generate article TSX (with retry)
  const rawTsx = await withRetry(() => generateArticle(topic), 'Article generation');

  // Step 2a: Normalize imports (fix case-sensitivity bugs that break Linux CI)
  let tsx = rawTsx
    .replace(/from\s+['"]next\/Link['"]/g, "from 'next/link'")
    .replace(/from\s+['"]next\/Image['"]/g, "from 'next/image'");

  // Step 2b: Validate and fix broken city links
  tsx = validateCityLinks(tsx);

  // Step 2c: Validate JSX and auto-fix if needed
  const jsxErrors = validateJsx(tsx);
  if (jsxErrors.length > 0) {
    console.log(`[article] ⚠️  Found ${jsxErrors.length} JSX issue(s):`);
    jsxErrors.forEach(e => console.log(`  - ${e}`));
    tsx = await withRetry(() => fixJsxWithClaude(tsx, jsxErrors), 'JSX fix');
    tsx = validateCityLinks(tsx); // re-validate city links after fix

    const remainingErrors = validateJsx(tsx);
    if (remainingErrors.length > 0) {
      console.error('[article] ❌ JSX errors remain after fix attempt:');
      remainingErrors.forEach(e => console.error(`  - ${e}`));
      throw new Error(`JSX validation failed: ${remainingErrors.join('; ')}`);
    }
    console.log('[article] ✅ JSX errors fixed successfully');
  } else {
    console.log('[article] ✅ JSX validation passed');
  }

  // Sakuppgifter måste kunna följas till fungerande, synliga originalkällor.
  // Källor är ett hårt krav; en artikel utan verifierbara länkar publiceras inte.
  const sources = await validateSourceLinks(tsx);

  // Step 3: Write article file
  const articlePath = resolve(blogDir, `${topic.componentName}.tsx`);
  if (existsSync(articlePath)) {
    throw new Error(`File already exists: ${articlePath}`);
  }
  writeFileSync(articlePath, tsx + '\n');
  console.log(`[article] Written: ${articlePath}`);

  // Step 4: Extract snabba svar + FAQ ur artikeln (mjuk fallback — artikeln
  // publiceras även utan; BlogLayout renderar bara det som finns)
  let seo = null;
  try {
    seo = await withRetry(() => extractSeoData(tsx), 'SEO extraction');
    console.log(`[article] ✅ ${seo.keyTakeaways.length} snabba svar${seo.faq?.length ? `, ${seo.faq.length} FAQ` : ''}`);
  } catch (err) {
    console.warn(`[article] ⚠️  SEO extraction failed (${err.message}) — publishing without keyTakeaways/faq`);
  }

  // Step 4b: Update blog-posts.ts
  updateBlogPosts(topic, seo, sources);

  // Step 5: Update blog page import map (sitemap auto-generates from blog-posts.ts)
  updateBlogPage(topic);

  // Step 6: Queue a matching GBP post. Friday's GBP workflow publishes the
  // oldest due article post after the article has reached production.
  updateGbpQueue(topic);

  console.log('[article] Done! New article ready.');
  console.log(`[article] File: src/views/blogg/${topic.componentName}.tsx`);
  console.log(`[article] URL: /blogg/${topic.slug}`);
  console.log('[article] Run "pnpm build" to generate static HTML.');

  return topic;
}

main().catch(async (err) => {
  console.error('[article] FATAL:', err.message);
  await notifyNotionError(err.message);
  process.exit(1);
});
