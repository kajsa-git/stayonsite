// Airbnb-import. Airbnb har inget öppet API, men sidan bär:
//   1) JSON-LD (schema.org VacationRental) — stabilt: namn, beskrivning, bilder, lat/long, ort.
//   2) "data-deferred-state" — sidans state-blob: rum/bäddar/badrum, bekvämligheter, boendetyp.
// parseAirbnbHtml() är ren (testas mot fixtur); fetchAirbnbListing() gör nätverksanropet.
import { safeFetchPublic } from "@/lib/crm/safe-fetch";
import { applyAirbnbAmenities } from "./traits";
import { emptyListing, type ImportedListing } from "./types";

type Json = unknown;

function jsonLdBlocks(html: string): Record<string, Json>[] {
  const out: Record<string, Json>[] = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) out.push(...parsed.filter((x) => x && typeof x === "object"));
      else if (parsed && typeof parsed === "object") out.push(parsed);
    } catch {
      /* hoppa över ogiltigt block */
    }
  }
  return out;
}

function deferredState(html: string): Json | null {
  const re = /<script id="data-deferred-state[^"]*"[^>]*>([\s\S]*?)<\/script>/gi;
  let best: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (!best || m[1].length > best.length) best = m[1];
  }
  if (!best) return null;
  try {
    return JSON.parse(best.trim());
  } catch {
    return null;
  }
}

// Samlar in det vi behöver ur state-trädet i en enda rekursiv genomgång.
interface Harvest {
  amenities: string[];
  sharingTitle: string | null;
  location: string | null; // sharingConfig.location, t.ex. "Örnsro, Örebro län, Sverige"
  propertyType: string | null;
  roomType: string | null;
}

function harvest(node: Json, acc: Harvest, depth = 0) {
  if (!node || typeof node !== "object" || depth > 30) return;
  if (Array.isArray(node)) {
    for (const v of node) harvest(v, acc, depth + 1);
    return;
  }
  const obj = node as Record<string, Json>;
  if (obj.__typename === "AmenityItem" && obj.available === true && typeof obj.title === "string") {
    acc.amenities.push(obj.title);
  }
  if (obj.sharingConfig && typeof obj.sharingConfig === "object") {
    const sc = obj.sharingConfig as Record<string, Json>;
    if (!acc.sharingTitle && typeof sc.title === "string") acc.sharingTitle = sc.title;
    if (!acc.location && typeof sc.location === "string") acc.location = sc.location;
  }
  if (!acc.propertyType && typeof obj.propertyType === "string") acc.propertyType = obj.propertyType;
  if (!acc.roomType && typeof obj.roomType === "string") acc.roomType = obj.roomType;
  for (const key of Object.keys(obj)) harvest(obj[key], acc, depth + 1);
}

function firstInt(re: RegExp, ...sources: (string | null)[]): number | null {
  for (const s of sources) {
    if (!s) continue;
    const m = s.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function parseAirbnbHtml(html: string, sourceUrl: string): ImportedListing {
  const l = emptyListing("airbnb", sourceUrl);

  // ---- JSON-LD ----
  const blocks = jsonLdBlocks(html);
  const ld =
    blocks.find((b) => b["@type"] === "VacationRental") ??
    blocks.find((b) => typeof b.name === "string" && (b.image || b.description)) ??
    null;

  let name: string | null = null;
  let description: string | null = null;
  let addressLocality: string | null = null;
  if (ld) {
    if (typeof ld.name === "string") name = ld.name.trim();
    if (typeof ld.description === "string") description = ld.description.trim();
    const img = ld.image;
    if (Array.isArray(img)) l.imageUrls = img.filter((u): u is string => typeof u === "string");
    else if (typeof img === "string") l.imageUrls = [img];
    const addr = ld.address as Record<string, Json> | undefined;
    if (addr && typeof addr.addressLocality === "string") addressLocality = addr.addressLocality.trim();
  }

  // ---- deferred state ----
  const acc: Harvest = { amenities: [], sharingTitle: null, location: null, propertyType: null, roomType: null };
  const state = deferredState(html);
  if (state) harvest(state, acc);

  // Rum/bäddar/badrum läses ENBART ur sammanfattningstiteln, t.ex.
  // "Lägenhet · Örnsro · ★4,91 · 1 sovrum · 1 säng · 1 privat badrum".
  // Aldrig ur hela state-blobben — där matchar siffror på måfå (fel publika antal).
  // Saknas titeln lämnas fälten tomma (Kajsa fyller i) hellre än att gissa fel.
  const title = acc.sharingTitle;
  l.bedrooms = firstInt(/(\d+)\s*(?:sovrum|bedrooms?)\b/i, title);
  l.beds = firstInt(/(\d+)\s*(?:säng(?:ar|plats(?:er)?)?|beds?)\b/i, title);
  // Tar heltalsdelen även vid halvbadrum ("1,5 badrum" → 1).
  l.bathrooms = firstInt(/(\d+)(?:[.,]\d+)?\s*(?:privat[a]?\s+|dela[dt]e?\s+|halv[a]?\s+)?(?:badrum|bath(?:room)?s?)\b/i, title);

  // Eget boende? "Hela boendet" / "Entire home" → eget; "delat"/"shared"/"privat rum"/"private room" → ej eget.
  const typeStr = [acc.propertyType, acc.roomType, title].filter(Boolean).join(" · ").toLowerCase();
  if (/hela boendet|entire home|entire place|entire/.test(typeStr)) l.egetBoende = true;
  else if (/delat|shared room|privat rum|private room/.test(typeStr)) l.egetBoende = false;

  // Ort: använd områdets/ortens namn (JSON-LD addressLocality, t.ex. "Boden", eller
  // stadsdelen "Örnsro"). ALDRIG länsnamnet — "Boden, Norrbottens län" får INTE bli
  // "Norrbottens". Faller tillbaka på första segmentet i sharingConfig.location.
  const localityFromState = acc.location ? acc.location.split(",")[0].trim() : null;
  l.city = addressLocality || localityFromState || null;
  if (/sverige|sweden/i.test(`${acc.location ?? ""} ${addressLocality ?? ""}`)) l.country = "Sverige";

  // Beskrivning: intern not = titel + text; extern = själva prosan.
  l.notes = [name, description].filter(Boolean).join("\n").trim() || null;
  l.publicDescription = description;

  applyAirbnbAmenities(l, acc.amenities);

  // Dedupe + tak på bilder.
  l.imageUrls = [...new Set(l.imageUrls)].slice(0, 15);

  if (!name && !l.imageUrls.length && l.bedrooms == null) {
    throw new Error("Kunde inte läsa annonsdata från Airbnb-sidan");
  }

  return l;
}

export async function fetchAirbnbListing(id: string, sourceUrl: string): Promise<ImportedListing> {
  // Hämta alltid den svenska sidan så rubrik/bekvämligheter blir på svenska.
  const fetchUrl = `https://www.airbnb.se/rooms/${id}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await safeFetchPublic(fetchUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml",
        "accept-language": "sv-SE,sv;q=0.9",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Airbnb svarade ${res.status}`);
  const html = await res.text();
  return parseAirbnbHtml(html, sourceUrl);
}
