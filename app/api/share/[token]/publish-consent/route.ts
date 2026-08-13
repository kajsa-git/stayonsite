// PUBLIK, token-gatad registrering av publiceringsgodkännande. Bara fristående
// uthyrarlänkar (audience landlord + ownerId) — samma kapabilitetsmodell som
// avtalssigneringen i ../agreement. Godkännandet gäller ägarens opublicerade
// objekt; publicering görs fortfarande manuellt i CRM:et efter granskning.
import { recordPublishConsent } from "@/lib/crm/publish-consent";
import { resolveShareLink } from "@/lib/crm/share-links";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await resolveShareLink(token);
  if (!link || link.audience !== "landlord" || !link.ownerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  // Honeypot: fältet är dolt för människor — ifyllt betyder bot. Låtsas lyckas.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : null;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const stamped = await recordPublishConsent({ ownerId: link.ownerId, name, source: "web", ip });
  return NextResponse.json({ ok: true, count: stamped.length }, { status: stamped.length ? 201 : 200 });
}
