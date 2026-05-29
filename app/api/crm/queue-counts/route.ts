import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, matches, ownerOutreach, requests } from "@/lib/crm/schema";
import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];
  const horizon = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  })();

  const [followUps, openWithoutFollowUpRows, toInvoiceRows, chaseMatchProps, chaseOwnerProps, moveRows] = await Promise.all([
    db.select({ id: companies.id }).from(companies).where(lte(companies.followUpDate, today)),

    // Öppna uppdrag: företag med incoming/matching + followUpDate IS NULL
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .where(
        and(
          inArray(requests.status, ["incoming", "matching"]),
          isNull(companies.followUpDate),
        ),
      ),

    // Ska faktureras: företag med won-förfrågningar
    db
      .selectDistinct({ companyId: requests.companyId })
      .from(requests)
      .where(eq(requests.status, "won")),

    db
      .select({ propertyId: matches.propertyId })
      .from(matches)
      .innerJoin(requests, eq(matches.requestId, requests.id))
      .where(
        and(
          inArray(matches.status, ["suggested", "sent"]),
          lte(matches.followUpDate, today),
          inArray(requests.status, ["incoming", "matching"]),
        ),
      ),

    db
      .select({ propertyId: ownerOutreach.propertyId })
      .from(ownerOutreach)
      .where(and(isNull(ownerOutreach.concludedAt), lte(ownerOutreach.nextFollowUpDate, today))),
  ]);

  const chaseProps = new Set<string>();
  for (const m of chaseMatchProps) if (m.propertyId) chaseProps.add(m.propertyId);
  for (const o of chaseOwnerProps) chaseProps.add(o.propertyId);

  return NextResponse.json({
    followUps: followUps.length,
    openWithoutFollowUp: openWithoutFollowUpRows.length,
    toInvoice: toInvoiceRows.length,
    chaseLandlords: chaseProps.size,
  });
}
