import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { ownerOutreach, properties } from "@/lib/crm/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

const OPEN = ["ej_kontaktad", "kontaktad", "i_dialog"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(ownerOutreach)
    .where(eq(ownerOutreach.propertyId, id))
    .orderBy(desc(ownerOutreach.startedAt));
  return NextResponse.json(rows);
}

// Starta ny runda. Returnerar befintlig öppen runda om en redan finns (max en öppen per objekt).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const [open] = await db
    .select()
    .from(ownerOutreach)
    .where(and(eq(ownerOutreach.propertyId, id), inArray(ownerOutreach.status, OPEN)));
  if (open) return NextResponse.json(open, { status: 200 });

  const [prop] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, id));
  if (!prop) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const [row] = await db
    .insert(ownerOutreach)
    .values({
      id: nanoid(),
      propertyId: id,
      ownerId: prop.ownerId ?? null,
      requestId: body.requestId ?? null,
      status: "ej_kontaktad",
      startedAt: new Date().toISOString(),
      nextFollowUpDate: body.nextFollowUpDate ?? null,
      nextFollowUpReason: body.nextFollowUpReason ?? null,
      note: body.note ?? null,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
