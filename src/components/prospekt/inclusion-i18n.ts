import type { Lang } from "./prospekt-i18n";

// Deterministisk översättning av "vad ingår"-poster. Qasa-/Airbnb-importen genererar
// inclusions från ett känt svenskt ordförråd (se src/lib/crm/import/traits.ts), så vi kan
// översätta dem direkt – utan AI-anrop – på prospekt-/boenden-sidan. Okända (manuella)
// poster faller tillbaka till källtexten. AI-översättningen (inclusionsEn/Pl) har företräde
// per post när den finns; detta är fallbacken så ett importerat objekt aldrig visar svensk
// text på en engelsk/polsk sida bara för att ingen klickat "Översätt".
const DICT: Record<string, { en: string; pl: string }> = {
  "möblerat": { en: "Furnished", pl: "Umeblowane" },
  "kylskåp": { en: "Refrigerator", pl: "Lodówka" },
  "frys": { en: "Freezer", pl: "Zamrażarka" },
  "ugn": { en: "Oven", pl: "Piekarnik" },
  "spis": { en: "Stove", pl: "Kuchenka" },
  "kokvrå": { en: "Kitchenette", pl: "Aneks kuchenny" },
  "mikrovågsugn": { en: "Microwave", pl: "Kuchenka mikrofalowa" },
  "diskmaskin": { en: "Dishwasher", pl: "Zmywarka" },
  "tvättmaskin": { en: "Washing machine", pl: "Pralka" },
  "torktumlare": { en: "Tumble dryer", pl: "Suszarka bębnowa" },
  "bredband": { en: "Broadband", pl: "Internet szerokopasmowy" },
  "wifi": { en: "Wi-Fi", pl: "Wi-Fi" },
  "tv": { en: "TV", pl: "Telewizor" },
  "uteplats": { en: "Patio", pl: "Patio" },
  "balkong": { en: "Balcony", pl: "Balkon" },
  "balkong/uteplats": { en: "Balcony / patio", pl: "Balkon / patio" },
  "badkar": { en: "Bathtub", pl: "Wanna" },
  "dusch": { en: "Shower", pl: "Prysznic" },
  "bastu": { en: "Sauna", pl: "Sauna" },
  "braskamin": { en: "Fireplace", pl: "Kominek" },
  "förråd": { en: "Storage", pl: "Schowek" },
  "cykelrum": { en: "Bike room", pl: "Rowerownia" },
  "hiss": { en: "Elevator", pl: "Winda" },
  "parkering": { en: "Parking", pl: "Parking" },
  "garage": { en: "Garage", pl: "Garaż" },
  "återvinningsrum": { en: "Recycling room", pl: "Pomieszczenie do recyklingu" },
  // Vanliga manuella / Airbnb-poster
  "kök": { en: "Kitchen", pl: "Kuchnia" },
  "eget kök": { en: "Private kitchen", pl: "Własna kuchnia" },
  "sängkläder": { en: "Bed linen", pl: "Pościel" },
  "handdukar": { en: "Towels", pl: "Ręczniki" },
  "sängkläder och handdukar": { en: "Bed linen and towels", pl: "Pościel i ręczniki" },
  "värme": { en: "Heating", pl: "Ogrzewanie" },
  "centralvärme": { en: "Central heating", pl: "Ogrzewanie centralne" },
  "varmvatten": { en: "Hot water", pl: "Ciepła woda" },
  "värme och varmvatten": { en: "Heating and hot water", pl: "Ogrzewanie i ciepła woda" },
};

// Översätt en enskild "vad ingår"-post till valt språk. sv → returnera oförändrat.
export function translateInclusion(sv: string, lang: Lang): string {
  if (lang === "sv") return sv;
  const hit = DICT[sv.trim().toLowerCase()];
  if (!hit) return sv; // okänd/manuell post → behåll källtexten
  return lang === "en" ? hit.en : hit.pl;
}
