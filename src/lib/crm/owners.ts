import { eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { owners, properties, type Owner, type Property } from "./schema";

export type PropertyOwnerRow = {
  property: Property;
  owner: Owner | null;
};

const OWNER_PROPERTY_KEYS = [
  "ownerType",
  "ownerArrangement",
  "ownerName",
  "ownerOrgNr",
  "ownerContactPerson",
  "ownerPhone",
  "ownerEmail",
  "ownerFollowUpDate",
  "ownerFollowUpReason",
  "ownerFollowUpNote",
  "rating",
] as const;

export function mergeOwnerIntoProperty({ property, owner }: PropertyOwnerRow): Property {
  if (!owner) return property;
  return {
    ...property,
    ownerType: owner.ownerType ?? property.ownerType,
    ownerArrangement: owner.ownerArrangement ?? property.ownerArrangement,
    ownerName: owner.name ?? property.ownerName,
    ownerOrgNr: owner.orgNr ?? property.ownerOrgNr,
    ownerContactPerson: owner.contactPerson ?? property.ownerContactPerson,
    ownerPhone: owner.phone ?? property.ownerPhone,
    ownerEmail: owner.email ?? property.ownerEmail,
    ownerFollowUpDate: owner.followUpDate ?? property.ownerFollowUpDate,
    ownerFollowUpReason: owner.followUpReason ?? property.ownerFollowUpReason,
    ownerFollowUpNote: owner.followUpNote ?? property.ownerFollowUpNote,
    rating: owner.rating ?? property.rating,
  };
}

export function ownerSnapshot(owner: Owner): Partial<Property> {
  return {
    ownerId: owner.id,
    ownerType: owner.ownerType,
    ownerArrangement: owner.ownerArrangement,
    ownerName: owner.name,
    ownerOrgNr: owner.orgNr,
    ownerContactPerson: owner.contactPerson,
    ownerPhone: owner.phone,
    ownerEmail: owner.email,
    ownerFollowUpDate: owner.followUpDate,
    ownerFollowUpReason: owner.followUpReason,
    ownerFollowUpNote: owner.followUpNote,
    rating: owner.rating,
  };
}

function hasOwnerPayload(body: Record<string, unknown>) {
  return OWNER_PROPERTY_KEYS.some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

function ownerValuesFromPropertyBody(body: Record<string, unknown>) {
  return {
    ownerType: (body.ownerType as string | null | undefined) ?? null,
    ownerArrangement: (body.ownerArrangement as string | null | undefined) ?? null,
    name: ((body.ownerName as string | null | undefined) ?? "").trim() || "(uthyrare utan namn)",
    orgNr: ((body.ownerOrgNr as string | null | undefined) ?? "").trim() || null,
    contactPerson: ((body.ownerContactPerson as string | null | undefined) ?? "").trim() || null,
    phone: ((body.ownerPhone as string | null | undefined) ?? "").trim() || null,
    email: ((body.ownerEmail as string | null | undefined) ?? "").trim() || null,
    followUpDate: (body.ownerFollowUpDate as string | null | undefined) || null,
    followUpReason: ((body.ownerFollowUpReason as string | null | undefined) ?? "").trim() || null,
    followUpNote: ((body.ownerFollowUpNote as string | null | undefined) ?? "").trim() || null,
    rating: typeof body.rating === "number" ? body.rating : body.rating == null ? null : Number(body.rating),
  };
}

function removeInternalKeys(body: Record<string, unknown>) {
  const copy = { ...body };
  delete copy.createOwner;
  return copy;
}

export async function normalizePropertyWriteBody(
  body: Record<string, unknown>,
  existing?: Property,
): Promise<Partial<Property>> {
  const next = removeInternalKeys(body) as Partial<Property>;
  const ownerIdWasProvided = Object.prototype.hasOwnProperty.call(body, "ownerId");

  if (ownerIdWasProvided) {
    if (!body.ownerId) return { ...next, ownerId: null };

    const targetOwnerId = String(body.ownerId);
    if (hasOwnerPayload(body) && existing?.ownerId === targetOwnerId) {
      const values = ownerValuesFromPropertyBody(body);
      const [owner] = await db
        .update(owners)
        .set({ ...values, updatedAt: new Date().toISOString() })
        .where(eq(owners.id, targetOwnerId))
        .returning();
      return owner ? { ...next, ...ownerSnapshot(owner) } : { ...next, ownerId: null };
    }

    const [owner] = await db.select().from(owners).where(eq(owners.id, targetOwnerId));
    if (!owner) return { ...next, ownerId: null };
    return { ...next, ...ownerSnapshot(owner) };
  }

  if (!hasOwnerPayload(body)) return next;

  if (existing?.ownerId) {
    const values = ownerValuesFromPropertyBody(body);
    const [owner] = await db
      .update(owners)
      .set({ ...values, updatedAt: new Date().toISOString() })
      .where(eq(owners.id, existing.ownerId))
      .returning();
    return owner ? { ...next, ...ownerSnapshot(owner) } : next;
  }

  const values = ownerValuesFromPropertyBody(body);
  const hasUsefulOwnerData = [values.name, values.orgNr, values.phone, values.email].some(
    (value) => value && value !== "(uthyrare utan namn)",
  );
  if (!hasUsefulOwnerData) return next;

  const [owner] = await db
    .insert(owners)
    .values({ id: nanoid(), ...values })
    .returning();
  return { ...next, ...ownerSnapshot(owner) };
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
