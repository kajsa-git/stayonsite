import { pendingContentReview } from "@/lib/crm/invalidate-property-review";
import { schedulePropertyReview } from "@/lib/crm/schedule-property-review";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/crm/db";
import { properties } from "@/lib/crm/schema";
import { authorizeLandlordProperty } from "@/lib/crm/landlord-properties";
import { landlordPropertyInput } from "@/lib/crm/landlord-property-input";
import { indexProperty } from "@/lib/crm/search-index";
import { PropertyTranslationError, withDescriptionTranslations } from "@/lib/crm/property-translations";
import { syncRentalReview } from "@/lib/crm/rental-review";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const condition = await authorizeLandlordProperty(token, id);
  if (!condition) return NextResponse.json({ error: "Länken är inte giltig för den här bostaden." }, { status: 404 });
  const parsed = landlordPropertyInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Kontrollera uppgifterna och datumen och försök igen." }, { status: 400 });
  const [existing] = await db.select({ moveInFrom: properties.moveInFrom, availableTo: properties.availableTo,
    publicDescription: properties.publicDescription, publicDescriptionEn: properties.publicDescriptionEn, publicDescriptionPl: properties.publicDescriptionPl })
    .from(properties).where(condition).limit(1);
  if (!existing) return NextResponse.json({ error: "Bostaden finns inte kvar." }, { status: 404 });
  if (!landlordPropertyInput.safeParse({ moveInFrom: existing.moveInFrom, availableTo: existing.availableTo, ...parsed.data }).success) {
    return NextResponse.json({ error: "Slutdatum måste vara samma dag som eller efter startdatum." }, { status: 400 });
  }
  let values;
  try { values = await withDescriptionTranslations(parsed.data, existing); }
  catch (error) {
    if (error instanceof PropertyTranslationError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
  const saved = await db.transaction(async (tx) => {
    const [before] = await tx.select().from(properties).where(condition).limit(1);
    if (!before) return null;
    const [row] = await tx.update(properties).set({ ...values, ...pendingContentReview(), updatedAt: new Date().toISOString() })
      .where(condition).returning();
    if (row) await syncRentalReview(tx, before, row);
    return row;
  });
  if (!saved) return NextResponse.json({ error: "Bostaden finns inte kvar." }, { status: 404 });
  await indexProperty(id).catch((error) => console.error("search-index landlord property:", error));
  schedulePropertyReview(id);
  return NextResponse.json({ ok: true });
}

export const maxDuration = 300;
