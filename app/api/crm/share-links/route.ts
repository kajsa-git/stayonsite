// Interna endpoints för externa delningslänkar (crm_share_links).
// GET  ?requestId=... → länkar för förfrågan + uppdragsbekräftelsens status
//                        (panelen i MatchingView behöver båda i samma andetag).
// POST { requestId, audience?, matchId? } → återanvänd aktiv länk eller skapa ny.
import { UPPDRAGSBEKRAFTELSE } from "@/lib/crm/avtal";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { ensureShareLink, type ShareAudience } from "@/lib/crm/share-links";
import { agreementAcceptances, shareLinks } from "@/lib/crm/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const links = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.requestId, requestId))
    .orderBy(desc(shareLinks.createdAt));

  const [acceptance] = await db
    .select({
      acceptedName: agreementAcceptances.acceptedName,
      acceptedAt: agreementAcceptances.acceptedAt,
      version: agreementAcceptances.version,
    })
    .from(agreementAcceptances)
    .where(
      and(
        eq(agreementAcceptances.requestId, requestId),
        eq(agreementAcceptances.agreementType, UPPDRAGSBEKRAFTELSE.type),
        eq(agreementAcceptances.version, UPPDRAGSBEKRAFTELSE.version)
      )
    )
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);

  return NextResponse.json({ links, agreement: acceptance ?? null });
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.requestId || typeof body.requestId !== "string") {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }
  const audience: ShareAudience = body.audience === "landlord" ? "landlord" : "tenant";

  const link = await ensureShareLink({
    audience,
    requestId: body.requestId,
    matchId: typeof body.matchId === "string" ? body.matchId : null,
    userId: (session.user as { id?: string } | undefined)?.id ?? null,
  });
  return NextResponse.json(link, { status: 201 });
}
