import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, requests } from "@/lib/crm/schema";
import { and, eq, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [followUpCompanies, matchingRequests, invoicedRequests] = await Promise.all([
    db
      .select()
      .from(companies)
      .where(lte(companies.followUpDate, today)),

    db
      .select({
        id: requests.id,
        requestNumber: requests.requestNumber,
        companyId: requests.companyId,
        companyName: companies.name,
        city: requests.city,
        status: requests.status,
      })
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(eq(requests.status, "matching")),

    db
      .select({
        id: requests.id,
        requestNumber: requests.requestNumber,
        companyId: requests.companyId,
        companyName: companies.name,
        city: requests.city,
        status: requests.status,
      })
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(eq(requests.status, "invoiced")),
  ]);

  return NextResponse.json({
    followUps: followUpCompanies,
    matching: matchingRequests,
    invoiced: invoicedRequests,
  });
}
