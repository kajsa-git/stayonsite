// Auto-förslag: när en ny förfrågan skapas poängsätts alla tillgängliga objekt
// (samma scoring som MatchingView använder) och topp-N läggs som interna
// "suggested"-matchningar. Skapar ALDRIG utskick — bara rader i crm_matches som
// syns i Min dag ("N förslag redo") och i matchningsvyn, där Kajsa väljer vad
// som faktiskt skickas.
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { availableForRequest, matchScore } from "./matching";
import { matches, properties, requests } from "./schema";

const MIN_SCORE = 40; // under det är förslaget mest brus (fel ort/för få bäddar)
const MAX_SUGGESTIONS = 3;

export async function autoSuggestMatches(requestId: string): Promise<number> {
  const [request] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!request) return 0;
  // Bara öppna förfrågningar får förslag — won/lost/invoiced lämnas orörda.
  if (request.status !== "incoming" && request.status !== "matching") return 0;

  const [props, existing] = await Promise.all([
    db.select().from(properties).where(eq(properties.status, "available")),
    db.select({ propertyId: matches.propertyId }).from(matches).where(eq(matches.requestId, requestId)),
  ]);
  const already = new Set(existing.map((e) => e.propertyId));

  const top = props
    .filter((p) => !already.has(p.id))
    .filter((p) => availableForRequest(request, p))
    .map((p) => ({ propertyId: p.id, score: matchScore(request, p) }))
    .filter((x) => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS);
  if (top.length === 0) return 0;

  await db.insert(matches).values(
    top.map(({ propertyId, score }) => ({
      id: nanoid(),
      requestId,
      propertyId,
      status: "suggested",
      matchScore: score,
      notes: "Auto-förslag",
    })),
  );
  return top.length;
}

// Backfill-hjälp: ge alla öppna förfrågningar utan förslag en första omgång.
export async function autoSuggestForOpenRequests(): Promise<{ requestId: string; created: number }[]> {
  const open = await db
    .select({ id: requests.id })
    .from(requests)
    .where(inArray(requests.status, ["incoming", "matching"]));
  const out: { requestId: string; created: number }[] = [];
  for (const r of open) {
    const created = await autoSuggestMatches(r.id);
    if (created > 0) out.push({ requestId: r.id, created });
  }
  return out;
}
