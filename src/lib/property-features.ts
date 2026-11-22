// Utrustning och regler som husägaren anger vid bostadsregistreringen.
// Säkerhet besvaras alltid med ja/nej (en tom ruta går inte att tolka);
// övrigt är "tryck på det som finns". Ja-svar och valda saker sparas i bostadens
// "Vad ingår"-lista (CRM och prospekt); alla svar sparas i intagsanteckningen.
export const SAFETY_ITEMS = [
  { key: "smokeAlarm", label: "Brandvarnare" },
  { key: "fireExtinguisher", label: "Brandsläckare" },
  { key: "burglarAlarm", label: "Larm" },
  { key: "fireplace", label: "Eldstad/kamin" },
] as const;

export type SafetyKey = (typeof SAFETY_ITEMS)[number]["key"];

export const PROPERTY_FEATURE_GROUPS = [
  { title: "Kök", items: ["Mikrovågsugn", "Frys"] },
  { title: "Fordon", items: ["Laddbox för elbil", "Motorvärmaruttag"] },
  { title: "Komfort", items: ["TV", "Bastu", "Altan/uteplats", "Trädgård", "Förråd"] },
  { title: "Regler", items: ["Husdjur tillåtet", "Rökning tillåten"] },
] as const;

export const PROPERTY_FEATURES: readonly string[] = PROPERTY_FEATURE_GROUPS.flatMap((group) => group.items);

// Rader i intagsanteckningen som agenten behöver för uppföljning och matchning.
// Inte "Önskad hyra": agenten ska inte se eller nämna ägarens hyresnivå.
const FACT_LABELS = ["Bostadstyp", "Tvätt", "Säkerhet", "Utrustning och regler", "Hyresform", "Parkering", "Antal parkeringsplatser"];

export function intakeFactsFromNotes(notes: string | null | undefined): string[] {
  if (!notes) return [];
  return notes.split("\n").map((line) => line.trim()).filter((line) => FACT_LABELS.some((label) => line.startsWith(`${label}:`)));
}
