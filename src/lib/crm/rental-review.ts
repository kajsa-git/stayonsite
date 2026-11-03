import { and, asc, eq, lte } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { todayStockholm } from "./date";
import * as schema from "./schema";
import { owners, properties, rentalReviews, type Property } from "./schema";
import { addMonthsYmd, validYmd } from "./rental-review-date";

type Tx = Parameters<Parameters<LibSQLDatabase<typeof schema>["transaction"]>[0]>[0];
type DB = LibSQLDatabase<typeof schema>;
type RentalState = Pick<Property, "id" | "status" | "moveInFrom">;

export function initialRentalReview(today: string, moveInFrom: string | null) {
  const specified = validYmd(moveInFrom) && moveInFrom >= today;
  return {
    rentedSince: today,
    checkOn: specified ? moveInFrom : addMonthsYmd(today, 2),
    source: specified ? "specified" : "two_months",
  };
}

export async function dueRentalReviews(db: DB, today = todayStockholm()) {
  return db.select({
    propertyId: properties.id, address: properties.address, ownerId: owners.id,
    ownerName: owners.name, ownerPhone: owners.phone, checkOn: rentalReviews.checkOn,
  }).from(rentalReviews)
    .innerJoin(properties, eq(rentalReviews.propertyId, properties.id))
    .leftJoin(owners, eq(properties.ownerId, owners.id))
    .where(and(eq(properties.status, "rented"), lte(rentalReviews.checkOn, today)))
    .orderBy(asc(rentalReviews.checkOn), asc(properties.address));
}

// Anropas inom samma transaktion som status-/datumändringen. En ny sparning
// eller en uppskjuten kontroll får aldrig starta om tvåmånadersklockan.
export async function syncRentalReview(tx: Tx, before: RentalState | null, after: RentalState, today = todayStockholm()): Promise<void> {
  if (after.status !== "rented") return;
  if (!before || before.status !== "rented") {
    const review = initialRentalReview(today, after.moveInFrom);
    await tx.insert(rentalReviews).values({ propertyId: after.id, ...review })
      .onConflictDoUpdate({ target: rentalReviews.propertyId, set: review });
    return;
  }
  if (before.moveInFrom === after.moveInFrom) return;
  const [existing] = await tx.select().from(rentalReviews).where(eq(rentalReviews.propertyId, after.id));
  if (!existing) return; // Gamla uthyrningar omfattas inte retroaktivt.
  const specified = validYmd(after.moveInFrom) && after.moveInFrom >= today;
  await tx.update(rentalReviews).set({
    checkOn: specified ? after.moveInFrom : addMonthsYmd(existing.rentedSince, 2),
    source: specified ? "specified" : "two_months",
  }).where(eq(rentalReviews.propertyId, after.id));
}
