import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { loadLandlordDeal, loadLandlordStanding } from "./deal-projection";
import { matches, properties, type ShareLink } from "./schema";
import { resolveShareLink } from "./share-links";

export async function landlordPropertyScope(link: ShareLink, requireAgreement = true) {
  if (link.audience !== "landlord") return null;
  if (link.matchId) {
    const deal = await loadLandlordDeal(link.matchId);
    if (!deal || (requireAgreement && !deal.agreementAccepted)) return null;
    const [match] = await db.select({ propertyId: matches.propertyId, requestId: matches.requestId })
      .from(matches).where(eq(matches.id, link.matchId)).limit(1);
    if (!match || match.requestId !== link.requestId) return null;
    return eq(properties.id, match.propertyId);
  }
  if (!link.ownerId) return null;
  if (requireAgreement) {
    const standing = await loadLandlordStanding(link.ownerId);
    if (!standing?.agreementAccepted) return null;
  }
  return eq(properties.ownerId, link.ownerId);
}

export async function authorizeLandlordProperty(token: string, id: string, requireAgreement = true) {
  const link = await resolveShareLink(token, { trackView: false });
  if (!link) return null;
  const scope = await landlordPropertyScope(link, requireAgreement);
  if (!scope) return null;
  const condition = and(scope, eq(properties.id, id))!;
  const [property] = await db.select({ id: properties.id }).from(properties).where(condition).limit(1);
  return property ? condition : null;
}

export async function loadLandlordProperties(link: ShareLink) {
  const scope = await landlordPropertyScope(link);
  if (!scope) return [];
  // Never serialize full CRM rows to the public client.
  return db.select({
    id: properties.id, address: properties.address, city: properties.city,
    publicDescription: properties.publicDescription, rentIn: properties.rentIn,
    bedrooms: properties.bedrooms, beds: properties.beds, squareMeters: properties.squareMeters,
    availability: properties.availability, moveInFrom: properties.moveInFrom, availableTo: properties.availableTo,
  }).from(properties).where(scope).orderBy(properties.address);
}
