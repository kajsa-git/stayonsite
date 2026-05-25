import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { matches, properties } from "@/lib/crm/schema";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// GET /api/crm/matches?requestId=... → matches for a request, joined with property summary
export async function GET(req: NextRequest) {
  const session = await auth();
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
      notes: matches.notes,
      createdAt: matches.createdAt,
      propertyAddress: properties.address,
      propertyCity: properties.city,
      propertyRentOut: properties.rentOut,
    })
    .from(matches)
    .leftJoin(properties, eq(matches.propertyId, properties.id))
    .where(eq(matches.requestId, requestId))
    .orderBy(desc(matches.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
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
