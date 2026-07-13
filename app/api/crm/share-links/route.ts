// Interna endpoints för externa delningslänkar (crm_share_links).
// GET  ?requestId=... → förfrågans länkar + kundens avtalsstatus (företagsscope)
//      ?ownerId=...   → uthyrarens länkar + uthyrningsuppdragets status
//      ?companyId=... → företagets avtalsstatus + tenant-länkar över dess förfrågningar
// POST { requestId?, matchId?, ownerId?, audience? } → återanvänd aktiv länk eller skapa ny.
// Avtalsstatus: signerat av/när/version, giltigt till (12 mån), valid-flagga —
// gammal version eller utgånget ⇒ valid: false och gaten visas igen för parten.
import {
  agreementValidUntil,
  isAcceptanceValid,
  UPPDRAGSBEKRAFTELSE,
  UTHYRNINGSUPPDRAG,
  type AgreementText,
} from "@/lib/crm/avtal";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { ensureShareLink, type ShareAudience } from "@/lib/crm/share-links";
import { agreementAcceptances, requests, shareLinks } from "@/lib/crm/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type ScopeColumn = typeof agreementAcceptances.companyId | typeof agreementAcceptances.ownerId;

async function agreementStatus(column: ScopeColumn, id: string, text: AgreementText) {
  const [latest] = await db
    .select()
    .from(agreementAcceptances)
    .where(and(eq(column, id), eq(agreementAcceptances.agreementType, text.type)))
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);
  if (!latest) return null;
  return {
    id: latest.id, // för annullering (DELETE /api/crm/agreement-acceptances/[id])
    acceptedName: latest.acceptedName,
    acceptedAt: latest.acceptedAt,
    version: latest.version,
    validUntil: agreementValidUntil(latest.acceptedAt),
    valid: isAcceptanceValid(latest, text),
    currentVersion: text.version,
  };
}

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const companyId = req.nextUrl.searchParams.get("companyId");

  if (ownerId) {
    const links = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.ownerId, ownerId))
      .orderBy(desc(shareLinks.createdAt));
    const agreement = await agreementStatus(agreementAcceptances.ownerId, ownerId, UTHYRNINGSUPPDRAG);
    return NextResponse.json({ links, agreement });
  }

  if (companyId) {
    const reqRows = await db
      .select({ id: requests.id })
      .from(requests)
      .where(eq(requests.companyId, companyId));
    const reqIds = reqRows.map((r) => r.id);
    const links = reqIds.length
      ? await db
          .select()
          .from(shareLinks)
          .where(inArray(shareLinks.requestId, reqIds))
          .orderBy(desc(shareLinks.createdAt))
      : [];
    const agreement = await agreementStatus(agreementAcceptances.companyId, companyId, UPPDRAGSBEKRAFTELSE);
    return NextResponse.json({ links, agreement, requestIds: reqIds });
  }

  if (!requestId) return NextResponse.json({ error: "requestId, ownerId eller companyId krävs" }, { status: 400 });

  const links = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.requestId, requestId))
    .orderBy(desc(shareLinks.createdAt));

  // Kundens avtal gäller företaget — slå upp via förfrågan.
  const [request] = await db
    .select({ companyId: requests.companyId })
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  const agreement = request
    ? await agreementStatus(agreementAcceptances.companyId, request.companyId, UPPDRAGSBEKRAFTELSE)
    : null;

  return NextResponse.json({ links, agreement });
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const requestId = typeof body.requestId === "string" ? body.requestId : null;
  const ownerId = typeof body.ownerId === "string" ? body.ownerId : null;
  if (!requestId && !ownerId) {
    return NextResponse.json({ error: "requestId eller ownerId krävs" }, { status: 400 });
  }
  const audience: ShareAudience = body.audience === "landlord" || ownerId ? "landlord" : "tenant";

  const link = await ensureShareLink({
    audience,
    requestId,
    matchId: typeof body.matchId === "string" ? body.matchId : null,
    ownerId,
    userId: (session.user as { id?: string } | undefined)?.id ?? null,
  });
  return NextResponse.json(link, { status: 201 });
}
