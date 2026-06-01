// Mappar källornas bekvämligheter → objektets booleska fält, antal och "vad ingår"-lista.
// Qasa ger maskinläsbara enums (snake_case, stabila). Airbnb ger fria svenska/engelska
// titlar → nyckelords-matchning. Båda muterar en ImportedListing in-place (testas isolerat).
import type { ImportedListing } from "./types";

function addInclusion(listing: ImportedListing, label: string) {
  const norm = label.trim();
  if (!norm) return;
  if (!listing.inclusions.some((x) => x.toLowerCase() === norm.toLowerCase())) {
    listing.inclusions.push(norm);
  }
}

// Qasa-trait → svensk etikett + sidoeffekt. Okända traits hoppas medvetet över
// (Kajsa lägger till manuellt; länken finns på objektet att dubbelkolla mot).
const QASA_TRAITS: Record<string, { label?: string; apply?: (l: ImportedListing) => void }> = {
  furniture: { label: "Möblerat", apply: (l) => (l.furnished = true) },
  fridge: { label: "Kylskåp", apply: (l) => (l.kitchen = true) },
  freezer: { label: "Frys", apply: (l) => (l.kitchen = true) },
  oven: { label: "Ugn", apply: (l) => (l.kitchen = true) },
  stove: { label: "Spis", apply: (l) => (l.kitchen = true) },
  kitchenette: { label: "Kokvrå", apply: (l) => (l.kitchen = true) },
  microwave_oven: { label: "Mikrovågsugn", apply: (l) => (l.kitchen = true) },
  dish_washer: { label: "Diskmaskin", apply: (l) => (l.dishwasher = true) },
  dishwasher: { label: "Diskmaskin", apply: (l) => (l.dishwasher = true) },
  washing_machine: { label: "Tvättmaskin", apply: (l) => (l.washingMachines = Math.max(1, l.washingMachines ?? 0)) },
  tumble_dryer: { label: "Torktumlare", apply: (l) => (l.dryers = Math.max(1, l.dryers ?? 0)) },
  dryer: { label: "Torktumlare", apply: (l) => (l.dryers = Math.max(1, l.dryers ?? 0)) },
  internet: { label: "Bredband", apply: (l) => (l.broadband = true) },
  broadband: { label: "Bredband", apply: (l) => (l.broadband = true) },
  wifi: { label: "Wifi", apply: (l) => (l.broadband = true) },
  television: { label: "TV" },
  patio: { label: "Uteplats" },
  balcony: { label: "Balkong" },
  bathtub: { label: "Badkar" },
  shower: { label: "Dusch" },
  sauna: { label: "Bastu" },
  fireplace: { label: "Braskamin" },
  storage: { label: "Förråd" },
  bike_room: { label: "Cykelrum" },
  elevator: { label: "Hiss" },
  parking: { label: "Parkering", apply: (l) => (l.parkingSpaces = Math.max(1, l.parkingSpaces ?? 0)) },
  garage: { label: "Garage", apply: (l) => (l.garage = true) },
  recycling: { label: "Återvinningsrum" },
  balcony_or_patio: { label: "Balkong/uteplats" },
};

export function applyQasaTraits(listing: ImportedListing, traits: string[]) {
  for (const raw of traits) {
    const t = (raw ?? "").toLowerCase().trim();
    const m = QASA_TRAITS[t];
    if (!m) continue;
    m.apply?.(listing);
    if (m.label) addInclusion(listing, m.label);
  }
}

// Airbnb-titel-regler: matchar nyckelord (sv + en) → sidoeffekt. Endast tillgängliga
// (available) bekvämligheter ska skickas in. Titlarna läggs även in i "vad ingår".
const AIRBNB_RULES: { match: (t: string) => boolean; apply: (l: ImportedListing) => void }[] = [
  { match: (t) => /\bkök\b|kitchen/.test(t), apply: (l) => (l.kitchen = true) },
  { match: (t) => /wifi|internet|bredband/.test(t), apply: (l) => (l.broadband = true) },
  { match: (t) => /diskmaskin|dishwasher/.test(t), apply: (l) => (l.dishwasher = true) },
  { match: (t) => /tvättmaskin|washer|washing machine/.test(t), apply: (l) => (l.washingMachines = Math.max(1, l.washingMachines ?? 0)) },
  { match: (t) => /torktumlare|tumlare|\bdryer\b/.test(t), apply: (l) => (l.dryers = Math.max(1, l.dryers ?? 0)) },
  { match: (t) => /\bgarage\b/.test(t), apply: (l) => (l.garage = true) },
  { match: (t) => /parkering|parking/.test(t), apply: (l) => (l.parkingSpaces = Math.max(1, l.parkingSpaces ?? 0)) },
  { match: (t) => /sängkläder|linens|handdukar?|towels/.test(t), apply: (l) => (l.linensIncluded = true) },
  { match: (t) => /varmvatten|hot water|centralvärme|värme|heating/.test(t), apply: (l) => (l.heatWaterIncluded = true) },
];

// Titlar som inte hör hemma i en "vad ingår"-lista för corporate housing.
const AIRBNB_INCLUSION_SKIP = /brandvarnare|brandsläckare|kolmonoxid|första hjälpen|smoke alarm|fire extinguisher|carbon monoxide|övervakningskamer|security camera/i;

export function applyAirbnbAmenities(listing: ImportedListing, titles: string[]) {
  for (const raw of titles) {
    const title = (raw ?? "").trim();
    if (!title) continue;
    const t = title.toLowerCase();
    for (const rule of AIRBNB_RULES) if (rule.match(t)) rule.apply(listing);
    if (!AIRBNB_INCLUSION_SKIP.test(title)) addInclusion(listing, title);
  }
  // Håll listan hanterbar — Kajsa redigerar i detaljvyn.
  if (listing.inclusions.length > 20) listing.inclusions = listing.inclusions.slice(0, 20);
}
