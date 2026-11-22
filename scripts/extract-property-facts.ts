// Fyller tomma bostadsfält med uppgifter som redan står i CRM:et: bostadens
// anteckningar och beskrivningar samt uthyrarens egna SMS och mejl. Bara uttryck
// som uttryckligen står där ("4 bäddar", "ingen tvättmaskin") används, med citat. Befintliga värden
// skrivs aldrig över och varje ändring loggas som en anteckning på bostaden.
//   pnpm dlx tsx scripts/extract-property-facts.ts [--limit N]          (bara visa)
//   pnpm dlx tsx scripts/extract-property-facts.ts --apply [--limit N]  (spara)
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const { desc, eq, inArray } = await import("drizzle-orm");
const { nanoid } = await import("nanoid");
const { db } = await import("../src/lib/crm/db");
const { emails, inboxMessages, owners, properties, propertyNotes } = await import("../src/lib/crm/schema");

const apply = process.argv.includes("--apply");
const limitArg = process.argv.indexOf("--limit");
const limit = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;

type Spec = { label: string; kind: "int" | "bool" | "enum" | "text"; min?: number; max?: number; values?: string[] };
const FIELDS: Record<string, Spec> = {
  propertyType: { label: "bostadstyp", kind: "enum", values: ["hus", "lagenhet", "annat"] },
  bedrooms: { label: "sovrum", kind: "int", min: 1, max: 20 },
  beds: { label: "separata bäddar", kind: "int", min: 1, max: 40 },
  bathrooms: { label: "badrum", kind: "int", min: 1, max: 10 },
  squareMeters: { label: "yta (m²)", kind: "int", min: 15, max: 1000 },
  parkingSpaces: { label: "parkeringsplatser", kind: "int", min: 0, max: 50 },
  washingMachines: { label: "tvättmaskin", kind: "int", min: 0, max: 5 },
  dryers: { label: "torktumlare", kind: "int", min: 0, max: 5 },
  sharedLaundry: { label: "gemensam tvättstuga", kind: "bool" },
  dishwasher: { label: "diskmaskin", kind: "bool" },
  broadband: { label: "wifi/bredband", kind: "bool" },
  furnished: { label: "möblerat", kind: "bool" },
  smokeAlarm: { label: "brandvarnare", kind: "bool" },
  fireExtinguisher: { label: "brandsläckare", kind: "bool" },
  burglarAlarm: { label: "larm", kind: "bool" },
  fireplace: { label: "eldstad/kamin", kind: "bool" },
};

const all = await db.select().from(properties);
const incomplete = all.filter((p) => Object.keys(FIELDS).some((key) => p[key as keyof typeof p] == null)).slice(0, limit);
const ownerIds = [...new Set(incomplete.map((p) => p.ownerId).filter(Boolean))] as string[];
const ownerRows = ownerIds.length ? await db.select().from(owners).where(inArray(owners.id, ownerIds)) : [];
const homesPerOwner = new Map<string, number>();
for (const p of all) if (p.ownerId) homesPerOwner.set(p.ownerId, (homesPerOwner.get(p.ownerId) ?? 0) + 1);

async function corpus(p: (typeof all)[number]) {
  const parts: string[] = [];
  const add = (title: string, text: string | null | undefined) => { if (text?.trim()) parts.push(`## ${title}\n${text.trim()}`); };
  add("Bostadens anteckning", p.notes);
  add("Beskrivning", p.publicDescription);
  add("Skick", p.skick);
  add("Något särskilt", p.specialNote);
  add("Vad som inte ingår", p.excludedNote);
  add("Tillgänglighet", p.availability);
  for (const n of await db.select().from(propertyNotes).where(eq(propertyNotes.propertyId, p.id)).orderBy(desc(propertyNotes.createdAt)).limit(30)) add(`Anteckning ${n.createdAt?.slice(0, 10)}`, n.content);
  const owner = ownerRows.find((o) => o.id === p.ownerId);
  if (owner) {
    // Uthyrarens meddelanden gäller bara den här bostaden om uthyraren har en enda bostad,
    // annars tas bara meddelanden med som nämner gatunamnet.
    const street = (p.address ?? "").split(/\s+\d/)[0].trim().toLowerCase();
    const relevant = (text: string | null) => (homesPerOwner.get(owner.id) ?? 0) <= 1 || (!!street && (text ?? "").toLowerCase().includes(street));
    if ((homesPerOwner.get(owner.id) ?? 0) <= 1) add("Uthyrarens anteckning", owner.notes);
    const inbox = await db.select().from(inboxMessages).where(eq(inboxMessages.ownerId, owner.id)).orderBy(desc(inboxMessages.sentAt)).limit(60);
      const mails = await db.select().from(emails).where(eq(emails.ownerId, owner.id)).orderBy(desc(emails.sentAt)).limit(20);

  }
  return parts.join("\n\n").slice(0, 15000);
}

const WORD_NUM: Record<string, number> = { en: 1, ett: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10 };
const NUM = "(\\d{1,4}|en|ett|två|tre|fyra|fem|sex|sju|åtta|nio|tio)";
const toNum = (v: string) => WORD_NUM[v.toLowerCase()] ?? Number(v);
const negated = (text: string, index: number) => /(ingen|inga|inget|ej|inte|saknar|saknas|utan)\s+(\S+\s+){0,2}$/i.test(text.slice(Math.max(0, index - 30), index));

function sentenceAt(text: string, index: number) {
  const start = Math.max(text.lastIndexOf("\n", index), text.lastIndexOf(". ", index)) + 1;
  const ends = [text.indexOf("\n", index), text.indexOf(". ", index)].filter((i) => i >= 0);
  return text.slice(start, ends.length ? Math.min(...ends) + 1 : text.length).trim();
}

// Meningar om vad någon söker eller som uttrycker osäkerhet ger inga fakta om bostaden.
const UNCERTAIN = /\b(?:söker|vill ha|behöver|önskar|efterfrågar|(?:inte|ej|o)\s*bekräft\w*|bekräfta\w*|oklar\w*|osäker\w*|ej angiv\w*|rensa\w*|kontroller\w*|kanske|eventuellt|trodde|försöka|bör|korriger\w*|gäller inte|stämmer inte)/i;

async function extract(p: (typeof all)[number], rawText: string) {
  // Ta bort osäkra meningar innan något letas upp.
  const text = rawText.split(/(?<=[.!?])\s+|\n/).filter((sentence) => !UNCERTAIN.test(sentence)).join("\n");
  const found: Record<string, { value: unknown; quote: string }> = {};
  const count = (key: string, pattern: RegExp) => {
    const m = pattern.exec(text);
    if (m && !found[key]) found[key] = { value: toNum(m[1]), quote: sentenceAt(text, m.index) };
  };
  const yes = (key: string, pattern: RegExp, value: unknown = true) => {
    const m = pattern.exec(text);
    if (m && !found[key]) found[key] = { value: negated(text, m.index) ? (typeof value === "number" ? 0 : false) : value, quote: sentenceAt(text, m.index) };
  };
  count("bedrooms", new RegExp(`\\b${NUM}\\s*(?:st\\.?\\s*)?sovrum`, "i"));
  count("beds", new RegExp(`\\b${NUM}\\s*(?:st\\.?\\s*)?(?:separata\\s+)?(?:bäddar|sängplatser|sovplatser|bäddplatser|sängar)\\b`, "i"));
  count("bathrooms", new RegExp(`\\b${NUM}\\s*(?:st\\.?\\s*)?badrum`, "i"));
  count("squareMeters", /\b(\d{2,4})\s*(?:kvm|m²|m2|kvadratmeter)\b/i);
  count("parkingSpaces", new RegExp(`\\b${NUM}\\s*(?:st\\.?\\s*)?(?:parkeringsplatser|p-platser|bilplatser|parkeringar)\\b`, "i"));
  count("parkingSpaces", new RegExp(`parkering\\s+för\\s+${NUM}\\s+bilar`, "i"));
  yes("washingMachines", /tvättmaskin/i, 1);
  yes("dryers", /torktumlare|\btumlare/i, 1);
  yes("dishwasher", /diskmaskin/i);
  yes("broadband", /\bwi-?fi\b|bredband|fiber(?:anslutning)?\b/i);
  yes("fireplace", /braskamin|vedkamin|kakelugn|eldstad|öppen spis/i);
  yes("burglarAlarm", /\binbrottslarm|\blarm(?:et)?\b/i);
  yes("smokeAlarm", /brandvarnare/i);
  yes("fireExtinguisher", /brandsläckare/i);
  if (/gemensam\s+tvättstuga|tvättstuga\s+i\s+(?:källaren|huset|föreningen|området)/i.test(text)) {
    const m = /gemensam\s+tvättstuga|tvättstuga\s+i\s+(?:källaren|huset|föreningen|området)/i.exec(text)!;
    found.sharedLaundry = { value: true, quote: sentenceAt(text, m.index) };
  }
  const apartment = /\w*lägenhet(?:en|er)?\b|\blgh\b/i.exec(text);
  const house = /\b(?:villa|radhus|parhus|friliggande hus|enplanshus)\b/i.exec(text);
  // Den bostadstyp som nämns först beskriver normalt själva bostaden ("Möblerad villa …").
  const first = [apartment && { type: "lagenhet", m: apartment }, house && { type: "hus", m: house }]
    .filter(Boolean).sort((x, y) => x!.m.index - y!.m.index)[0];
  if (first) found.propertyType = { value: first.type, quote: sentenceAt(text, first.m.index) };
  return found;
}

function validate(key: string, value: unknown): unknown {
  const spec = FIELDS[key];
  if (!spec) return undefined;
  if (spec.kind === "bool") return typeof value === "boolean" ? value : undefined;
  if (spec.kind === "enum") return typeof value === "string" && spec.values!.includes(value) ? value : undefined;
  if (spec.kind === "int") {
    const n = typeof value === "number" ? Math.round(value) : Number(String(value).replace(/\s/g, ""));
    return Number.isFinite(n) && n >= spec.min! && n <= spec.max! ? n : undefined;
  }
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 60 ? value.trim() : undefined;
}

console.log(`${incomplete.length} ofullständiga bostäder${apply ? "" : " (provkörning, inget sparas)"}\n`);
let updated = 0;
let fieldsFilled = 0;
const queue = [...incomplete];
async function worker() {
  for (let p = queue.shift(); p; p = queue.shift()) {
    try {
      const text = await corpus(p);
      if (text.length < 40) continue;
      const found = await extract(p, text);
      const patch: Record<string, unknown> = {};
      const log: string[] = [];
      for (const [key, item] of Object.entries(found)) {
        if (p[key as keyof typeof p] != null || !item || !item.quote || !text.includes(item.quote.slice(0, 40))) continue;
        const value = validate(key, item.value);
        if (value === undefined) continue;
        patch[key] = value;
        log.push(`${FIELDS[key].label}: ${typeof value === "boolean" ? (value ? "ja" : "nej") : value} ("${item.quote.slice(0, 120)}")`);
      }
      if (!log.length) continue;
      updated += 1;
      fieldsFilled += log.length;
      console.log(`- ${p.address ?? p.id}${p.city ? `, ${p.city}` : ""}\n    ${log.join("\n    ")}`);
      if (apply) {
        const now = new Date().toISOString();
        await db.update(properties).set({ ...patch, updatedAt: now }).where(eq(properties.id, p.id));
        await db.insert(propertyNotes).values({
          id: nanoid(), propertyId: p.id, channel: "övrigt", source: "autofill", createdAt: now,
          content: `Autofyllt från CRM:ets anteckningar och konversationer:\n${log.join("\n")}\nRätta om något inte stämmer.`,
        });
      }
    } catch (error) {
      console.log(`- ${p.address ?? p.id}: hoppade över (${error instanceof Error ? error.message : "fel"})`);
    }
  }
}
await Promise.all(Array.from({ length: 5 }, () => worker()));
console.log(`\n${updated} bostäder, ${fieldsFilled} fält ${apply ? "ifyllda" : "skulle fyllas i"}.`);
process.exit(0);
