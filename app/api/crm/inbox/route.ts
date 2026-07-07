// Inkorgen i CRM-UI:t: inkommande iMessage/SMS-svar som Mac-agenten läst in.
// GET ?unread=1 → bara olästa; annars senaste 100. Berikas med namn på
// uthyrare/kontakt/företag för visning i Min dag och på korten.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, contacts, inboxMessages, owners } from "@/lib/crm/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "1";
  const rows = unreadOnly
    ? await db.select().from(inboxMessages).where(eq(inboxMessages.isRead, false)).orderBy(desc(inboxMessages.sentAt)).limit(200)
    : await db.select().from(inboxMessages).orderBy(desc(inboxMessages.sentAt)).limit(100);
  if (rows.length === 0) return NextResponse.json([]);

  const ownerIds = [...new Set(rows.map((r) => r.ownerId).filter((v): v is string => !!v))];
  const contactIds = [...new Set(rows.map((r) => r.contactId).filter((v): v is string => !!v))];
  const companyIds = [...new Set(rows.map((r) => r.companyId).filter((v): v is string => !!v))];

  const [ownerRows, contactRows, companyRows] = await Promise.all([
    ownerIds.length ? db.select({ id: owners.id, name: owners.name }).from(owners).where(inArray(owners.id, ownerIds)) : Promise.resolve([]),
    contactIds.length ? db.select({ id: contacts.id, name: contacts.name }).from(contacts).where(inArray(contacts.id, contactIds)) : Promise.resolve([]),
    companyIds.length ? db.select({ id: companies.id, name: companies.name }).from(companies).where(inArray(companies.id, companyIds)) : Promise.resolve([]),
  ]);
  const ownerName = new Map(ownerRows.map((r) => [r.id, r.name]));
  const contactName = new Map(contactRows.map((r) => [r.id, r.name]));
  const companyName = new Map(companyRows.map((r) => [r.id, r.name]));

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      ownerName: r.ownerId ? (ownerName.get(r.ownerId) ?? null) : null,
      contactName: r.contactId ? (contactName.get(r.contactId) ?? null) : null,
      companyName: r.companyId ? (companyName.get(r.companyId) ?? null) : null,
    })),
  );
}
