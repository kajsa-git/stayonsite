import { and, eq, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireApprovedSession } from "@/lib/crm/auth";
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { db } from "@/lib/crm/db";
import { properties, propertyImages } from "@/lib/crm/schema";
import { propertyContentHash } from "@/lib/crm/property-content-policy";
import { reviewPropertyContent } from "@/lib/crm/property-content-review";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!bearerAuthorized(req, process.env.CRON_SECRET) && !(await requireApprovedSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Also recover approved rows edited by imports/MCP outside the HTTP hooks.
  const [approved, images] = await Promise.all([
    db.select().from(properties).where(eq(properties.contentReviewStatus, "approved")),
    db.select({ id: propertyImages.id, key: propertyImages.key, propertyId: propertyImages.propertyId }).from(propertyImages),
  ]);
  for (const row of approved) {
    if (row.contentReviewHash !== propertyContentHash(row, images.filter((im) => im.propertyId === row.id))) {
      await db.update(properties).set({ contentReviewStatus: "pending", contentReviewHash: null })
        .where(and(eq(properties.id, row.id), eq(properties.contentReviewStatus, "approved")));
    }
  }
  // Immediate after() checks handle normal intake; this recovers interrupted
  // checks and outages. Bounded, sequential and oldest first.
  const rows = await db.select({ id: properties.id }).from(properties).where(or(
    eq(properties.contentReviewStatus, "pending"), eq(properties.contentReviewStatus, "retry"),
    and(eq(properties.contentReviewStatus, "checking"), lt(properties.contentReviewedAt, new Date(Date.now() - 5 * 60_000).toISOString())),
  )).orderBy(properties.contentReviewedAt).limit(3);
  const results = [];
  for (const row of rows) results.push({ id: row.id, status: await reviewPropertyContent(row.id) });
  return NextResponse.json({ results });
}
