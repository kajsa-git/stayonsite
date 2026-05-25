import { auth } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, requests } from "@/lib/crm/schema";
import { and, eq, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [followUps, matchingQueue, invoiceQueue] = await Promise.all([
    // Companies with followUpDate <= today
    db
      .select({ id: companies.id })
      .from(companies)
      .where(and(lte(companies.followUpDate, today))),

    // Active requests in matching status
    db
      .select({ id: requests.id })
      .from(requests)
      .where(eq(requests.status, "matching")),

    // Requests in invoiced status (to be confirmed)
    db
      .select({ id: requests.id })
      .from(requests)
      .where(eq(requests.status, "invoiced")),
  ]);

  return NextResponse.json({
    followUps: followUps.length,
    matching: matchingQueue.length,
    invoiced: invoiceQueue.length,
  });
}
