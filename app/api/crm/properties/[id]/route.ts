import { schedulePropertyReview } from "@/lib/crm/schedule-property-review";
import { PropertyTranslationError } from "@/lib/crm/property-translations";
import { contentChanged, isCurrentContentApproved } from "@/lib/crm/property-content-policy";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { deletePropertyDeep } from "@/lib/crm/cascade-delete";
import { indexOwner, indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { isValidPropertyStatus, mergeOwnerIntoProperty, normalizePropertyWriteBody } from "@/lib/crm/owners";
import { outboxMessages, owners, properties, propertyImages, rentalReviews } from "@/lib/crm/schema";
import { HUS_PUBLICATION_SMS_SOURCE, husPublicationSmsId, husPublishedLinkSms } from "@/lib/crm/hus-publication";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { imageObjectKeys } from "@/lib/crm/image-variants";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { shouldValidatePublication, validatePublicationSeo } from "@/lib/crm/publication-seo";
import { hasPropertyPostalCode, PROPERTY_POSTAL_REQUIRED_ERROR } from "@/lib/crm/property-postal";
import { syncRentalReview } from "@/lib/crm/rental-review";
import { hasWebsitePropertyStatus } from "@/lib/crm/publication";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (body.status != null && !isValidPropertyStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  // Befintliga äldre objekt utan postnummer får fortfarande status-/snabbuppdateras,
  // men ett uttryckligt postnummerfält får aldrig tömmas. Hela redigeringsformuläret
  // skickar fältet och leder därför användaren till att komplettera innan sparning.
  if (Object.prototype.hasOwnProperty.call(body, "postalCode") && !hasPropertyPostalCode(body.postalCode)) {
    return NextResponse.json({ error: PROPERTY_POSTAL_REQUIRED_ERROR }, { status: 400 });
  }
  const [existing] = await db.select().from(properties).where(eq(properties.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [husMessage] = await db.select({ id: outboxMessages.id }).from(outboxMessages).where(and(
    eq(outboxMessages.id, husPublicationSmsId(id)), eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE),
  )).limit(1);
  const husIntake = existing.publishConsentSource === "hus" || !!husMessage || (existing.notes ?? "").includes("HUS webbpublicering (");
  const publishingHus = husIntake && body.published === true && !existing.published;
  const activatingHusProspect = husIntake && body.prospektPublished === true && !existing.prospektPublished;
  if (body.published === true && !existing.published && !existing.publishConsentAt) {
    return NextResponse.json({ error: "Uthyrarens publiceringsmedgivande saknas." }, { status: 422 });
  }
  if (activatingHusProspect && !existing.publishConsentAt) {
    return NextResponse.json({ error: "Uthyrarens publiceringsmedgivande saknas för bostaden." }, { status: 422 });
  }
  let values;
  try { values = await normalizePropertyWriteBody(body, existing); }
  catch (error) {
    if (error instanceof PropertyTranslationError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
  if (husIntake) values.autoPublishEnabled = false;
  else if ((body.published === false && existing.published) || (body.prospektPublished === false && existing.prospektPublished)) values.autoPublishEnabled = false;
  else if ((body.published === true && !existing.published) || (body.prospektPublished === true && !existing.prospektPublished)) values.autoPublishEnabled = true;
  const changed = contentChanged(body);
  if (publishingHus || activatingHusProspect) {
    const images = await db.select({ id: propertyImages.id, key: propertyImages.key }).from(propertyImages).where(eq(propertyImages.propertyId, id));
    if (changed || !isCurrentContentApproved(existing, images)) {
      return NextResponse.json({ error: "Granska uppgifterna och bilderna innan bostaden publiceras." }, { status: 422 });
    }
  }
  // A later substantive edit must not silently republish a HUS property after
  // the automated check: the changed text and images need a new human review.
  if (husIntake && changed && (existing.published || existing.prospektPublished)) {
    values.published = false;
    values.prospektPublished = false;
  }
  if (changed) Object.assign(values, { contentReviewStatus: existing.contentReviewStatus === "checking" ? "checking" : "pending", contentReviewHash: null });
  const candidate = { ...existing, ...values };
  if (!changed && candidate.contentReviewStatus === "approved" && shouldValidatePublication(existing, body, candidate)) {
    const problem = await validatePublicationSeo(candidate);
    if (problem) return NextResponse.json({ error: problem }, { status: 422 });
  }
  let row;
  try { row = await db.transaction(async (tx) => {
    // Läs statusen igen i transaktionen så samtidiga sparningar inte startar om kontrollen.
    const [before] = await tx.select().from(properties).where(eq(properties.id, id));
    if (!before) throw new Error("Bostaden finns inte kvar");
    if (publishingHus || activatingHusProspect) {
      const images = await tx.select({ id: propertyImages.id, key: propertyImages.key }).from(propertyImages).where(eq(propertyImages.propertyId, id));
      if (!before.publishConsentAt || !isCurrentContentApproved(before, images)) throw new Error("HUS_REVIEW_CHANGED");
    }
    const [saved] = await tx.update(properties)
      .set({ ...values, updatedAt: new Date().toISOString() })
      .where(eq(properties.id, id)).returning();
    await syncRentalReview(tx, before, saved);
    if (publishingHus && saved.published && saved.slug && saved.publishConsentAt && hasWebsitePropertyStatus(saved.status, saved.publishConsentAt)) {
      await tx.update(outboxMessages).set({ status: "queued", body: husPublishedLinkSms(id), createdAt: sql`datetime('now')` })
        .where(and(eq(outboxMessages.id, husPublicationSmsId(id)), eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE), eq(outboxMessages.status, "pending_publication")));
    }
    return saved;
  }); } catch (error) {
    if (error instanceof Error && error.message === "HUS_REVIEW_CHANGED") {
      return NextResponse.json({ error: "Uppgifterna ändrades under granskningen. Kontrollera bostaden igen." }, { status: 409 });
    }
    throw error;
  }
  if (body.published === false || (husIntake && changed && existing.published)) {
    // A not-yet-claimed message must not send a link to a withdrawn listing.
    await db.update(outboxMessages).set({ status: "pending_publication", body: "Bostadslänken skickas när publiceringen är klar." })
      .where(and(
        eq(outboxMessages.id, husPublicationSmsId(id)),
        eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE),
        eq(outboxMessages.status, "queued"),
      ));
  }
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  if (row?.ownerId) {
    await indexOwner(row.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  const [owner] = row?.ownerId
    ? await db.select().from(owners).where(eq(owners.id, row.ownerId))
    : [null];
  if (changed || body.status === "available" || body.published === true || body.prospektPublished === true) schedulePropertyReview(id);
  const [review] = row.status === "rented" ? await db.select({ checkOn: rentalReviews.checkOn }).from(rentalReviews).where(eq(rentalReviews.propertyId, id)) : [];
  return NextResponse.json({ ...mergeOwnerIntoProperty({ property: row, owner: owner ?? null }), rentalReviewCheckOn: review?.checkOn ?? null });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select({ ownerId: properties.ownerId }).from(properties).where(eq(properties.id, id));
  // Hämta R2-nycklarna INNAN raderingen (bildraderna försvinner i transaktionen).
  const imageKeys = (
    await db
      .select({ key: propertyImages.key, thumbKey: propertyImages.thumbKey, displayKey: propertyImages.displayKey })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
  ).flatMap(imageObjectKeys);

  await db.transaction((tx) => deletePropertyDeep(tx, id));

  // Städa bildobjekten i R2 (best-effort — DB-raderingen har redan lyckats).
  await Promise.all(
    imageKeys.map((key) =>
      r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })).catch((e) => console.error("R2 delete:", e)),
    ),
  );

  await removeFromIndex("property", id).catch((e) => console.error("search-index property delete:", e));
  if (existing?.ownerId) {
    await indexOwner(existing.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  return NextResponse.json({ ok: true });
}

export const maxDuration = 300;
