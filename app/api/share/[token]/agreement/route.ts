// PUBLIK, token-gatad: kunden godkänner uppdragsbekräftelsen via sin
// erbjudandelänk. Fas 2:s enda kundskrivning — stämplar (typ, version, namn,
// tidpunkt) i crm_agreement_acceptances. Idempotent per (request, version).
import { UPPDRAGSBEKRAFTELSE } from "@/lib/crm/avtal";
import { db } from "@/lib/crm/db";
import { agreementAcceptances } from "@/lib/crm/schema";
import { resolveShareLink } from "@/lib/crm/share-links";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await resolveShareLink(token);
  if (!link || link.audience !== "tenant") {
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
    acceptedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent")?.slice(0, 400) ?? null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
