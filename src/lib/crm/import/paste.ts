// Parser för INKLISTRAD sidtext från Hemnet/Booli — sajterna ligger bakom
// Cloudflares botskydd så server-hämtning är omöjlig; Kajsa öppnar annonsen,
// markerar allt (Cmd+A), kopierar och klistrar in. Sidorna är säljannonser:
// pris/avgift hamnar i interna anteckningar, ingen hyra sätts. Rena funktioner
// (klient-säkra), testade mot riktiga sidtexter i __fixtures__.
import { emptyListing, type ImportedListing } from "./types";

function toLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/ /g, " ").trim())
    .filter(Boolean);
}

// Etikett/värde-mönster: värdet är raden EFTER etikettraden ("Boarea" → "57 m²").
function valueAfter(lines: string[], label: string): string | null {
  const i = lines.findIndex((l) => l.toLowerCase() === label.toLowerCase());
  return i >= 0 && i + 1 < lines.length ? lines[i + 1] : null;
}

function parseNumber(s: string | null): number | null {
  if (!s) return null;
  const m = s.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// "2 rum" → sovrum: svensk konvention är rum inkl. vardagsrum → sovrum = rum − 1.
function bedroomsFromRooms(rooms: number | null): number | null {
  if (rooms == null || rooms < 1) return null;
  return Math.max(1, Math.round(rooms) - 1);
}

// De långa beskrivningsstyckena i annonsen — rader ≥ 80 tecken är brödtext,
// etikettrader och siffror är alltid korta.
function descriptionParagraphs(lines: string[], max = 5): string[] {
  return lines.filter((l) => l.length >= 80).slice(0, max);
}

function buildNotes(source: string, facts: (string | null)[], description: string[]): string | null {
  const factLine = facts.filter(Boolean).join(" · ");
  const parts = [
    `Import från ${source} (säljannons)${factLine ? `: ${factLine}` : ""}`,
    ...description,
  ].filter(Boolean);
  return parts.length ? parts.join("\n\n") : null;
}

// "Stockholms kommun" → "Stockholm", "Kungälvs kommun" → "Kungälv"
function cityFromKommun(kommun: string): string {
  return kommun.replace(/s? kommun$/i, "").trim();
}

export function parseHemnetText(text: string, sourceUrl: string): ImportedListing {
  const lines = toLines(text);
  const listing = emptyListing("hemnet", sourceUrl);
  listing.country = "Sverige";

  // Områdesraden "Årsta, Stockholms kommun" — adressen är närmast föregående
  // rad som ser ut som en gatuadress (bokstäver + siffra).
  const areaIdx = lines.findIndex((l) => /,\s*[^,]+ kommun$/i.test(l));
  if (areaIdx >= 0) {
    const [, kommun] = lines[areaIdx].split(",").map((s) => s.trim());
    if (kommun) listing.city = cityFromKommun(kommun);
    for (let i = areaIdx - 1; i >= Math.max(0, areaIdx - 4); i--) {
      if (/^[A-ZÅÄÖ][^:]*\d/.test(lines[i])) {
        listing.address = lines[i];
        break;
      }
    }
  }

  listing.squareMeters = parseNumber(valueAfter(lines, "Boarea"));
  listing.bedrooms = bedroomsFromRooms(parseNumber(valueAfter(lines, "Antal rum")));

  const facts = [
    valueAfter(lines, "Bostadstyp") ? `Bostadstyp ${valueAfter(lines, "Bostadstyp")}` : null,
    valueAfter(lines, "Antal rum") ? `${valueAfter(lines, "Antal rum")}` : null,
    valueAfter(lines, "Utgångspris") ? `Utgångspris ${valueAfter(lines, "Utgångspris")}` : null,
    valueAfter(lines, "Avgift") ? `Avgift ${valueAfter(lines, "Avgift")}` : null,
    valueAfter(lines, "Driftkostnad") ? `Driftkostnad ${valueAfter(lines, "Driftkostnad")}` : null,
    valueAfter(lines, "Våning") ? `Våning ${valueAfter(lines, "Våning")}` : null,
  ];
  listing.notes = buildNotes("Hemnet", facts, descriptionParagraphs(lines));

  return listing;
}

export function parseBooliText(text: string, sourceUrl: string): ImportedListing {
  const lines = toLines(text);
  const listing = emptyListing("booli", sourceUrl);
  listing.country = "Sverige";

  // Typraden "Lägenhet · Ytterby · Kungälv" — adressen är raden närmast före
  // (hoppa över statusrader som "Snart till salu"/"Till salu"/"Slutpris").
  const typeIdx = lines.findIndex((l) =>
    /^(Lägenhet|Villa|Radhus|Parhus|Kedjehus|Fritidshus|Tomt|Gård)\s*·/.test(l)
  );
  if (typeIdx >= 0) {
    const parts = lines[typeIdx].split("·").map((s) => s.trim());
    if (parts.length >= 2) listing.city = parts[parts.length - 1];
    for (let i = typeIdx - 1; i >= Math.max(0, typeIdx - 4); i--) {
      if (/till salu|slutpris|karta|spara|planritning/i.test(lines[i])) continue;
      if (/^[A-ZÅÄÖ]/.test(lines[i])) {
        listing.address = lines[i];
        break;
      }
    }
  }

  listing.squareMeters = parseNumber(valueAfter(lines, "Boarea"));
  listing.bedrooms = bedroomsFromRooms(parseNumber(valueAfter(lines, "Rum")));

  const vaning = lines.find((l) => /våning \d+ av \d+/i.test(l)) ?? null;
  const facts = [
    typeIdx >= 0 ? lines[typeIdx].split("·")[0].trim() : null,
    valueAfter(lines, "Rum"),
    valueAfter(lines, "Utropspris") ? `Utropspris ${valueAfter(lines, "Utropspris")}` : null,
    valueAfter(lines, "Avgift") ? `Avgift ${valueAfter(lines, "Avgift")}` : null,
    valueAfter(lines, "Byggår") ? `Byggår ${valueAfter(lines, "Byggår")}` : null,
    vaning,
    lines.includes("Hiss") ? "Hiss" : null,
    lines.includes("Balkong") ? "Balkong" : null,
  ];
  listing.notes = buildNotes("Booli", facts, descriptionParagraphs(lines));

  return listing;
}

export function parsePastedListing(
  source: "hemnet" | "booli",
  text: string,
  sourceUrl: string
): ImportedListing {
  return source === "hemnet" ? parseHemnetText(text, sourceUrl) : parseBooliText(text, sourceUrl);
}
