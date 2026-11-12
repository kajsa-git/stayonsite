import { PUBLICATION_CONSENT_VERSION } from "@/lib/crm/publication-consent-text";
import { HUS_UPLOAD_LINK_ACTOR } from "@/lib/crm/hus-publication";
import { PublicationConsentScopeError, recordPublishConsent, webConsentEvidence, withdrawPublishConsent } from "@/lib/crm/publish-consent";
import { schedulePropertyReview } from "@/lib/crm/schedule-property-review";
import { resolveShareLink } from "@/lib/crm/share-links";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await resolveShareLink(token, { trackView: false });
  if (!link || link.audience !== "landlord" || !link.ownerId || link.matchId || link.createdBy === HUS_UPLOAD_LINK_ACTOR) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  if (body.action === "withdraw") {
    const propertyId = Array.isArray(body.propertyIds) && body.propertyIds.length === 1 ? body.propertyIds[0] : null;
    if (typeof propertyId !== "string" || !propertyId.trim() || propertyId.length > 128) {
      return NextResponse.json({ error: "Välj bostaden som ska tas bort." }, { status: 400 });
    }
    const withdrawn = await withdrawPublishConsent({
      propertyId, ownerId: link.ownerId, source: "web", name: "Uthyrare via personlig länk",
      evidence: "Uthyraren tog bort bostaden via sin personliga länk.",
    });
    return withdrawn ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Bostaden ingår inte i länken." }, { status: 404 });
  }
  if (body.version !== PUBLICATION_CONSENT_VERSION) {
    return NextResponse.json({ error: "Texten har uppdaterats. Ladda om sidan innan du godkänner." }, { status: 409 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const propertyIds = body.propertyIds;
  if (name.length < 2 || name.length > 120 || !Array.isArray(propertyIds) || !propertyIds.length || propertyIds.length > 100 ||
      propertyIds.some((id: unknown) => typeof id !== "string" || !id.trim() || id.length > 128)) {
    return NextResponse.json({ error: "Ange ditt namn och välj minst en bostad." }, { status: 400 });
  }
  try {
    const stamped = await recordPublishConsent({
      ownerId: link.ownerId, propertyIds, name, source: "web",
      evidence: webConsentEvidence(),
      webAcceptance: { shareLinkId: link.id, language: "sv" },
    });
    for (const property of stamped) schedulePropertyReview(property.id);
    return NextResponse.json({ ok: true, count: stamped.length }, { status: stamped.length ? 201 : 200 });
  } catch (error) {
    if (error instanceof PublicationConsentScopeError) return NextResponse.json({ error: "Bostaden ingår inte i länken." }, { status: 404 });
    throw error;
  }
}

export const maxDuration = 300;
