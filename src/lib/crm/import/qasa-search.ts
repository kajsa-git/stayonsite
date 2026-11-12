// Qasa-sökning för matchning: uppdragets kriterier → Qasas publika sökindex
// (homeIndexSearch på api.qasa.com/graphql, samma API som importen i qasa.ts).
// Rena delar (klient + server) här; nätverksanropet searchQasa() bor i qasa-search-fetch.ts.
//
// Fällor i API:t (verifierade mot live 2026-10-30):
// - areaIdentifier är ort i gemener, "se/gävle". Både kommuner och tätorter fungerar
//   ("se/figeholm" ger bara Figeholm — verifierat 2026-11-12). Okänd identifierare filtrerar
//   INTE bort något — den ger hela indexet (~25 000 objekt). Vi skickar därför med en
//   kontrollfråga med påhittat område och avvisar träffar med samma totalCount.
// - Flerordsnamn stavas olika: "se/upplands_väsby" och "se/upplands-väsby" fungerar,
//   "se/lilla_edet" fungerar men "se/lilla-edet" inte. Vi provar båda varianterna.
// - moveInEarliest betyder "tillträde tidigast" (filtrerar bort redan lediga) —
//   för "ledig senast vid uppdragsstart" används moveInLatest.
import type { Property, Request } from "@/lib/crm/schema";

const CONTROL_AREA = "se/__stayonsite_kontroll__";
export const QASA_PAGE_SIZE = 30;

export interface QasaSearchCriteria {
  city: string;
  /** Antal personer som ska bo — Qasas "householdSize" (max antal boende). */
  persons: number | null;
  minBedrooms: number | null;
  /** Bostaden ska vara ledig senast detta datum (YYYY-MM-DD). */
  moveInLatest: string | null;
  /** Bostaden ska vara ledig åtminstone till detta datum (YYYY-MM-DD). */
  availableUntil: string | null;
  maxRent: number | null;
  furnished: boolean;
  /** Bara hela bostäder (inte rum i delat boende). */
  privateOnly: boolean;
}

export interface QasaSearchHit {
  qasaId: string;
  url: string;
  street: string | null;
  locality: string | null;
  rent: number | null;
  currency: string | null;
  squareMeters: number | null;
  rooms: number | null;
  bedrooms: number | null;
  householdSize: number | null;
  furnished: boolean | null;
  shared: boolean | null;
  homeType: string | null;
  startDate: string | null;
  endDate: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
}

export interface QasaSearchResult {
  area: string;
  total: number;
  hits: QasaSearchHit[];
}

export class QasaUnknownAreaError extends Error {
  constructor(city: string) {
    super(`Qasa känner inte igen "${city}" — prova ortens eller kommunens namn (t.ex. Gävle i stället för en stadsdel).`);
    this.name = "QasaUnknownAreaError";
  }
}

interface QasaSearchDoc {
  id?: string | null;
  rent?: number | null;
  currency?: string | null;
  squareMeters?: number | null;
  roomCount?: number | null;
  bedroomCount?: number | null;
  householdSize?: number | null;
  furnished?: boolean | null;
  shared?: boolean | null;
  homeType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  publishedAt?: string | null;
  displayStreetNumber?: boolean | null;
  location?: { route?: string | null; streetNumber?: string | null; locality?: string | null } | null;
  uploads?: { url: string; type: string }[] | null;
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const toDate = (v: string | null | undefined) => v?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
const positive = (n: number | null | undefined) => (typeof n === "number" && n > 0 ? n : null);

/** Kommunnamn → Qasas områdes-id, i den ordning de ska provas. */
export function qasaAreaCandidates(city: string): string[] {
  const base = city.trim().toLowerCase().replace(/\s+kommun$/, "").replace(/\s+/g, " ");
  if (!base) return [];
  const underscore = `se/${base.replace(/[ -]/g, "_")}`;
  const hyphen = `se/${base.replace(/[ _]/g, "-")}`;
  return underscore === hyphen ? [underscore] : [underscore, hyphen];
}

/** Förifyller sökningen från uppdraget. Allt går att justera i UI:t innan sökning. */
export function qasaCriteriaFromRequest(request: Request, today = new Date()): QasaSearchCriteria {
  const persons = positive(request.persons) ?? positive(request.bedsFrom);
  // Uppdrag som redan startat (eller saknar datum) behöver något som är ledigt nu.
  const start = request.startDate && request.startDate > isoDate(today) ? request.startDate : isoDate(today);
  return {
    city: request.city?.trim() ?? "",
    persons,
    minBedrooms: positive(request.bedroomsFrom),
    moveInLatest: start,
    availableUntil: !request.endDateOngoing && request.endDate ? request.endDate : null,
    maxRent: positive(request.budgetMax),
    furnished: !!request.furnishedRequired,
    privateOnly: true,
  };
}

function searchParams(c: QasaSearchCriteria, area: string): Record<string, unknown> {
  const p: Record<string, unknown> = { areaIdentifier: [area] };
  if (c.persons) p.householdSize = c.persons;
  if (c.minBedrooms) p.minBedroomCount = c.minBedrooms;
  if (c.moveInLatest) p.moveInLatest = c.moveInLatest;
  if (c.availableUntil) p.moveOutEarliest = c.availableUntil;
  if (c.maxRent) p.maxMonthlyCost = c.maxRent;
  if (c.furnished) p.furniture = true;
  if (c.privateOnly) p.shared = false;
  return p;
}

const DOC_FIELDS = `id rent currency squareMeters roomCount bedroomCount householdSize furnished shared
  homeType startDate endDate publishedAt displayStreetNumber
  location { route streetNumber locality } uploads { url type }`;

// Qasa tillåter max komplexitet 20 000 per anrop och varje homeIndexSearch kostar ~10 000,
// så varje områdesvariant och kontrollfrågan går som egna (parallella) anrop.
export function buildQasaSearchRequest(c: QasaSearchCriteria, area: string, offset = 0) {
  return {
    query: `query QasaSearch($p: HomeSearchParamsInput!, $offset: Int!) {
  homeIndexSearch(order: { direction: descending, orderBy: published_or_bumped_at }, params: $p) {
    documents(limit: ${QASA_PAGE_SIZE}, offset: $offset) { totalCount nodes { ${DOC_FIELDS} } }
  }
}`,
    variables: { p: searchParams(c, area), offset },
  };
}

export function buildQasaControlRequest(c: QasaSearchCriteria) {
  return {
    query: `query QasaControl($p: HomeSearchParamsInput!) { homeIndexSearch(params: $p) { documents(limit: 0) { totalCount } } }`,
    variables: { p: searchParams(c, CONTROL_AREA) },
  };
}

export function normalizeQasaSearchDoc(doc: QasaSearchDoc): QasaSearchHit | null {
  if (!doc.id) return null;
  const loc = doc.location ?? {};
  // Gatunummer bara om uthyraren valt att visa det på Qasa.
  const street = [loc.route, doc.displayStreetNumber ? loc.streetNumber : null].filter(Boolean).join(" ").trim();
  return {
    qasaId: doc.id,
    url: `https://qasa.com/se/sv/home/${doc.id}`,
    street: street || null,
    locality: loc.locality ?? null,
    rent: typeof doc.rent === "number" ? doc.rent : null,
    currency: doc.currency ?? null,
    squareMeters: typeof doc.squareMeters === "number" ? doc.squareMeters : null,
    rooms: typeof doc.roomCount === "number" ? doc.roomCount : null,
    bedrooms: typeof doc.bedroomCount === "number" ? doc.bedroomCount : null,
    householdSize: typeof doc.householdSize === "number" ? doc.householdSize : null,
    furnished: doc.furnished ?? null,
    shared: doc.shared ?? null,
    homeType: doc.homeType ?? null,
    startDate: toDate(doc.startDate),
    endDate: toDate(doc.endDate),
    publishedAt: doc.publishedAt ?? null,
    imageUrl: (doc.uploads ?? []).find((u) => u?.url && u.type === "home_picture")?.url ?? null,
  };
}

export type QasaSearchResponse = {
  data?: { homeIndexSearch?: { documents?: { totalCount?: number; nodes?: QasaSearchDoc[] } } | null };
  errors?: { message: string }[];
};

/** Väljer den områdesvariant Qasa faktiskt kände igen (totalCount ≠ kontrollfrågans). */
export function pickQasaSearchResult(
  responses: QasaSearchResponse[],
  control: QasaSearchResponse,
  areas: string[],
  city: string,
): QasaSearchResult {
  const firstError = [...responses, control].find((r) => r.errors?.length)?.errors?.[0];
  if (firstError) throw new Error(`Qasa-fel: ${firstError.message}`);
  const controlTotal = control.data?.homeIndexSearch?.documents?.totalCount;
  for (let i = 0; i < areas.length; i++) {
    const docs = responses[i]?.data?.homeIndexSearch?.documents;
    if (!docs || typeof docs.totalCount !== "number") continue;
    if (controlTotal != null && controlTotal > 0 && docs.totalCount === controlTotal) continue; // okänt område
    return {
      area: areas[i],
      total: docs.totalCount,
      hits: (docs.nodes ?? []).map(normalizeQasaSearchDoc).filter((h): h is QasaSearchHit => !!h),
    };
  }
  throw new QasaUnknownAreaError(city);
}

/**
 * Qasa-träff som (ofullständigt) objekt så samma matchDetails() kan poängsätta den.
 * Orten sätts till uppdragets ort: sökningen är redan avgränsad till den kommunen,
 * och Qasas "locality" är ofta en tätort inom den (Fårbo i Oskarshamn).
 * Qasa-hyran är vår inhyra — rentOut lämnas tom så budgetjämförelsen inte blir fel.
 */
export function qasaHitAsProperty(hit: QasaSearchHit, requestCity: string | null): Property {
  return {
    address: hit.street,
    city: requestCity || hit.locality,
    postalCode: null,
    beds: hit.householdSize,
    bedrooms: hit.bedrooms,
    furnished: hit.furnished,
    garage: null,
    moveInFrom: hit.startDate,
    availableTo: hit.endDate,
    rentIn: hit.rent,
    rentOut: null,
    status: "available",
  } as Property;
}

/**
 * Intern anteckning på objekt som importerats från en Qasa-sökning: bostaden är ett
 * uppslag, inte en bostad vi har avtal om. Läggs före annonsens egen beskrivning.
 */
export function qasaLeadNote(listingNotes: string | null | undefined, today = new Date()): string {
  const head = `Qasa-uppslag, importerat ${isoDate(today)} via matchning. Inget avtal med uthyraren ännu — kontakta uthyraren innan bostaden erbjuds kund.`;
  return listingNotes?.trim() ? `${head}\n\n${listingNotes.trim()}` : head;
}

/**
 * Utrymme mellan kundens budget och Qasa-hyran (vår inhyra), kr/mån. Negativt eller
 * noll = ingen marginal ens före övriga kostnader. null när någon av siffrorna saknas
 * eller hyran inte är i SEK.
 */
export function qasaBudgetRoom(hit: Pick<QasaSearchHit, "rent" | "currency">, budgetMax: number | null | undefined): number | null {
  if (!budgetMax || budgetMax <= 0 || hit.rent == null) return null;
  if (hit.currency && hit.currency !== "SEK") return null;
  return Math.round(budgetMax - hit.rent);
}
