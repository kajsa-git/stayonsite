// Datakvalitet i företagsbanken: samma regler för webbformulär, skrapade
// webbplatstitlar och manuella ändringar i CRM:et. Allt här är rena funktioner
// (inga DB-anrop) så att engångsstädningar och tester kan återanvända dem.

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  auml: "ä", Auml: "Ä", ouml: "ö", Ouml: "Ö", aring: "å", Aring: "Å",
  uuml: "ü", Uuml: "Ü", eacute: "é", Eacute: "É", oslash: "ø", Oslash: "Ø",
  aelig: "æ", AElig: "Æ", scaron: "š", Scaron: "Š", zcaron: "ž", Zcaron: "Ž",
};

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code] ?? match;
  });
}

// Svar i fältet "Företag" som betyder "inget företag" eller är skräp.
// Matchas mot hela värdet (efter trimning), aldrig delsträngar av riktiga namn.
const PLACEHOLDER_PATTERNS = [
  /^[-–—?.!\s]*$/,
  /^\d{1,4}$/, // "0", "000"
  /^(?:n\/?a|none|no|nej|nope|ingen|inget|inga|okänt|okand|unknown|vet ej|-)$/i,
  /^(?:privat|private|privatkund)(?:\s*person(?:er)?)?(?:\s+student)?$/i, // "Privat person", "Privatperson student"
  /^student$/i,
  /^(?:inga?|ej|inte|har inte|har ej|saknar)\s+(?:något\s+)?f[oö]retag$/i,
  /\bhar (?:inte|ej|inget) (?:något )?f[oö]retag\b/i,
];

export function isPlaceholderCompanyName(value: string | null | undefined): boolean {
  const text = value?.trim();
  if (!text) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(text));
}

// CRM-genererade etiketter för förfrågningar utan riktigt bolagsnamn.
export function isGeneratedCompanyLabel(value: string | null | undefined): boolean {
  const text = value?.trim() ?? "";
  return text.startsWith("Webbförfrågan") || text.startsWith("Privatperson ·");
}

export function privatePersonLabel(contact: { name?: string | null; email?: string | null; phone?: string | null }): string {
  const who = contact.name?.trim() || contact.email?.trim() || contact.phone?.trim();
  return who ? `Privatperson · ${who}` : "Privatperson";
}

// Svenska bolagsformer i slutet av namnet. "Oy Ab" är finsk praxis och lämnas.
const SWEDISH_LEGAL_FORM = /\s(ab|hb|kb)$/i;

/**
 * Normaliserar ett bolagsnamn utan att gissa: avkodar HTML-entities, städar
 * blanksteg, skriver bolagsform rätt i slutet ("Grandvia ab" → "Grandvia AB")
 * och tar bort en upprepning av namnet ("X AB – X AB" → "X AB").
 * Returnerar null för tomma värden och platshållare som "Privat"/"Nej".
 */
export function normalizeCompanyName(value: string | null | undefined): string | null {
  if (value == null) return null;
  let name = decodeHtmlEntities(String(value)).replace(/\s+/g, " ").trim();
  if (!name || isPlaceholderCompanyName(name)) return null;

  const parts = name.split(/\s+[–—|-]\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) name = parts[0];

  if (!/\soy\s+ab$/i.test(name)) name = name.replace(SWEDISH_LEGAL_FORM, (_, form: string) => ` ${form.toUpperCase()}`);
  return name;
}

// Segment i <title> som beskriver sidan, inte bolaget.
const GENERIC_TITLE_SEGMENTS = /^(?:home|hem|start|startsida|startsidan|etusivu|forside|forsiden|strona g[lł]ówna|welcome|välkommen|kontakt|contact|om oss|about(?: us)?)$/i;
const BLOCKED_TITLES = /^(?:access denied|forbidden|403\b|404\b|not found|just a moment|attention required|error|site not found|index of|domain .*for sale|coming soon|under construction)/i;

function compact(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

/**
 * Plockar bolagsnamnet ur en skrapad og:site_name eller <title>. Titlar är ofta
 * "Sida | Bolag" eller "Bolag – slogan": välj segmentet som liknar domänen.
 * En <title> utan sådant segment är oftast en slogan ("European Scaffolding
 * Training …") och ger null, liksom felsidor ("Access Denied") — då faller
 * anroparen tillbaka på domänen i stället för att spara ett felaktigt namn.
 */
export function cleanScrapedSiteName(
  raw: string | null | undefined,
  domain: string,
  source: "og:site_name" | "title",
): string | null {
  if (!raw) return null;
  const decoded = decodeHtmlEntities(raw).replace(/\s+/g, " ").trim();
  if (!decoded || BLOCKED_TITLES.test(decoded)) return null;

  const segments = decoded
    .split(/\s+[|–—•·-]\s+/)
    .map((s) => s.trim())
    .filter((s) => s && !GENERIC_TITLE_SEGMENTS.test(s) && !/^www\./i.test(s));
  if (segments.length === 0) return null;

  const label = compact(domain.replace(/^www\./, "").split(".")[0] ?? "");
  const byDomain = label.length >= 3
    ? segments.find((s) => {
        const c = compact(s);
        return c.length >= 3 && (c.includes(label) || label.includes(c));
      })
    : undefined;
  const pick = byDomain ?? (source === "og:site_name" && segments.length === 1 ? segments[0] : null);
  if (!pick || pick.length > 60) return null;
  return normalizeCompanyName(pick);
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[i]);
    if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

/**
 * Svenskt org-/personnummer → NNNNNN-NNNN. Kräver giltig kontrollsiffra så att
 * utländska nummer med tio siffror (t.ex. polskt NIP) inte formateras om.
 * Övriga värden lämnas trimmade.
 */
export function normalizeOrgNr(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (!/^[\d\s-]+$/.test(text)) return text;
  let digits = text.replace(/\D/g, "");
  if (/^(?:16|18|19|20)\d{10}$/.test(digits)) digits = digits.slice(2);
  if (digits.length === 10 && luhnValid(digits)) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return text;
}

/**
 * "www.x.se" → "https://www.x.se"; kontaktsidor ("/kontakta-oss/") kortas till
 * startsidan. Övriga sökvägar behålls (t.ex. en koncerns sida för dotterbolaget).
 * Ogiltiga värden lämnas orörda.
 */
export function normalizeWebsite(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!url.hostname.includes(".")) return text;
    const path = /^\/(?:kontakt\w*|kontakta-oss|contact(?:-us)?)\/?$/i.test(url.pathname) ? "" : url.pathname.replace(/\/$/, "");
    return `${url.protocol}//${url.hostname.toLowerCase()}${path}${url.search}`;
  } catch {
    return text;
  }
}

/** Normaliserar de bolagsfält som finns i ett skriv-objekt (PATCH/POST). */
export function normalizeCompanyFields<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = { ...data };
  if (typeof out.name === "string") {
    out.name = decodeHtmlEntities(out.name).replace(/\s+/g, " ").trim();
    if (!isGeneratedCompanyLabel(out.name as string)) out.name = normalizeCompanyName(out.name as string) ?? out.name;
  }
  if ("orgNr" in out && (typeof out.orgNr === "string" || out.orgNr == null)) out.orgNr = normalizeOrgNr(out.orgNr as string | null);
  if ("website" in out && (typeof out.website === "string" || out.website == null)) out.website = normalizeWebsite(out.website as string | null);
  return out as T;
}
