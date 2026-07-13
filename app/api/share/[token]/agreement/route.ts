// PUBLIK, token-gatad avtalssignering. Länkens målgrupp avgör avtalet och scopet:
//   tenant   → uppdragsbekräftelsen, gäller FÖRETAGET i 12 månader.
//   landlord → uthyrningsuppdraget, gäller UTHYRAREN (alla objekt) i 12 månader.
//              Länken kan vara fristående (owner_id) eller affärsknuten (match_id).
// Finns redan en GILTIG acceptans (rätt version, inom 12 mån) svaras ok utan ny rad;
// utgången/gammal version ⇒ ny rad läggs till (raderna är bevis och skrivs aldrig om).
import { isAcceptanceValid, UPPDRAGSBEKRAFTELSE, UTHYRNINGSUPPDRAG } from "@/lib/crm/avtal";
import { db } from "@/lib/crm/db";
import { agreementAcceptances, matches, properties, requests } from "@/lib/crm/schema";
import { resolveShareLink } from "@/lib/crm/share-links";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

async function latestAcceptance(
  scope: { companyId?: string; ownerId?: string; requestId?: string; propertyId?: string },
  type: string
) {
  const cond = scope.companyId
    ? eq(agreementAcceptances.companyId, scope.companyId)
    : scope.ownerId
      ? eq(agreementAcceptances.ownerId, scope.ownerId)
      : scope.requestId
        ? eq(agreementAcceptances.requestId, scope.requestId)
        : scope.propertyId
          ? eq(agreementAcceptances.propertyId, scope.propertyId)
          : null;
  if (!cond) return null;
  const [row] = await db
    .select()
    .from(agreementAcceptances)
    .where(and(cond, eq(agreementAcceptances.agreementType, type)))
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);
  return row ?? null;
}

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
  // Klientens IP för bevissäkring — på Vercel är första värdet i x-forwarded-for
  // den riktiga klienten (Vercel sätter headern själv, den kan inte spoofas förbi).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  // Vilken språkversion parten läste — bara sv/en finns, allt annat blir sv.
  const language = body.language === "en" ? "en" : "sv";

  if (link.audience === "landlord") {
    // Uthyrarscope: ownerId direkt (fristående länk) eller via affärens objekt.
    let ownerId: string | null = link.ownerId;
    let propertyId: string | null = null;
    if (!ownerId && link.matchId) {
      const [match] = await db
        .select({ propertyId: matches.propertyId })
        .from(matches)
        .where(eq(matches.id, link.matchId))
        .limit(1);
      if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
      propertyId = match.propertyId;
      const [property] = await db
        .select({ ownerId: properties.ownerId })
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);
      ownerId = property?.ownerId ?? null;
    }
    if (!ownerId && !propertyId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await latestAcceptance(
      ownerId ? { ownerId } : { propertyId: propertyId! },
      UTHYRNINGSUPPDRAG.type
    );
    if (isAcceptanceValid(existing, UTHYRNINGSUPPDRAG)) return NextResponse.json({ ok: true });

    await db.insert(agreementAcceptances).values({
      id: nanoid(),
      agreementType: UTHYRNINGSUPPDRAG.type,
      version: UTHYRNINGSUPPDRAG.version,
      requestId: link.requestId,
      ownerId,
      propertyId,
      shareLinkId: link.id,
      acceptedName: name,
      acceptedAt: now,
      userAgent,
      ip,
      language,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Kundscope: uppdragsbekräftelsen gäller företaget — hämta det via förfrågan.
  if (!link.requestId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [request] = await db
    .select({ companyId: requests.companyId })
    .from(requests)
    .where(eq(requests.id, link.requestId))
    .limit(1);
  const companyId = request?.companyId ?? null;

  const existing = await latestAcceptance(
    companyId ? { companyId } : { requestId: link.requestId },
    UPPDRAGSBEKRAFTELSE.type
  );
  if (isAcceptanceValid(existing, UPPDRAGSBEKRAFTELSE)) return NextResponse.json({ ok: true });

  await db.insert(agreementAcceptances).values({
    id: nanoid(),
    agreementType: UPPDRAGSBEKRAFTELSE.type,
    version: UPPDRAGSBEKRAFTELSE.version,
    requestId: link.requestId,
    companyId,
    shareLinkId: link.id,
    acceptedName: name,
    acceptedAt: now,
    userAgent,
    ip,
    language,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
