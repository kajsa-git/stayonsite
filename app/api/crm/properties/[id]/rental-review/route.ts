import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { addDaysYmd, todayStockholm } from "@/lib/crm/date";
import { addMonthsYmd } from "@/lib/crm/rental-review-date";
import { initialRentalReview } from "@/lib/crm/rental-review";
import { properties, rentalReviews } from "@/lib/crm/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireApprovedSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!["start", "snooze3", "snooze7", "snooze2months"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const today = todayStockholm();
  const saved = await db.transaction(async (tx) => {
    const [property] = await tx.select({ id: properties.id, moveInFrom: properties.moveInFrom }).from(properties)
      .where(and(eq(properties.id, id), eq(properties.status, "rented")));
    if (!property) return null;
    if (body.action === "start") {
      await tx.insert(rentalReviews).values({ propertyId: id, ...initialRentalReview(today, property.moveInFrom) })
        .onConflictDoNothing({ target: rentalReviews.propertyId });
      const [review] = await tx.select({ checkOn: rentalReviews.checkOn }).from(rentalReviews).where(eq(rentalReviews.propertyId, id));
      return review?.checkOn ?? null;
    }
    const checkOn = body.action === "snooze2months" ? addMonthsYmd(today, 2) : addDaysYmd(today, body.action === "snooze7" ? 7 : 3);
    const updated = await tx.update(rentalReviews).set({ checkOn, source: "postponed" })
      .where(eq(rentalReviews.propertyId, id)).returning({ propertyId: rentalReviews.propertyId });
    return updated.length ? checkOn : null;
  });
  return saved ? NextResponse.json({ ok: true, checkOn: saved }) : NextResponse.json({ error: "Ingen uthyrd bostad med kontroll hittades" }, { status: 404 });
}
