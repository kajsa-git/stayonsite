import { isAcceptanceValid, UTHYRNINGSUPPDRAG } from "@/lib/crm/avtal";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { agreementAcceptances, matchEvents, matches, properties } from "@/lib/crm/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// GET /api/crm/matches?requestId=... → matches for a request, joined with property summary
export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const rows = await db
    .select({
      id: matches.id,
      requestId: matches.requestId,
      propertyId: matches.propertyId,
      status: matches.status,
      matchScore: matches.matchScore,
      sentAt: matches.sentAt,
      followUpDate: matches.followUpDate,
      followUpReason: matches.followUpReason,
      kalkyl: matches.kalkyl,
      offerRentOut: matches.offerRentOut,
      offerStartDate: matches.offerStartDate,
      offerEndDate: matches.offerEndDate,
      offerOngoing: matches.offerOngoing,
      offerNote: matches.offerNote,
      promisedRentIn: matches.promisedRentIn,
      promisedStartDate: matches.promisedStartDate,
      promisedEndDate: matches.promisedEndDate,
      promisedConditions: matches.promisedConditions,
      promisedAt: matches.promisedAt,
      notes: matches.notes,
      createdAt: matches.createdAt,
      propertyAddress: properties.address,
      propertyCity: properties.city,
      propertyRentIn: properties.rentIn,
      propertyRentOut: properties.rentOut,
      propertyOwnerId: properties.ownerId,
    })
    .from(matches)
    .leftJoin(properties, eq(matches.propertyId, properties.id))
    .where(eq(matches.requestId, requestId))
    .orderBy(desc(matches.createdAt));

  // Uthyrningsuppdragets signeringsstatus — gäller UTHYRAREN (alla objekt) i 12
  // mån. Bara GILTIGA signeringar visas (rätt version + inom giltighetstiden).
  const ownerIds = [...new Set(rows.map((r) => r.propertyOwnerId).filter((v): v is string => !!v))];
  const acceptRows = ownerIds.length
    ? await db
        .select()
        .from(agreementAcceptances)
        .where(
          and(
            inArray(agreementAcceptances.ownerId, ownerIds),
            eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type)
          )
        )
        .orderBy(desc(agreementAcceptances.acceptedAt))
    : [];
  const signedByOwner = new Map<string, { acceptedName: string; acceptedAt: string }>();
  for (const a of acceptRows) {
    if (a.ownerId && !signedByOwner.has(a.ownerId) && isAcceptanceValid(a, UTHYRNINGSUPPDRAG)) {
      signedByOwner.set(a.ownerId, { acceptedName: a.acceptedName, acceptedAt: a.acceptedAt });
    }
  }

  // Senaste tillbakadragningen per match — kortet visar "skickat X → tillbaka-
  // draget Y" när erbjudandet dragits tillbaka. Händelsens data bär originalets
  // sentAt (nollas på matchen vid tillbakadragandet), createdAt är själva draget.
  const withdrawnRows = await db
    .select({ matchId: matchEvents.matchId, data: matchEvents.data, createdAt: matchEvents.createdAt })
    .from(matchEvents)
    .where(and(eq(matchEvents.requestId, requestId), eq(matchEvents.type, "offer_withdrawn")))
    .orderBy(desc(matchEvents.createdAt));
  const withdrawnByMatch = new Map<string, { withdrawnAt: string | null; withdrawnSentAt: string | null }>();
  for (const w of withdrawnRows) {
    if (!withdrawnByMatch.has(w.matchId)) {
      withdrawnByMatch.set(w.matchId, {
        withdrawnAt: w.createdAt,
        withdrawnSentAt: typeof w.data?.sentAt === "string" ? w.data.sentAt : null,
      });
    }
  }

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      landlordSignedName: (r.propertyOwnerId && signedByOwner.get(r.propertyOwnerId)?.acceptedName) ?? null,
      landlordSignedAt: (r.propertyOwnerId && signedByOwner.get(r.propertyOwnerId)?.acceptedAt) ?? null,
      withdrawnAt: withdrawnByMatch.get(r.id)?.withdrawnAt ?? null,
      withdrawnSentAt: withdrawnByMatch.get(r.id)?.withdrawnSentAt ?? null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.requestId || !body.propertyId) {
    return NextResponse.json({ error: "requestId and propertyId required" }, { status: 400 });
  }

  // Prevent suggesting the same property twice on the same request
  const dupe = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(eq(matches.requestId, body.requestId), eq(matches.propertyId, body.propertyId)));
  if (dupe.length) {
    return NextResponse.json({ error: "Already suggested" }, { status: 409 });
  }

  const id = nanoid();
  const [row] = await db
    .insert(matches)
    .values({
      id,
      requestId: body.requestId,
      propertyId: body.propertyId,
      status: body.status ?? "suggested",
      matchScore: body.matchScore ?? null,
      notes: body.notes ?? null,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
