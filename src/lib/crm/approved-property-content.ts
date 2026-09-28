import { inArray } from "drizzle-orm";
import { db } from "./db";
import { properties, propertyImages } from "./schema";
import { isCurrentContentApproved } from "./property-content-policy";

// Internal rows are used only to compute the approval fingerprint. Callers
// receive ids, never internal review reports, source text, addresses or rents.
export async function approvedPropertyIds(ids: string[], versions?: Map<string, string | null>): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const [rows, images] = await Promise.all([
    db.select().from(properties).where(inArray(properties.id, ids)),
    db.select({ id: propertyImages.id, key: propertyImages.key, propertyId: propertyImages.propertyId }).from(propertyImages).where(inArray(propertyImages.propertyId, ids)),
  ]);
  return new Set(rows.filter((p) => (!versions || versions.get(p.id) === p.updatedAt) && isCurrentContentApproved(p, images.filter((im) => im.propertyId === p.id))).map((p) => p.id));
}
