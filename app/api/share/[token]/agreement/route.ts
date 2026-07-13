// PUBLIK, token-gatad avtalssignering. Länkens målgrupp avgör avtalet:
//   tenant   → uppdragsbekräftelsen, scope = förfrågan. Idempotent per (request, version).
//   landlord → uthyrningsuppdraget, scope = objekt + ägare (signerat en gång
//              täcker alla affärer på objektet). Idempotent per (objekt, version).
// Stämplar (typ, version, namn, tidpunkt) i crm_agreement_acceptances.
import { UPPDRAGSBEKRAFTELSE, UTHYRNINGSUPPDRAG } from "@/lib/crm/avtal";
import { db } from "@/lib/crm/db";
import { agreementAcceptances, matches, properties } from "@/lib/crm/schema";
import { resolveShareLink } from "@/lib/crm/share-links";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await resolveShareLink(token);
  if (!link || (link.audience !== "tenant" && link.audience !== "landlord")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  // Honeypot: fältet är dolt för människor — ifyllt betyder bot. Låtsas lyckas.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Skriv ditt för- och efternamn för att godkänna." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const userAgent = req.headers.get("user-agent")?.slice(0, 400) ?? null;

  if (link.audience === "landlord") {
    if (!link.matchId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [match] = await db
      .select({ propertyId: matches.propertyId })
      .from(matches)
      .where(eq(matches.id, link.matchId))
      .limit(1);
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [property] = await db
      .select({ ownerId: properties.ownerId })
      .from(properties)
      .where(eq(properties.id, match.propertyId))
      .limit(1);

    const [existing] = await db
      .select({ id: agreementAcceptances.id })
      .from(agreementAcceptances)
      .where(
        and(
          eq(agreementAcceptances.propertyId, match.propertyId),
          eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type),
          eq(agreementAcceptances.version, UTHYRNINGSUPPDRAG.version)
        )
      )
      .limit(1);
    if (existing) return NextResponse.json({ ok: true });

    await db.insert(agreementAcceptances).values({
      id: nanoid(),
      agreementType: UTHYRNINGSUPPDRAG.type,
      version: UTHYRNINGSUPPDRAG.version,
      requestId: link.requestId,
      ownerId: property?.ownerId ?? null,
      propertyId: match.propertyId,
      shareLinkId: link.id,
      acceptedName: name,
      acceptedAt: now,
      userAgent,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const [existing] = await db
    .select({ id: agreementAcceptances.id })
    .from(agreementAcceptances)
    .where(
      and(
        eq(agreementAcceptances.requestId, link.requestId),
        eq(agreementAcceptances.agreementType, UPPDRAGSBEKRAFTELSE.type),
        eq(agreementAcceptances.version, UPPDRAGSBEKRAFTELSE.version)
      )
    )
    .limit(1);
  if (existing) return NextResponse.json({ ok: true });

  await db.insert(agreementAcceptances).values({
    id: nanoid(),
    agreementType: UPPDRAGSBEKRAFTELSE.type,
    version: UPPDRAGSBEKRAFTELSE.version,
    requestId: link.requestId,
    shareLinkId: link.id,
    acceptedName: name,
    acceptedAt: now,
    userAgent,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
