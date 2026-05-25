import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { indexCompany, removeCompanyCascadeFromIndex } from "@/lib/crm/search-index";
import { companies, contacts, matches, notes, requests } from "@/lib/crm/schema";
import { eq, inArray } from "drizzle-orm";
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

  // Attach proposal (match) counts per request
  const requestIds = companyRequests.map((r) => r.id);
  let matchCounts: Record<string, number> = {};
  if (requestIds.length) {
    const rows = await db
      .select({ requestId: matches.requestId })
      .from(matches)
      .where(inArray(matches.requestId, requestIds));
    matchCounts = rows.reduce((acc, r) => {
      acc[r.requestId] = (acc[r.requestId] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  const requestsWithCounts = companyRequests.map((r) => ({ ...r, matchCount: matchCounts[r.id] ?? 0 }));

  return NextResponse.json({ ...company, contacts: companyContacts, requests: requestsWithCounts, notes: companyNotes });
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

  await indexCompany(id).catch((e) => console.error("search-index company:", e));
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(companies).where(eq(companies.id, id));
  await removeCompanyCascadeFromIndex(id).catch((e) => console.error("search-index company delete:", e));
  return NextResponse.json({ ok: true });
}
