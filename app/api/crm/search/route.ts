import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, contacts, notes, requests } from "@/lib/crm/schema";
import { inArray, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  // Neutralisera LIKE-jokrar (% _ \) så att söktexten matchas bokstavligt.
  const pattern = `%${q.replace(/[%_\\]/g, " ")}%`;
  const select = {
    id: companies.id,
    name: companies.name,
    orgNr: companies.orgNr,
  };

  // 1. Direct company-field matches
  const direct = await db
    .select(select)
    .from(companies)
    .where(
      or(
        like(companies.name, pattern),
        like(companies.orgNr, pattern),
        like(companies.website, pattern),
        like(companies.followUpReason, pattern)
      )
    )
    .limit(10);

  // 2. Company ids found via related records — contacts, notes, requests
  const [contactRows, noteRows, requestRows] = await Promise.all([
    db
      .select({ companyId: contacts.companyId })
      .from(contacts)
      .where(or(like(contacts.name, pattern), like(contacts.phone, pattern), like(contacts.email, pattern))),
    db.select({ companyId: notes.companyId }).from(notes).where(like(notes.content, pattern)),
    db
      .select({ companyId: requests.companyId })
      .from(requests)
      .where(
        or(
          like(requests.city, pattern),
          like(requests.postalCode, pattern),
          like(requests.street, pattern),
          like(requests.addressQuery, pattern),
          like(requests.billingProjectId, pattern),
          like(requests.notes, pattern),
          like(requests.lostReason, pattern),
        )
      ),
  ]);

  const directIds = new Set(direct.map((c) => c.id));
  const extraIds = [
    ...new Set([...contactRows, ...noteRows, ...requestRows].map((r) => r.companyId)),
  ].filter((id) => !directIds.has(id));

  let extras: typeof direct = [];
  if (extraIds.length > 0) {
    extras = await db.select(select).from(companies).where(inArray(companies.id, extraIds));
  }

  return NextResponse.json([...direct, ...extras].slice(0, 10));
}
