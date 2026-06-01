// Normaliserad annons-import (Qasa/Airbnb) → fält som mappar rakt mot objekt-formuläret.
// Allt är frivilligt: bara det vi faktiskt kunde härleda fylls i, Kajsa granskar innan spara.
// INGA db-/drizzle-importer här — filen ska kunna köras både i klienten och i parsern.
import type { PropertyWithOwner } from "@/lib/crm/owners";

export type ListingSource = "qasa" | "airbnb";

export const SOURCE_LABEL: Record<ListingSource, string> = {
  qasa: "Qasa",
  airbnb: "Airbnb",
};

export interface ImportedListing {
  source: ListingSource;
  sourceUrl: string; // ren, delbar länk — läggs i objektets links[]

  // Plats (Airbnb exponerar aldrig exakt gatuadress → address blir null där)
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null; // "Sverige" som default när källan är svensk

  // Storlek
  squareMeters: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;

  // Ekonomi
  rentIn: number | null; // uthyrarens månadshyra (det vi betalar in)

  // Egenskaper
  furnished: boolean | null;
  kitchen: boolean | null;
  dishwasher: boolean | null;
  garage: boolean | null;
  broadband: boolean | null;
  egetBoende: boolean | null;
  linensIncluded: boolean | null;
  heatWaterIncluded: boolean | null;
  washingMachines: number | null;
  dryers: number | null;
  parkingSpaces: number | null;

  // Text
  notes: string | null; // intern referens (annonsens egen beskrivning)
  publicDescription: string | null; // extern beskrivning (redigerbar) — förifylls på begäran
  inclusions: string[]; // "Vad ingår"-lista (sv)

  // Tillgänglighet
  moveInFrom: string | null; // YYYY-MM-DD
  availableTo: string | null;

  // Uthyrare (normaliseras server-side till owners-tabellen)
  ownerName: string | null;
  ownerType: string | null; // "privatperson" | "foretag"

  // Bilder — källans URL:er. Laddas ner server-side till R2 först vid spara.
  imageUrls: string[];
}

// Skapar ett tomt skal så varje parser bara behöver fylla i det den hittar.
export function emptyListing(source: ListingSource, sourceUrl: string): ImportedListing {
  return {
    source,
    sourceUrl,
    address: null,
    postalCode: null,
    city: null,
    country: null,
    squareMeters: null,
    bedrooms: null,
    beds: null,
    bathrooms: null,
    rentIn: null,
    furnished: null,
    kitchen: null,
    dishwasher: null,
    garage: null,
    broadband: null,
    egetBoende: null,
    linensIncluded: null,
    heatWaterIncluded: null,
    washingMachines: null,
    dryers: null,
    parkingSpaces: null,
    notes: null,
    publicDescription: null,
    inclusions: [],
    moveInFrom: null,
    availableTo: null,
    ownerName: null,
    ownerType: null,
    imageUrls: [],
  };
}

// Alla formulär-/objektnycklar som en import KAN sätta. Används för att nollställa
// import-härledda fält innan en ny import läggs in (annars läcker fält från en tidigare
// import kvar — t.ex. Qasa-adress/uthyrare som hänger med när man sedan importerar Airbnb).
export const IMPORT_MANAGED_KEYS: (keyof PropertyWithOwner)[] = [
  "address", "postalCode", "city", "country", "squareMeters", "bedrooms", "beds", "bathrooms",
  "rentIn", "furnished", "kitchen", "dishwasher", "garage", "broadband", "egetBoende",
  "linensIncluded", "heatWaterIncluded", "washingMachines", "dryers", "parkingSpaces",
  "notes", "publicDescription", "ownerName", "ownerType", "moveInFrom", "availableTo",
  "inclusions", "links",
];

// Plattar ut en importerad annons till en partiell formulär-/payload-patch.
// Bara fält med faktiskt värde tas med — null/tomt rör aldrig befintliga formulärvärden.
// Klient-säker (ren funktion): används både för att förifylla formuläret och som payload-bas.
export function listingToPropertyPatch(listing: ImportedListing): Partial<PropertyWithOwner> {
  const patch: Partial<PropertyWithOwner> = {};
  const setStr = (k: keyof PropertyWithOwner, v: string | null) => {
    if (v != null && v.trim() !== "") (patch as Record<string, unknown>)[k] = v;
  };
  const setNum = (k: keyof PropertyWithOwner, v: number | null) => {
    if (v != null && Number.isFinite(v)) (patch as Record<string, unknown>)[k] = v;
  };
  const setBool = (k: keyof PropertyWithOwner, v: boolean | null) => {
    if (v != null) (patch as Record<string, unknown>)[k] = v;
  };

  setStr("address", listing.address);
  setStr("postalCode", listing.postalCode);
  setStr("city", listing.city);
  setStr("country", listing.country);
  setNum("squareMeters", listing.squareMeters);
  setNum("bedrooms", listing.bedrooms);
  setNum("beds", listing.beds);
  setNum("bathrooms", listing.bathrooms);
  setNum("rentIn", listing.rentIn);
  setBool("furnished", listing.furnished);
  setBool("kitchen", listing.kitchen);
  setBool("dishwasher", listing.dishwasher);
  setBool("garage", listing.garage);
  setBool("broadband", listing.broadband);
  setBool("egetBoende", listing.egetBoende);
  setBool("linensIncluded", listing.linensIncluded);
  setBool("heatWaterIncluded", listing.heatWaterIncluded);
  setNum("washingMachines", listing.washingMachines);
  setNum("dryers", listing.dryers);
  setNum("parkingSpaces", listing.parkingSpaces);
  setStr("notes", listing.notes);
  setStr("publicDescription", listing.publicDescription);
  setStr("ownerName", listing.ownerName);
  setStr("ownerType", listing.ownerType);
  setStr("moveInFrom", listing.moveInFrom);
  setStr("availableTo", listing.availableTo);
  if (listing.inclusions.length) patch.inclusions = [...listing.inclusions];
  if (listing.sourceUrl) patch.links = [listing.sourceUrl];

  return patch;
}
