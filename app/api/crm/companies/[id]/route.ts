import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, contacts, notes, requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [company] = await db.select().from(companies).where(eq(companies.id, id));
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [companyContacts, companyRequests, companyNotes] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.companyId, id)),
    db.select().from(requests).where(eq(requests.companyId, id)),
    db.select().from(notes).where(eq(notes.companyId, id)),
  ]);

  return NextResponse.json({ ...company, contacts: companyContacts, requests: companyRequests, notes: companyNotes });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const [row] = await db
    .update(companies)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(companies.id, id))
    .returning();

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(companies).where(eq(companies.id, id));
  return NextResponse.json({ ok: true });
}
