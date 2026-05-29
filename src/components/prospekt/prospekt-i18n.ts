// Delade översättningssträngar för publika objekt-sidor (prospekt + /boenden/[slug]).
// Ren modul utan DB-beroenden — kan importeras av server-komponenter och metadata-funktioner.

export type Lang = "sv" | "en" | "pl";

export function pickLang(v: string | string[] | undefined): Lang {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "en" || s === "pl" ? s : "sv";
}

export const T: Record<Lang, {
  tagline: string;
  title: (c: string | null) => string;
  photos: (n: number) => string;
  details: string;
  condition: string;
  included: string;
  distancesTitle: string;
  mapTitle: string;
  ctaTitle: string;
  ctaSub: string;
  ctaButton: string;
  ctaHref: string;
  footer: string;
  metaDesc: (place: string) => string;
  hl: { furnished: string; eget: string };
  f: { area: string; bedrooms: string; beds: string; bathrooms: string; washer: string; dryer: string; dishwasher: string; parking: string; from: string; to: string };
  parkingUnit: string;
}> = {
  sv: {
    tagline: "Bostadsförslag",
    title: (c) => (c ? `Boende i ${c}` : "Bostadsförslag"),
    photos: (n) => `${n} bilder`,
    details: "Detaljer",
    condition: "Skick",
    included: "Vad ingår",
    distancesTitle: "Avstånd",
    mapTitle: "Karta",
    ctaTitle: "Intresserad av den här bostaden?",
    ctaSub: "Hör av dig till StayOnSite så hjälper vi dig vidare — ofta med svar inom 24 timmar.",
    ctaButton: "Kontakta oss",
    ctaHref: "https://www.stayonsite.se/kontakt",
    footer: "StayOnSite · Corporate housing i hela Sverige",
    metaDesc: (place) => `Möblerat boende i ${place} via StayOnSite — corporate housing i hela Sverige.`,
    hl: { furnished: "Möblerat", eget: "Eget boende" },
    f: { area: "Yta", bedrooms: "Sovrum", beds: "Bäddar", bathrooms: "Badrum", washer: "Tvättmaskin", dryer: "Tumlare", dishwasher: "Diskmaskin", parking: "Parkering", from: "Tillgänglig från", to: "Tillgänglig till" },
    parkingUnit: "pl.",
  },
  en: {
    tagline: "Housing proposal",
    title: (c) => (c ? `Accommodation in ${c}` : "Housing proposal"),
    photos: (n) => `${n} photos`,
    details: "Details",
    condition: "Condition",
    included: "What's included",
    distancesTitle: "Distances",
    mapTitle: "Map",
    ctaTitle: "Interested in this property?",
    ctaSub: "Get in touch with StayOnSite and we'll help you further — usually a reply within 24 hours.",
    ctaButton: "Contact us",
    ctaHref: "https://www.stayonsite.se/en/corporate-housing-sweden",
    footer: "StayOnSite · Corporate housing across Sweden",
    metaDesc: (place) => `Furnished accommodation in ${place} via StayOnSite — corporate housing across Sweden.`,
    hl: { furnished: "Furnished", eget: "Private accommodation" },
    f: { area: "Area", bedrooms: "Bedrooms", beds: "Beds", bathrooms: "Bathrooms", washer: "Washing machine", dryer: "Dryer", dishwasher: "Dishwasher", parking: "Parking", from: "Available from", to: "Available until" },
    parkingUnit: "spots",
  },
  pl: {
    tagline: "Propozycja zakwaterowania",
    title: (c) => (c ? `Zakwaterowanie w ${c}` : "Propozycja zakwaterowania"),
    photos: (n) => `${n} zdjęć`,
    details: "Szczegóły",
    condition: "Stan",
    included: "Co jest wliczone",
    distancesTitle: "Odległości",
    mapTitle: "Mapa",
    ctaTitle: "Zainteresowany tym mieszkaniem?",
    ctaSub: "Skontaktuj się ze StayOnSite, a pomożemy Ci dalej — zwykle odpowiadamy w ciągu 24 godzin.",
    ctaButton: "Skontaktuj się",
    ctaHref: "https://www.stayonsite.se/pl/zakwaterowanie-firmowe",
    footer: "StayOnSite · Zakwaterowanie firmowe w całej Szwecji",
    metaDesc: (place) => `Umeblowane zakwaterowanie w ${place} przez StayOnSite — zakwaterowanie firmowe w całej Szwecji.`,
    hl: { furnished: "Umeblowane", eget: "Własne zakwaterowanie" },
    f: { area: "Powierzchnia", bedrooms: "Sypialnie", beds: "Łóżka", bathrooms: "Łazienki", washer: "Pralka", dryer: "Suszarka", dishwasher: "Zmywarka", parking: "Parking", from: "Dostępne od", to: "Dostępne do" },
    parkingUnit: "miejsc",
  },
};

export const LANGS: { code: Lang; label: string }[] = [
  { code: "sv", label: "SV" },
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
];
