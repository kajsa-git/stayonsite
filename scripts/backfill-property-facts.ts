// Fyller tomma bostadsfält från bostadens Airbnb- eller Qasa-annons.
// Skriver aldrig över ett befintligt värde. Varje ändring loggas som en anteckning
// på bostaden så att Kajsa kan se och rätta.
//   pnpm dlx tsx scripts/backfill-property-facts.ts          (bara visa)
//   pnpm dlx tsx scripts/backfill-property-facts.ts --apply  (spara)
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const { eq } = await import("drizzle-orm");
const { nanoid } = await import("nanoid");
const { db } = await import("../src/lib/crm/db");
const { properties, propertyNotes } = await import("../src/lib/crm/schema");
const { importListing } = await import("../src/lib/crm/import");

const apply = process.argv.includes("--apply");
const FIELDS = [
  ["bedrooms", "sovrum"], ["beds", "separata bäddar"], ["bathrooms", "badrum"], ["squareMeters", "yta (m²)"],
  ["washingMachines", "tvättmaskin"], ["dryers", "torktumlare"], ["dishwasher", "diskmaskin"], ["broadband", "wifi/bredband"],
  ["furnished", "möblerat"], ["kitchen", "kök"], ["parkingSpaces", "parkeringsplatser"], ["postalCode", "postnummer"], ["city", "ort"],
] as const;

const rows = await db.select().from(properties);
const candidates = rows.filter((p) => (p.links ?? []).some((l) => /airbnb|qasa/i.test(l)) && FIELDS.some(([key]) => p[key] == null));
console.log(`${candidates.length} bostäder med Airbnb/Qasa-länk och tomma fält${apply ? "" : " (provkörning, inget sparas)"}\n`);

let filled = 0;
for (const property of candidates) {
  const link = (property.links ?? []).find((l) => /airbnb|qasa/i.test(l))!;
  try {
    const listing = await importListing(link);
    const patch: Record<string, unknown> = {};
    const described: string[] = [];
    for (const [key, label] of FIELDS) {
      const value = listing[key as keyof typeof listing];
      if (property[key] == null && value != null && value !== "") {
        patch[key] = value;
        described.push(`${label} ${typeof value === "boolean" ? (value ? "ja" : "nej") : value}`);
      }
    }
    if (!described.length) {
      console.log(`- ${property.address ?? property.id}: annonsen gav inget nytt`);
      continue;
    }
    console.log(`- ${property.address ?? property.id}: ${described.join(", ")}`);
    filled += 1;
    if (apply) {
      const now = new Date().toISOString();
      await db.update(properties).set({ ...patch, updatedAt: now }).where(eq(properties.id, property.id));
      await db.insert(propertyNotes).values({
        id: nanoid(), propertyId: property.id, channel: "övrigt", source: "autofill", createdAt: now,
        content: `Autofyllt från ${listing.source === "qasa" ? "Qasa" : "Airbnb"} (${link}): ${described.join(", ")}. Rätta om något inte stämmer.`,
      });
    }
  } catch (error) {
    console.log(`- ${property.address ?? property.id}: kunde inte läsa annonsen (${error instanceof Error ? error.message : "fel"})`);
  }
  await new Promise((resolve) => setTimeout(resolve, 1500)); // var snäll mot annonssajterna
}
console.log(`\n${filled} bostäder ${apply ? "uppdaterade" : "skulle uppdateras"}.`);
process.exit(0);
