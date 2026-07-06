import { eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { owners, properties, type Owner, type Property } from "./schema";
import { normalizePhoneForStorage } from "./phone-links";
import { publicDisplayName, slugify } from "./slug";

// Säkerställ en unik URL-slug i crm_properties. Lägger -2, -3… vid krock.
// excludeId = objektets eget id (så en re-save inte krockar med sig själv).
export async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "boende";
  let candidate = root;
  let n = 1;
  // I praktiken bara ett fåtal varv — slug-krockar är sällsynta.
  for (;;) {
    const rows = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, candidate));
    if (!rows.some((r) => r.id !== excludeId)) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

// Owner-identitet är härledd från owners-tabellen (objektet lagrar bara ownerId).
// Läsvägar JOIN:ar owners och hydrerar dessa fält via mergeOwnerIntoProperty.
export type OwnerView = {
  ownerType: string | null;
  ownerArrangement: string | null;
  ownerName: string | null;
  ownerOrgNr: string | null;
  ownerContactPerson: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  rating: number | null;
};

export type PropertyWithOwner = Property & OwnerView;

// Kanonisk uppsättning objekt-statusar (speglar UI och sökindex). Valideras vid skrivning.
export const VALID_PROPERTY_STATUSES = ["available", "reserved", "rented", "off_market"] as const;

export function isValidPropertyStatus(s: unknown): boolean {
  return typeof s === "string" && (VALID_PROPERTY_STATUSES as readonly string[]).includes(s);
}

const EMPTY_OWNER_VIEW: OwnerView = {
  ownerType: null,
  ownerArrangement: null,
  ownerName: null,
  ownerOrgNr: null,
  ownerContactPerson: null,
  ownerPhone: null,
  ownerEmail: null,
  rating: null,
};

export function ownerView(owner: Owner | null | undefined): OwnerView {
  if (!owner) return { ...EMPTY_OWNER_VIEW };
  return {
    ownerType: owner.ownerType,
    ownerArrangement: owner.ownerArrangement,
    ownerName: owner.name,
    ownerOrgNr: owner.orgNr,
    ownerContactPerson: owner.contactPerson,
    ownerPhone: owner.phone,
    ownerEmail: owner.email,
    rating: owner.rating,
  };
}

export type PropertyOwnerRow = { property: Property; owner: Owner | null };

export function mergeOwnerIntoProperty({ property, owner }: PropertyOwnerRow): PropertyWithOwner {
  return { ...property, ...ownerView(owner) };
}

// Owner-identitetsfält som kan komma i en property-body men som bor i owners-tabellen.
const OWNER_IDENTITY_KEYS = [
  "ownerType",
  "ownerArrangement",
  "ownerName",
  "ownerOrgNr",
  "ownerContactPerson",
  "ownerPhone",
  "ownerEmail",
  "rating",
] as const;

function hasOwnerPayload(body: Record<string, unknown>) {
  return OWNER_IDENTITY_KEYS.some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

// Behåll endast giltiga property-kolumner (ownerId + övrigt) för objekt-skrivningen.
function stripForPropertyWrite(body: Record<string, unknown>): Partial<Property> {
  const copy = { ...body };
  delete copy.createOwner;
  for (const key of OWNER_IDENTITY_KEYS) delete copy[key];
  return copy as Partial<Property>;
}

// Tomt/null land tolkas som Sverige (default för objekt idag).
export function isSwedishCountry(c: string | null | undefined): boolean {
  return !c || /^(sverige|sweden|se)$/i.test(c.trim());
}

// Svenska postnummer → "XXX XX". Lämnar orört om det inte är exakt 5 siffror.
export function formatSwedishPostal(v: string | null | undefined): string | null | undefined {
  if (typeof v !== "string") return v;
  const digits = v.replace(/\s+/g, "");
  return /^\d{5}$/.test(digits) ? `${digits.slice(0, 3)} ${digits.slice(3)}` : v;
}

type OwnerValues = {
  ownerType: string | null;
  ownerArrangement: string | null;
  name: string;
  orgNr: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
};

function ownerValuesFromPropertyBody(body: Record<string, unknown>): OwnerValues {
  const str = (v: unknown) => ((v as string | null | undefined) ?? "").trim();
  return {
    ownerType: (body.ownerType as string | null | undefined) ?? null,
    ownerArrangement: (body.ownerArrangement as string | null | undefined) ?? null,
    name: str(body.ownerName) || "(uthyrare utan namn)",
    orgNr: str(body.ownerOrgNr) || null,
    contactPerson: str(body.ownerContactPerson) || null,
    phone: normalizePhoneForStorage(str(body.ownerPhone)),
    email: str(body.ownerEmail) || null,
    rating: typeof body.rating === "number" ? body.rating : body.rating == null ? null : Number(body.rating),
  };
}

function hasUsefulOwnerData(v: OwnerValues) {
  return [v.name, v.orgNr, v.phone, v.email].some((value) => value && value !== "(uthyrare utan namn)");
}

function digits(s: string | null | undefined) {
  return (s ?? "").replace(/\D/g, "");
}

// Matcha-först: hitta befintlig uthyrare på normaliserat namn (+ telefon om angiven).
async function findMatchingOwner(v: OwnerValues): Promise<Owner | null> {
  const norm = v.name.trim().toLowerCase();
  if (!norm || norm === "(uthyrare utan namn)") return null;
  const rows = await db.select().from(owners).where(sql`lower(trim(${owners.name})) = ${norm}`);
  if (rows.length === 0) return null;
  const phone = digits(v.phone);
  if (phone) {
    const byPhone = rows.find((o) => digits(o.phone) === phone);
    if (byPhone) return byPhone;
  }
  return rows[0];
}

async function writeThroughOwner(ownerId: string, values: OwnerValues) {
  await db
    .update(owners)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(owners.id, ownerId));
}

// Normaliserar en property-write så att uthyrar-identiteten alltid landar i owners-tabellen.
// Returnerar endast giltiga property-kolumner (ownerId-länk + övrigt).
export async function normalizePropertyWriteBody(
  body: Record<string, unknown>,
  existing?: Property,
): Promise<Partial<Property>> {
  const next = stripForPropertyWrite(body);
  // Postnummer-format är en Sverige-regel — bara om objektets land är (eller defaultar till) Sverige.
  if (Object.prototype.hasOwnProperty.call(next, "postalCode") && isSwedishCountry(next.country ?? existing?.country)) {
    next.postalCode = formatSwedishPostal(next.postalCode);
  }

  // Publik URL-slug. publicName lämnas som manuell override (rubriken beräknas annars deterministiskt);
  // slug persisteras och är stabil när den väl satts. Genereras när en ort finns, eller sätts explicit.
  // Mutationen sker på `next` här uppe så att den följer med i alla owner-grenars `{ ...next }`-returer nedan.
  const has = (k: string) => Object.prototype.hasOwnProperty.call(next, k);
  const effCity = (has("city") ? (next.city as string | null) : existing?.city) ?? null;
  const effBedrooms = (has("bedrooms") ? (next.bedrooms as number | null) : existing?.bedrooms) ?? null;
  const effBeds = (has("beds") ? (next.beds as number | null) : existing?.beds) ?? null;
  const effName = (has("publicName") ? (next.publicName as string | null) : existing?.publicName) ?? null;
  const providedSlug = has("slug") ? ((next.slug as string | null) ?? "").trim() : "";
  if (providedSlug) {
    next.slug = await ensureUniqueSlug(providedSlug, existing?.id);
  } else if (!existing?.slug && effCity) {
    next.slug = await ensureUniqueSlug(
      publicDisplayName(effName, { city: effCity, bedrooms: effBedrooms, beds: effBeds }),
      existing?.id,
    );
  } else if (has("slug")) {
    // Tomt slug-fält skickat men en finns redan (eller ort saknas) → rör inte befintlig slug.
    delete (next as { slug?: unknown }).slug;
  }

  const ownerIdProvided = Object.prototype.hasOwnProperty.call(body, "ownerId");
  const payload = hasOwnerPayload(body);

  // Uttrycklig länk till en specifik uthyrare.
  if (ownerIdProvided && body.ownerId) {
    const targetId = String(body.ownerId);
    // Redigerar man fälten på den redan länkade uthyraren → skriv igenom till owners.
    if (payload && existing?.ownerId === targetId) {
      await writeThroughOwner(targetId, ownerValuesFromPropertyBody(body));
    }
    return { ...next, ownerId: targetId };
  }

  // Ingen länk i denna write.
  if (!payload) {
    return ownerIdProvided ? { ...next, ownerId: null } : next;
  }

  const values = ownerValuesFromPropertyBody(body);

  // Fortfarande länkad (ownerId utelämnat men objektet har en länk) → skriv igenom.
  if (!ownerIdProvided && existing?.ownerId) {
    await writeThroughOwner(existing.ownerId, values);
    return { ...next, ownerId: existing.ownerId };
  }

  // Olänkad + uthyrardata → matcha befintlig, annars skapa ny.
  if (!hasUsefulOwnerData(values)) return { ...next, ownerId: null };
  const match = await findMatchingOwner(values);
  if (match) return { ...next, ownerId: match.id };
  const [created] = await db.insert(owners).values({ id: nanoid(), ...values }).returning();
  return { ...next, ownerId: created.id };
}

export async function reindexLinkedProperties(
  ownerId: string,
  indexProperty: (propertyId: string) => Promise<void>,
) {
  const linked = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, ownerId));
  await Promise.all(linked.map((property) => indexProperty(property.id)));
}

export async function linkedPropertyIds(ownerIds: string[]) {
  if (ownerIds.length === 0) return [];
  return db.select({ id: properties.id }).from(properties).where(inArray(properties.ownerId, ownerIds));
}
