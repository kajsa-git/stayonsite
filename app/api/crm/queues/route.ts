import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, properties, requests } from "@/lib/crm/schema";
import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const requestSelect = {
  id: requests.id,
  requestNumber: requests.requestNumber,
  companyId: requests.companyId,
  companyName: companies.name,
  city: requests.city,
  status: requests.status,
};

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const requestsByStatus = (status: string) =>
    db
      .select(requestSelect)
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(eq(requests.status, status));

  const [followUpCompanies, incoming, matching, toInvoice, chaseLandlords] = await Promise.all([
    db
      .select()
      .from(companies)
      .where(lte(companies.followUpDate, today))
      .orderBy(asc(companies.followUpDate), sql`${companies.followUpTime} ASC NULLS LAST`),
    requestsByStatus("incoming"),
    requestsByStatus("matching"),
    requestsByStatus("won"),
    // Förslag som väntar svar från hyresvärd och vars jaga-datum passerat
    db
      .select({
        id: matches.id,
        requestId: matches.requestId,
        followUpDate: matches.followUpDate,
        propertyAddress: properties.address,
        companyName: companies.name,
        requestNumber: requests.requestNumber,
      })
      .from(matches)
      .innerJoin(requests, eq(matches.requestId, requests.id))
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .leftJoin(properties, eq(matches.propertyId, properties.id))
      .where(
        and(
          inArray(matches.status, ["suggested", "sent"]),
          lte(matches.followUpDate, today),
          inArray(requests.status, ["incoming", "matching"]),
        ),
      ),
  ]);

  return NextResponse.json({
    followUps: followUpCompanies,
    incoming,
    matching,
    won: toInvoice,
    chaseLandlords,
  });
}
