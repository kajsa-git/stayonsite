import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { isAcceptanceValid, UTHYRNINGSUPPDRAG } from "./avtal";
import { db } from "./db";
import { agreementAcceptances, shareLinks, type AgreementAcceptance } from "./schema";

export interface MediationScope {
  matchId: string;
  requestId: string;
  propertyId: string;
  ownerId: string | null;
}

// Only an approval made through this match's landlord link can release a new
// offer. A prior owner-wide agreement remains evidence, not a new approval.
export async function loadMediationAcceptances(scopes: MediationScope[]): Promise<Map<string, AgreementAcceptance>> {
  if (!scopes.length) return new Map();
  const byMatch = new Map(scopes.map((scope) => [scope.matchId, scope]));
  const rows = await db.select({ matchId: shareLinks.matchId, linkOwnerId: shareLinks.ownerId, linkRequestId: shareLinks.requestId, acceptance: agreementAcceptances })
    .from(agreementAcceptances)
    .innerJoin(shareLinks, eq(agreementAcceptances.shareLinkId, shareLinks.id))
    .where(and(
      inArray(shareLinks.matchId, scopes.map((scope) => scope.matchId)),
      eq(shareLinks.audience, "landlord"),
      eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type),
      eq(agreementAcceptances.version, UTHYRNINGSUPPDRAG.version),
    ))
    .orderBy(desc(agreementAcceptances.acceptedAt));

  const result = new Map<string, AgreementAcceptance>();
  for (const { matchId, linkOwnerId, linkRequestId, acceptance } of rows) {
    const scope = matchId ? byMatch.get(matchId) : undefined;
    if (!scope || !scope.ownerId || result.has(scope.matchId)) continue;
    if (linkOwnerId !== scope.ownerId || linkRequestId !== scope.requestId ||
        acceptance.ownerId !== scope.ownerId || acceptance.propertyId !== scope.propertyId ||
        acceptance.requestId !== scope.requestId || !isAcceptanceValid(acceptance, UTHYRNINGSUPPDRAG)) continue;
    result.set(scope.matchId, acceptance);
  }
  return result;
}

export async function loadMediationAcceptance(scope: MediationScope): Promise<AgreementAcceptance | null> {
  return (await loadMediationAcceptances([scope])).get(scope.matchId) ?? null;
}

// Already-sent deals may keep using a previous acceptance made through the
// same link. This is historical continuity, never approval for a new offer.
export async function loadHistoricalMediationAcceptance(scope: MediationScope, shareLinkId?: string): Promise<AgreementAcceptance | null> {
  if (!scope.ownerId) return null;
  const rows = await db.select({ acceptance: agreementAcceptances }).from(agreementAcceptances)
    .innerJoin(shareLinks, eq(agreementAcceptances.shareLinkId, shareLinks.id))
    .where(and(
      eq(shareLinks.audience, "landlord"), eq(shareLinks.matchId, scope.matchId),
      eq(shareLinks.requestId, scope.requestId), eq(agreementAcceptances.ownerId, scope.ownerId),
      eq(agreementAcceptances.requestId, scope.requestId), eq(agreementAcceptances.propertyId, scope.propertyId),
      eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type),
      ne(agreementAcceptances.version, UTHYRNINGSUPPDRAG.version),
      ...(shareLinkId ? [eq(agreementAcceptances.shareLinkId, shareLinkId)] : []),
    )).orderBy(desc(agreementAcceptances.acceptedAt));
  return rows.find(({ acceptance }) => isAcceptanceValid(acceptance, UTHYRNINGSUPPDRAG))?.acceptance ?? null;
}
