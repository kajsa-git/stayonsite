// Tokeniserade externa länkar (crm_share_links). Token = nanoid(32) och ÄR
// behörigheten — den som har länken ser sin rollfiltrerade projektion av affären
// (se deal-projection.ts). En aktiv länk per (audience, requestId, matchId);
// rotation = återkalla + skapa ny, aldrig återanvändning av token.
import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { matches, properties, requests, shareLinks, type ShareLink } from "./schema";
import { HUS_UPLOAD_LINK_ACTOR } from "./hus-publication";
import { loadHistoricalMediationAcceptance } from "./mediation-acceptance";

export type ShareAudience = "tenant" | "landlord";

// Returnerar befintlig aktiv länk för ärendet, annars skapas en ny.
// Tre länktyper: kundlänk (requestId), affärsknuten uthyrarlänk (requestId+matchId)
// och fristående uthyrarlänk (ownerId — publiceringsmedgivande).
export async function ensureShareLink(opts: {
  audience: ShareAudience;
  requestId?: string | null;
  matchId?: string | null;
  ownerId?: string | null;
  userId?: string | null;
  intakePurpose?: "hus-upload" | "agreement";
}): Promise<ShareLink> {
  const matchId = opts.audience === "landlord" ? (opts.matchId ?? null) : null;
  let ownerId = opts.audience === "tenant" ? null : (opts.ownerId ?? null);
  const requestId = opts.audience === "landlord" && !matchId && ownerId ? null : (opts.requestId ?? null);
  if (opts.audience === "tenant" && !requestId) throw new Error("ensureShareLink: requestId krävs för kundlänk");
  if (opts.audience === "landlord" && !matchId && !ownerId) {
    throw new Error("ensureShareLink: ownerId eller requestId + matchId krävs för uthyrarlänk");
  }
  if (matchId) {
    const [match] = await db.select({ requestId: matches.requestId, ownerId: properties.ownerId, status: requests.status })
      .from(matches).innerJoin(properties, eq(properties.id, matches.propertyId))
      .innerJoin(requests, eq(requests.id, matches.requestId)).where(eq(matches.id, matchId)).limit(1);
    if (!match || !match.ownerId || match.requestId !== requestId || ["lost", "archived"].includes(match.status) ||
        (ownerId && ownerId !== match.ownerId)) throw new Error("Förfrågan eller uthyraren saknas.");
    ownerId = match.ownerId;
  }

  const scope = ownerId && !matchId
    ? and(eq(shareLinks.ownerId, ownerId), isNull(shareLinks.matchId))
    : and(
        eq(shareLinks.requestId, requestId!),
        matchId ? eq(shareLinks.matchId, matchId) : isNull(shareLinks.matchId)
      );
  const [existing] = await db
    .select()
    .from(shareLinks)
    .where(and(eq(shareLinks.audience, opts.audience), scope, isNull(shareLinks.revokedAt)))
    .limit(1);
  if (existing) {
    // An old unbound token may have been shared with a previous owner. Do not
    // silently attach it to the current owner; issue a fresh capability.
    if (matchId && existing.ownerId !== ownerId) {
      await db.update(shareLinks).set({ revokedAt: new Date().toISOString() }).where(eq(shareLinks.id, existing.id));
    } else {
      // A later, ordinary StayOnSite intake still needs its normal reminder.
      if (opts.intakePurpose === "agreement" && existing.createdBy === HUS_UPLOAD_LINK_ACTOR) {
        const [updated] = await db.update(shareLinks).set({ createdBy: null })
          .where(eq(shareLinks.id, existing.id)).returning();
        return updated;
      }
      return existing;
    }
  }

  const [row] = await db
    .insert(shareLinks)
    .values({
      id: nanoid(),
      token: nanoid(32),
      audience: opts.audience,
      requestId,
      matchId,
      ownerId,
      // The upload-only token must not enter the agreement reminder sweep.
      createdBy: opts.intakePurpose === "hus-upload" ? HUS_UPLOAD_LINK_ACTOR : (opts.userId ?? null),
    })
    .returning();
  return row;
}

// Slår upp en länk via token. Returnerar null för okänd, återkallad eller
// utgången länk — anroparen svarar 404 utan att skilja på fallen (en kapabilitets-
// URL ska inte läcka VARFÖR den slutade fungera). Bumpar visningsstatistik som
// standard — generateMetadata skickar trackView: false så en sidvisning inte
// räknas dubbelt (metadata + sida körs båda per request).
export async function resolveShareLink(
  token: string,
  opts?: { trackView?: boolean }
): Promise<ShareLink | null> {
  if (!token || token.length > 64) return null;
  const [link] = await db.select().from(shareLinks).where(eq(shareLinks.token, token)).limit(1);
  if (!link) return null;
  if (link.revokedAt) return null;
  if (link.expiresAt && link.expiresAt < new Date().toISOString()) return null;

  if (opts?.trackView !== false) {
    try {
      await db
        .update(shareLinks)
        .set({ lastViewedAt: new Date().toISOString(), viewCount: link.viewCount + 1 })
        .where(eq(shareLinks.id, link.id));
    } catch {
      // Statistiken är inte värd att fälla sidvisningen för.
    }
  }
  return link;
}

export async function revokeShareLink(id: string): Promise<void> {
  await db
    .update(shareLinks)
    .set({ revokedAt: new Date().toISOString() })
    .where(and(eq(shareLinks.id, id), isNull(shareLinks.revokedAt)));
}

// A deal link is issued to the owner of the matched property at that time.
export async function isCurrentLandlordMatchLink(link: ShareLink): Promise<boolean> {
  if (link.audience !== "landlord" || !link.matchId || !link.requestId) return false;
  const [match] = await db.select({ requestId: matches.requestId, propertyId: matches.propertyId, ownerId: properties.ownerId, sentAt: matches.sentAt })
    .from(matches).innerJoin(properties, eq(properties.id, matches.propertyId))
    .where(eq(matches.id, link.matchId)).limit(1);
  if (!match || match.requestId !== link.requestId || !match.ownerId) return false;
  if (link.ownerId) return match.ownerId === link.ownerId;
  if (!match.sentAt) return false;
  const historical = await loadHistoricalMediationAcceptance({
    matchId: link.matchId, requestId: match.requestId, propertyId: match.propertyId, ownerId: match.ownerId,
  }, link.id);
  return historical?.shareLinkId === link.id;
}

// Anropas när en förfrågan blir lost/archived eller raderas — inga externa
// länkar ska överleva ett avslutat ärende.
export async function revokeLinksForRequest(requestId: string): Promise<void> {
  await db
    .update(shareLinks)
    .set({ revokedAt: new Date().toISOString() })
    .where(and(eq(shareLinks.requestId, requestId), isNull(shareLinks.revokedAt)));
}

export async function revokeLinksForMatch(matchId: string): Promise<void> {
  await db
    .update(shareLinks)
    .set({ revokedAt: new Date().toISOString() })
    .where(and(eq(shareLinks.matchId, matchId), isNull(shareLinks.revokedAt)));
}
