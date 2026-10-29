#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SEARCH_URL =
  "https://www.av.se/arbetsmiljoarbete-och-inspektioner/e-tjanster-och-blanketter/sok-utstationering/";

const DEFAULT_CITIES = [
  ["Boden", "2582"],
  ["Luleå", "2580"],
  ["Gävle", "2180"],
  ["Sandviken", "2181"],
  ["Oskarshamn", "0882"],
  ["Skellefteå", "2482"],
  ["Örnsköldsvik", "2284"],
  ["Ludvika", "2085"],
  ["Kristinehamn", "1781"],
  ["Västerås", "1980"],
  ["Sundsvall", "2281"],
  ["Sollefteå", "2283"],
  ["Kiruna", "2584"],
  ["Piteå", "2581"],
];

const EXPERTISE_CODES = [
  "24", // Stål- och metallframställning
  "25", // Tillverkning av metallvaror
  "27", // Tillverkning av elapparatur
  "28", // Tillverkning av maskiner
  "33", // Reparation, underhåll och installation av maskiner
  "35", // El-, gas- och värmeförsörjning
  "41", // Byggande av hus och byggnader
  "42", // Anläggningsarbeten
  "43", // Specialiserad bygg- och anläggningsverksamhet
  "71", // Teknisk konsultverksamhet, provning och analys
  "78", // Bemanning och personalrelaterad verksamhet
];

const DEFAULT_JSON_PATH = "tmp/project-radar/latest.json";
const DEFAULT_MARKDOWN_PATH = "docs/projektradar-latest.md";
const USER_AGENT = "StayOnSite project radar/1.0 (+https://www.stayonsite.se)";

function parseArgs(argv) {
  const args = {
    cities: DEFAULT_CITIES,
    minWorkers: 5,
    jsonPath: DEFAULT_JSON_PATH,
    markdownPath: DEFAULT_MARKDOWN_PATH,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--min-workers") args.minWorkers = Number(argv[++i]);
    else if (arg === "--json") args.jsonPath = argv[++i];
    else if (arg === "--markdown") args.markdownPath = argv[++i];
    else if (arg === "--cities") {
      const requested = new Set(argv[++i].split(",").map((item) => item.trim().toLowerCase()));
      args.cities = DEFAULT_CITIES.filter(([name]) => requested.has(name.toLowerCase()));
    } else if (arg === "--help") {
      console.log(`
Usage: node scripts/project-radar.mjs [options]

Options:
  --cities "Boden,Luleå"  Limit the monitored municipalities
  --min-workers 5         Minimum aggregated worker count (default: 5)
  --json PATH             JSON state/output path
  --markdown PATH         Markdown report path
`);
      process.exit(0);
    } else {
      throw new Error(`Okänt argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.minWorkers) || args.minWorkers < 1) {
    throw new Error("--min-workers måste vara ett positivt heltal");
  }
  if (args.cities.length === 0) throw new Error("Inga matchande städer valdes");
  return args;
}

function decodeHtml(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    Aring: "Å",
    aring: "å",
    Auml: "Ä",
    auml: "ä",
    Ouml: "Ö",
    ouml: "ö",
    Eacute: "É",
    eacute: "é",
  };

  return value
    .replace(/&#(x?[0-9a-f]+);/gi, (_, raw) =>
      String.fromCodePoint(raw[0].toLowerCase() === "x" ? Number.parseInt(raw.slice(1), 16) : Number(raw)),
    )
    .replace(/&([a-z]+);/gi, (match, name) => named[name] ?? match);
}

function cleanCell(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseRows(html, city) {
  const rows = [];
  const rowPattern =
    /<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td>[\s\S]*?href="([^"]*?\?id=([^&"]+)[^"]*)"/gi;

  for (const match of html.matchAll(rowPattern)) {
    const workers = Number.parseInt(cleanCell(match[3]), 10);
    if (!Number.isFinite(workers)) continue;
    const relativeUrl = decodeHtml(match[4]);
    rows.push({
      id: match[5],
      company: cleanCell(match[1]),
      address: cleanCell(match[2]),
      city,
      workers,
      sourceUrl: new URL(relativeUrl, SEARCH_URL).toString(),
    });
  }
  return rows;
}

function findMaxPage(html) {
  let maxPage = 1;
  for (const match of html.matchAll(/[?&]page=(\d+)/g)) {
    maxPage = Math.max(maxPage, Number(match[1]));
  }
  return maxPage;
}

async function fetchHtml(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": USER_AGENT,
      ...options.headers,
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

async function fetchCity([city, municipalityCode]) {
  function pageUrl(page, sortOrder) {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("page", String(page));
    url.searchParams.set("sortOrder", sortOrder);
    url.searchParams.set("E", "System.String[]");
    url.searchParams.set("C", "System.String[]");
    url.searchParams.set("SelectedCounties", municipalityCode);
    url.searchParams.set("Expertises", EXPERTISE_CODES.join(" "));
    url.searchParams.set("SelectedHitsPerPage", "50");
    return url;
  }

  const rows = [];
  // The registry does not expose a stable secondary sort key. Combining two
  // sort orders prevents rows on a page boundary from randomly disappearing.
  for (const sortOrder of ["CompanyName", "PlaceArea"]) {
    const firstHtml = await fetchHtml(pageUrl(1, sortOrder));
    rows.push(...parseRows(firstHtml, city));
    const maxPage = findMaxPage(firstHtml);
    for (let page = 2; page <= maxPage; page += 1) {
      rows.push(...parseRows(await fetchHtml(pageUrl(page, sortOrder)), city));
    }
  }
  return rows;
}

function companyKey(company, city) {
  return `${company.toLocaleLowerCase("sv-SE").replace(/\s+/g, " ").trim()}|${city}`;
}

function priorityScore(workers, postingCount) {
  const workerScore = workers >= 50 ? 50 : workers >= 25 ? 43 : workers >= 10 ? 35 : workers >= 5 ? 25 : 10;
  const volumeScore = Math.min(15, Math.max(0, postingCount - 1) * 3);
  return Math.min(100, 35 + workerScore + volumeScore);
}

function aggregate(rows, minWorkers) {
  const byCompany = new Map();
  const seenPostingIds = new Set();
  for (const row of rows) {
    const postingKey = `${row.city}|${row.id}`;
    if (seenPostingIds.has(postingKey)) continue;
    seenPostingIds.add(postingKey);

    const key = companyKey(row.company, row.city);
    const current = byCompany.get(key) ?? {
      key,
      company: row.company,
      city: row.city,
      workers: 0,
      postingCount: 0,
      addresses: [],
      sourceUrls: [],
    };
    current.workers += row.workers;
    current.postingCount += 1;
    if (!current.addresses.includes(row.address)) current.addresses.push(row.address);
    if (!current.sourceUrls.includes(row.sourceUrl)) current.sourceUrls.push(row.sourceUrl);
    byCompany.set(key, current);
  }

  return [...byCompany.values()]
    .filter((item) => item.workers >= minWorkers)
    .map((item) => ({ ...item, score: priorityScore(item.workers, item.postingCount) }))
    .sort((a, b) => b.score - a.score || b.workers - a.workers || a.company.localeCompare(b.company, "sv"));
}

async function loadPrevious(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function diffResults(current, previous) {
  const previousByKey = new Map((previous?.companies ?? []).map((item) => [item.key, item]));
  const currentKeys = new Set(current.map((item) => item.key));
  const added = current.filter((item) => !previousByKey.has(item.key));
  const increased = current
    .filter((item) => previousByKey.has(item.key) && item.workers > previousByKey.get(item.key).workers)
    .map((item) => ({ ...item, previousWorkers: previousByKey.get(item.key).workers }));
  const removed = (previous?.companies ?? []).filter((item) => !currentKeys.has(item.key));
  return { added, increased, removed };
}

function markdownTable(companies, { includeChange = false, limit = 50 } = {}) {
  if (companies.length === 0) return "_Inga poster._";
  const changeHeader = includeChange ? " | Förändring" : "";
  const separator = includeChange ? " | ---:" : "";
  const lines = [
    `| Poäng | Företag | Ort | Arbetstagare | Anmälningar${changeHeader} | Källa |`,
    `| ---: | --- | --- | ---: | ---:${separator} | --- |`,
  ];
  for (const item of companies.slice(0, limit)) {
    const change = includeChange ? ` | +${item.workers - item.previousWorkers}` : "";
    const source = item.sourceUrls[0] ? `[Registerpost](${item.sourceUrls[0]})` : "—";
    lines.push(
      `| ${item.score} | ${item.company.replaceAll("|", "\\|")} | ${item.city} | ${item.workers} | ${item.postingCount}${change} | ${source} |`,
    );
  }
  return lines.join("\n");
}

function buildMarkdown(snapshot) {
  const generated = new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  }).format(new Date(snapshot.generatedAt));
  const cities = snapshot.cities.join(", ");

  return `# StayOnSite projektradar

Senast uppdaterad: **${generated}**

Källa: [Arbetsmiljöverkets sökverktyg för pågående utstationeringar](${SEARCH_URL}). Underlaget visar anmälda pågående utstationeringar och ska verifieras mot företagets egen webbplats, projektkälla och en direkt kontakt innan bearbetning.

## Sammanfattning

- ${snapshot.companies.length} företag med minst ${snapshot.minWorkers} arbetstagare i de valda branscherna.
- ${snapshot.diff.added.length} nya företag sedan föregående körning.
- ${snapshot.diff.increased.length} företag med ökat antal registrerade arbetstagare.
- Bevakade orter: ${cities}.

## Nya företag

${markdownTable(snapshot.diff.added, { limit: 30 })}

## Ökad arbetsstyrka

${markdownTable(snapshot.diff.increased, { includeChange: true, limit: 30 })}

## Högst prioriterade aktiva arbetsgivare

${markdownTable(snapshot.companies, { limit: 75 })}

## Försvunna sedan föregående körning

Detta kan betyda att utstationeringen avslutats eller ändrats. Kontrollera innan en CRM-post stängs.

${markdownTable(snapshot.diff.removed, { limit: 30 })}

## Kvalificering före kontakt

1. Bekräfta vilket projekt och vilken svensk beställare företaget arbetar åt.
2. Hitta offentlig affärskontakt: projektchef, site manager, HR/mobility eller inköp.
3. Kontrollera uppskattad projekttid, arbetslagets storlek och om företaget redan har boende.
4. Prioritera 10+ personer, minst två månader och projekt utanför företagets normala hemort.
5. Lägg inte automatiskt in eller kontakta personer utan manuell verifiering.
`;
}

async function writeOutput(path, content) {
  const absolutePath = resolve(path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
  return absolutePath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const previous = await loadPrevious(resolve(args.jsonPath));
  const cityResults = [];

  for (const city of args.cities) {
    process.stderr.write(`Bevakar ${city[0]}…\n`);
    cityResults.push(...(await fetchCity(city)));
  }

  const companies = aggregate(cityResults, args.minWorkers);
  const diff = diffResults(companies, previous);
  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: SEARCH_URL,
    cities: args.cities.map(([name]) => name),
    expertiseCodes: EXPERTISE_CODES,
    minWorkers: args.minWorkers,
    rawPostingCount: new Set(cityResults.map((item) => `${item.city}|${item.id}`)).size,
    companies,
    diff,
  };

  const jsonPath = await writeOutput(args.jsonPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  const markdownPath = await writeOutput(args.markdownPath, buildMarkdown(snapshot));

  console.log(
    JSON.stringify(
      {
        companies: companies.length,
        newCompanies: diff.added.length,
        increasedCompanies: diff.increased.length,
        removedCompanies: diff.removed.length,
        jsonPath,
        markdownPath,
        top: companies.slice(0, 10).map(({ company, city, workers, score }) => ({ company, city, workers, score })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(`Projektradarn misslyckades: ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
