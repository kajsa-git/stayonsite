// Fyller tomma bostadsfält med uppgifter som redan står i CRM:et: bostadens
// anteckningar och beskrivningar samt uthyrarens egna SMS och mejl. Claude får bara
// plocka ut det som uttryckligen sägs, med ett ordagrant citat som kontrolleras. Befintliga värden
// skrivs aldrig över och varje ändring loggas som en anteckning på bostaden.
//   pnpm dlx tsx scripts/extract-property-facts-ai.ts [--limit N]          (bara visa)
//   pnpm dlx tsx scripts/extract-property-facts-ai.ts --apply [--limit N]  (spara)
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
  rentIn: { label: "uthyrarens månadshyra (kr)", kind: "int", min: 1000, max: 200000 },
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
    for (const m of inbox) if (m.direction !== "out" && relevant(m.body)) add(`SMS från uthyraren ${m.sentAt?.slice(0, 10)}`, m.body);
      const mails = await db.select().from(emails).where(eq(emails.ownerId, owner.id)).orderBy(desc(emails.sentAt)).limit(20);
    for (const m of mails) if (m.direction === "in" && relevant(m.body)) add(`Mejl från uthyraren ${m.sentAt?.slice(0, 10)}`, m.subject ? `${m.subject}\n${m.body}` : m.body);

  }
  return parts.join("\n\n").slice(0, 15000);
}

const MODEL = "claude-sonnet-4-6";
const API_KEY = (process.env.ANTHROPIC_API_KEY ?? "").replace(/\\n/g, "").trim();

async function extract(p: (typeof all)[number], text: string) {
  const missing = Object.entries(FIELDS).filter(([key]) => p[key as keyof typeof p] == null);
  const prompt = `Du läser CRM-text om en bostad som hyrs ut till företag: ${p.address ?? "okänd adress"}, ${p.city ?? ""}.
Plocka ut ENDAST uppgifter som uttryckligen står i texten och som gäller just den här bostaden som den ser ut i dag. Gissa aldrig.
Ignorera vad hyresgäster söker eller önskar, frågor, osäkra eller obekräftade uppgifter och uppgifter som senare rättats.
Svara med ett JSON-objekt där varje nyckel är ett av fälten nedan och värdet är {"value": ..., "quote": "<ordagrant citat ur texten, max 150 tecken>"}. Utelämna fält som inte uttryckligen nämns.
Fält:
${missing.map(([key, spec]) => `- ${key}: ${spec.label}${spec.kind === "bool" ? " (true/false)" : spec.kind === "enum" ? ` (${spec.values!.join("/")})` : spec.kind === "int" ? " (heltal)" : ""}`).join("\n")}
Regler: beds = antal separata sängplatser (dubbelsäng = 1). "plats för 8 personer" räknas INTE som bäddar. washingMachines/dryers = antal i bostaden (0 bara om det uttryckligen saknas). parkingSpaces = antal bilar som kan parkera; "parkering på tomten" utan antal = 1. rentIn = vad uthyraren vill ha eller får per månad för bostaden, aldrig vad hyresgästen betalar StayOnSite. Säkerhet (smokeAlarm m.fl.) bara om det uttryckligen sägs ja eller nej.

TEXT:
${text}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
    });
    if (response.status === 429 || response.status >= 500) { await new Promise((r) => setTimeout(r, 4000 * (attempt + 1))); continue; }
    if (!response.ok) throw new Error(`Claude ${response.status}`);
    const data = await response.json() as { content: { type: string; text?: string }[] };
    const raw = data.content.find((c) => c.type === "text")?.text ?? "{}";
    // Första kompletta JSON-objektet, även om modellen skriver text efteråt.
    const start = raw.indexOf("{");
    let depth = 0, end = -1, inString = false;
    for (let i = start; i >= 0 && i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"' && raw[i - 1] !== "\\") inString = !inString;
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}" && --depth === 0) { end = i; break; }
    }
    return (start >= 0 && end > start ? JSON.parse(raw.slice(start, end + 1)) : {}) as Record<string, { value: unknown; quote?: string }>;
  }
  throw new Error("Claude upptagen");
}

// Citatet måste innehålla ett ord som hör till fältet, annars är värdet en slutsats.
const ANCHOR: Record<string, RegExp> = {
  propertyType: /villa|radhus|parhus|kedjehus|\bhus(et)?\b|enfamiljs|lägenhet|\blgh\b|stuga/i,
  bedrooms: /sovrum/i, beds: /bädd|säng|sovplats/i, bathrooms: /badrum|toalett|\bwc\b|dusch/i,
  squareMeters: /kvm|m²|m2|kvadrat/i, parkingSpaces: /parker|p-plats|bilplats|uppfart|garage|carport/i,
  washingMachines: /tvättmaskin/i, dryers: /tumlare|torktumlare/i, dishwasher: /diskmaskin/i,
  broadband: /wi-?fi|bredband|fiber|internet/i, furnished: /möbl/i,
  smokeAlarm: /brandvarn/i, fireExtinguisher: /brandsläck/i, burglarAlarm: /larm/i,
  fireplace: /kamin|eldstad|öppen spis|kakelugn/i, sharedLaundry: /gemensam\w*\s+tvättstuga|tvättstuga\w*\s+(i|för)\s+(föreningen|huset|källaren|området)/i,
  rentIn: /\d{3,}/,
};

function validate(key: string, value: unknown, quote = ""): unknown {
  const spec = FIELDS[key];
  if (!spec) return undefined;
  if (ANCHOR[key] && !ANCHOR[key].test(quote)) return undefined;
  if (key === "sharedLaundry" && value !== true) return undefined;
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
        const value = validate(key, item.value, item.quote);
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
          content: `Autofyllt (AI) från CRM:ets anteckningar och uthyrarens meddelanden:\n${log.join("\n")}\nRätta om något inte stämmer.`,
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
