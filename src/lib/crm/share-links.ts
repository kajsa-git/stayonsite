// Tokeniserade externa länkar (crm_share_links). Token = nanoid(32) och ÄR
// behörigheten — den som har länken ser sin rollfiltrerade projektion av affären
// (se deal-projection.ts). En aktiv länk per (audience, requestId, matchId);
// rotation = återkalla + skapa ny, aldrig återanvändning av token.
import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { shareLinks, type ShareLink } from "./schema";

export type ShareAudience = "tenant" | "landlord";

// Returnerar befintlig aktiv länk för ärendet, annars skapas en ny.
// Tre länktyper: kundlänk (requestId), affärsknuten uthyrarlänk (requestId+matchId)
// och FRISTÅENDE uthyrarlänk (ownerId — uppdragsavtalet skickas före någon affär).
export async function ensureShareLink(opts: {
  audience: ShareAudience;
  requestId?: string | null;
  matchId?: string | null;
  ownerId?: string | null;
  userId?: string | null;
}): Promise<ShareLink> {
  const ownerId = opts.audience === "tenant" ? null : (opts.ownerId ?? null);
  const matchId = opts.audience === "tenant" || ownerId ? null : (opts.matchId ?? null);
  const requestId = opts.audience === "landlord" && ownerId ? null : (opts.requestId ?? null);
  if (opts.audience === "tenant" && !requestId) throw new Error("ensureShareLink: requestId krävs för kundlänk");
  if (opts.audience === "landlord" && !ownerId && (!requestId || !matchId)) {
    throw new Error("ensureShareLink: ownerId eller requestId + matchId krävs för uthyrarlänk");
  }

  const scope = ownerId
    ? eq(shareLinks.ownerId, ownerId)
    : and(
        eq(shareLinks.requestId, requestId!),
        matchId ? eq(shareLinks.matchId, matchId) : isNull(shareLinks.matchId)
      );
  const [existing] = await db
    .select()
    .from(shareLinks)
    .where(and(eq(shareLinks.audience, opts.audience), scope, isNull(shareLinks.revokedAt)))
    .limit(1);
  if (existing) return existing;

  const [row] = await db
    .insert(shareLinks)
    .values({
      id: nanoid(),
      token: nanoid(32),
      audience: opts.audience,
      requestId,
      matchId,
      ownerId,
      createdBy: opts.userId ?? null,
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
