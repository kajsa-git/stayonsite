import { eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "./db";
import { normalizePropertyWriteBody } from "./owners";
import { normalizePhoneForStorage } from "./phone-links";
import { PROPERTY_INTAKE_MARKER } from "./property-intake-marker";
import { indexOwner, indexProperty } from "./search-index";
import { ownerOutreach, owners, properties, type Owner, type Property, type PropertyInsert } from "./schema";
export { PROPERTY_INTAKE_MARKER };

const phoneRegex = /^[+\d\s()-]{6,50}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const stringOrNull = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .nullable()
  .transform((value) => value || null);

const shortStringOrNull = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

const nullableNumber = z
  .number()
  .finite()
  .min(0)
  .max(1_000_000)
  .optional()
  .nullable()
  .transform((value) => (value == null ? null : value));

const nullableInt = z
  .number()
  .int()
  .min(0)
  .max(500)
  .optional()
  .nullable()
  .transform((value) => (value == null ? null : value));

const requiredInt = z.number().int().min(0).max(500);

const optionalDate = z
  .string()
  .trim()
  .regex(dateRegex)
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((value) => value || null);

export const propertyIntakeSchema = z
  .object({
    ownerType: z.enum(["privatperson", "foretag"]).default("privatperson"),
    ownerArrangement: z.enum(["direkt", "formedlare"]).default("direkt"),
    ownerName: z.string().trim().min(2).max(160),
    ownerOrgNr: shortStringOrNull(60),
    ownerContactPerson: shortStringOrNull(160),
    ownerPhone: z.string().trim().regex(phoneRegex).max(50),
    ownerEmail: z
      .string()
      .trim()
      .email()
      .max(200)
      .optional()
      .nullable()
      .or(z.literal(""))
      .transform((value) => value || null),
    address: z.string().trim().min(2).max(220),
    postalCode: z.string().trim().min(3).max(20),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(80).default("Sverige"),
    squareMeters: nullableNumber,
    bedrooms: requiredInt,
    beds: requiredInt,
    bathrooms: nullableInt,
    washingMachines: nullableInt,
    dryers: nullableInt,
    parkingSpaces: nullableInt,
    parkingType: z.array(z.string().trim().max(60)).max(12).optional().nullable(),
    furnished: z.boolean().default(false),
    kitchen: z.boolean().default(false),
    dishwasher: z.boolean().default(false),
    garage: z.boolean().default(false),
    broadband: z.boolean().default(false),
    egetBoende: z.boolean().default(false),
    equipmentNote: stringOrNull,
    skick: stringOrNull,
    desiredRent: nullableNumber,
    moveInFrom: optionalDate,
    availableTo: optionalDate,
    availableUntilFurtherNotice: z.boolean().default(false),
    availabilityNote: stringOrNull,
    allIncluded: z.boolean().default(false),
    linensIncluded: z.boolean().default(false),
    heatWaterIncluded: z.boolean().default(false),
    excludedNote: stringOrNull,
    specialNote: stringOrNull,
    page: z.string().trim().max(200).optional().nullable(),
    source: z.string().trim().max(100).optional().nullable(),
    startedAt: z.number().int().positive().optional().nullable(),
    website: z.string().trim().max(200).optional().nullable(),
    utmParams: z.record(z.string(), z.string()).optional().nullable(),
    tracking: z.object({
      consent: z.literal(true),
      eventId: z.string().min(8).max(100),
      eventSourceUrl: z.string().url().max(1000),
      fbc: z.string().max(255).optional(),
      fbp: z.string().max(255).optional(),
    }).optional(),
    consent: z.literal(true),
  })
  .superRefine((input, ctx) => {
    if (input.ownerType === "privatperson" && input.ownerArrangement === "formedlare") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownerArrangement"],
        message: "Privatperson kan inte vara förmedlare.",
      });
    }
  });

export type PropertyIntakeInput = z.infer<typeof propertyIntakeSchema>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value: number | null) {
  return value == null ? null : `${value.toLocaleString("sv-SE")} kr/mån`;
}

function utmLine(input: Pick<PropertyIntakeInput, "utmParams">) {
  if (!input.utmParams || Object.keys(input.utmParams).length === 0) return null;
  return Object.entries(input.utmParams).map(([key, value]) => `${key}=${value}`).join(", ");
}

function line(label: string, value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return `${label}: ${value ? "Ja" : "Nej"}`;
  return `${label}: ${value}`;
}

export function propertyIntakeInclusions(input: PropertyIntakeInput): string[] {
  return [
    input.allIncluded ? "Exakt allt ingår" : null,
    input.linensIncluded ? "Sängkläder och handduk" : null,
    input.heatWaterIncluded ? "Värme och varmvatten" : null,
    input.broadband ? "Bredband" : null,
    (input.parkingType && input.parkingType.length) || input.parkingSpaces ? "Parkering" : null,
  ].filter(Boolean) as string[];
}

export function buildPropertyIntakeNotes(input: PropertyIntakeInput) {
  const availability = [
    line("Tillgänglig från", input.moveInFrom),
    input.availableUntilFurtherNotice ? "Tillgänglig till: tills vidare/osäkert" : line("Tillgänglig till", input.availableTo),
    line("Tillgänglighetsnotis", input.availabilityNote),
  ].filter(Boolean);

  const included = [
    line("Allt ingår", input.allIncluded),
    line("Sängkläder + handduk", input.linensIncluded),
    line("Värme + varmvatten", input.heatWaterIncluded),
    line("Om något inte ingår", input.excludedNote),
  ].filter(Boolean);

  return [
    PROPERTY_INTAKE_MARKER,
    "Inkommen från publik bostadsregistrering.",
    line("Sida", input.page),
    line("Källa", input.source),
    line("UTM", utmLine(input)),
    line("Önskad hyra", money(input.desiredRent)),
    availability.length ? ["Tillgänglighet", ...availability.map((item) => `- ${item}`)].join("\n") : null,
    included.length ? ["Vad ingår i hyran", ...included.map((item) => `- ${item}`)].join("\n") : null,
    line("Parkering", input.parkingType && input.parkingType.length ? input.parkingType.join(", ") : null),
    line("Övrigt om utrustning", input.equipmentNote),
    line("Något särskilt", input.specialNote),
  ].filter(Boolean).join("\n\n");
}

export function propertyIntakeToPropertyBody(input: PropertyIntakeInput): Record<string, unknown> {
  return {
    ownerType: input.ownerType,
    ownerArrangement: input.ownerArrangement,
    ownerName: input.ownerName,
    ownerOrgNr: input.ownerOrgNr,
    ownerContactPerson: input.ownerContactPerson,
    ownerPhone: input.ownerPhone,
    ownerEmail: input.ownerEmail,
    address: input.address,
    postalCode: input.postalCode,
    city: input.city,
    country: input.country || "Sverige",
    squareMeters: input.squareMeters,
    bedrooms: input.bedrooms,
    beds: input.beds,
    bathrooms: input.bathrooms,
    washingMachines: input.washingMachines,
    dryers: input.dryers,
    parkingSpaces: input.parkingSpaces,
    furnished: input.furnished,
    kitchen: input.kitchen,
    dishwasher: input.dishwasher,
    garage: input.garage,
    broadband: input.broadband,
    egetBoende: input.egetBoende,
    skick: input.skick,
    rentIn: input.desiredRent,
    moveInFrom: input.moveInFrom,
    availableTo: input.availableUntilFurtherNotice ? null : input.availableTo,
    allIncluded: input.allIncluded,
    excludedNote: input.excludedNote,
    linensIncluded: input.linensIncluded,
    heatWaterIncluded: input.heatWaterIncluded,
    specialNote: input.specialNote,
    inclusions: propertyIntakeInclusions(input),
    notes: buildPropertyIntakeNotes(input),
    status: "off_market",
    published: false,
    prospektPublished: false,
  };
}

async function findOwnerByContact(email: string | null, phone: string | null): Promise<Owner | null> {
  const conditions = [email ? eq(owners.email, email) : null, phone ? eq(owners.phone, phone) : null].filter(Boolean);
  if (conditions.length === 0) return null;
  const [owner] = await db.select().from(owners).where(or(...conditions)).limit(1);
  return owner ?? null;
}

function appendNote(existing: string | null, note: string) {
  if (!existing) return note;
  if (existing.includes(note)) return existing;
  return `${existing}\n\n${note}`;
}

async function markOwnerForFollowUp(ownerId: string, input: PropertyIntakeInput) {
  const [owner] = await db.select().from(owners).where(eq(owners.id, ownerId));
  if (!owner) return;

  await db
    .update(owners)
    .set({
      ownerType: input.ownerType,
      ownerArrangement: input.ownerArrangement,
      orgNr: input.ownerOrgNr ?? owner.orgNr,
      contactPerson: input.ownerContactPerson ?? owner.contactPerson,
      phone: input.ownerPhone || owner.phone,
      email: input.ownerEmail ?? owner.email,
      followUpDate: today(),
      followUpReason: "Nytt bostadsintag från webb",
      notes: appendNote(owner.notes, buildPropertyIntakeNotes(input)),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(owners.id, ownerId));
}

export async function createPropertyIntake(
  rawInput: PropertyIntakeInput,
): Promise<{ property: Property; owner: Owner | null }> {
  // Normalisera telefonen till E.164 innan både uthyrar-matchning och skrivning —
  // annars missar findOwnerByContact befintliga uthyrare vars nummer redan är normaliserade.
  const input: PropertyIntakeInput = {
    ...rawInput,
    ownerPhone: normalizePhoneForStorage(rawInput.ownerPhone) ?? rawInput.ownerPhone,
  };
  const existingOwner = await findOwnerByContact(input.ownerEmail, input.ownerPhone);
  const writeBody = propertyIntakeToPropertyBody(input);
  if (existingOwner) {
    writeBody.ownerId = existingOwner.id;
  }

  const values = await normalizePropertyWriteBody(writeBody);
  const [property] = await db
    .insert(properties)
    .values({ id: nanoid(), ...(values as Partial<PropertyInsert>) })
    .returning();

  if (property.ownerId) {
    await markOwnerForFollowUp(property.ownerId, input);
  }

  await db.insert(ownerOutreach).values({
    id: nanoid(),
    propertyId: property.id,
    ownerId: property.ownerId,
    status: "ej_kontaktad",
    startedAt: new Date().toISOString(),
    nextFollowUpDate: today(),
    nextFollowUpReason: "Nytt bostadsintag: granska uppgifter och bilder",
  });

  const [owner] = property.ownerId ? await db.select().from(owners).where(eq(owners.id, property.ownerId)) : [null];
  await Promise.all([
    indexProperty(property.id),
    owner ? indexOwner(owner.id) : Promise.resolve(),
  ]);

  return { property, owner: owner ?? null };
}

export async function appendPropertyIntakeImageSummary(propertyId: string, created: number, failed: number) {
  if (!created && !failed) return;
  const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (!property) return;
  const summary = `Bilder från bostadsintag: ${created} uppladdade${failed ? `, ${failed} misslyckades` : ""}.`;
  await db
    .update(properties)
    .set({ notes: appendNote(property.notes, summary), updatedAt: new Date().toISOString() })
    .where(eq(properties.id, propertyId));
  await indexProperty(propertyId);
}
