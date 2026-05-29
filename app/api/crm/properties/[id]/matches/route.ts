import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, requests } from "@/lib/crm/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Request history on an object: every request this property has been suggested on.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db
    .select({
      id: matches.id,
      matchStatus: matches.status,
      sentAt: matches.sentAt,
      requestId: requests.id,
      requestNumber: requests.requestNumber,
      requestStatus: requests.status,
      companyId: requests.companyId,
      companyName: companies.name,
      city: requests.city,
    })
    .from(matches)
    .innerJoin(requests, eq(matches.requestId, requests.id))
    .innerJoin(companies, eq(requests.companyId, companies.id))
    .where(eq(matches.propertyId, id))
    .orderBy(desc(matches.createdAt));

  return NextResponse.json(rows);
}
