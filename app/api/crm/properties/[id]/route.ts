import { schedulePropertyReview } from "@/lib/crm/schedule-property-review";
import { PropertyTranslationError } from "@/lib/crm/property-translations";
import { contentChanged } from "@/lib/crm/property-content-policy";
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { deletePropertyDeep } from "@/lib/crm/cascade-delete";
import { indexOwner, indexProperty, removeFromIndex } from "@/lib/crm/search-index";
import { isValidPropertyStatus, mergeOwnerIntoProperty, normalizePropertyWriteBody } from "@/lib/crm/owners";
import { owners, properties, propertyImages } from "@/lib/crm/schema";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { imageObjectKeys } from "@/lib/crm/image-variants";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { shouldValidatePublication, validatePublicationSeo } from "@/lib/crm/publication-seo";
import { hasPropertyPostalCode, PROPERTY_POSTAL_REQUIRED_ERROR } from "@/lib/crm/property-postal";

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
  if (body.published === true && !existing.published && !existing.publishConsentAt) {
    return NextResponse.json({ error: "Uthyrarens publiceringsmedgivande saknas." }, { status: 422 });
  }
  let values;
  try { values = await normalizePropertyWriteBody(body, existing); }
  catch (error) {
    if (error instanceof PropertyTranslationError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
  if ((body.published === false && existing.published) || (body.prospektPublished === false && existing.prospektPublished)) values.autoPublishEnabled = false;
  else if ((body.published === true && !existing.published) || (body.prospektPublished === true && !existing.prospektPublished)) values.autoPublishEnabled = true;
  const changed = contentChanged(body);
  if (changed) Object.assign(values, { contentReviewStatus: existing.contentReviewStatus === "checking" ? "checking" : "pending", contentReviewHash: null });
  const candidate = { ...existing, ...values };
  if (!changed && candidate.contentReviewStatus === "approved" && shouldValidatePublication(existing, body, candidate)) {
    const problem = await validatePublicationSeo(candidate);
    if (problem) return NextResponse.json({ error: problem }, { status: 422 });
  }
  const [row] = await db
    .update(properties)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(properties.id, id))
    .returning();
  await indexProperty(id).catch((e) => console.error("search-index property:", e));
  if (row?.ownerId) {
    await indexOwner(row.ownerId).catch((e) => console.error("search-index owner:", e));
  }
  const [owner] = row?.ownerId
    ? await db.select().from(owners).where(eq(owners.id, row.ownerId))
    : [null];
  if (changed || body.status === "available" || body.published === true || body.prospektPublished === true) schedulePropertyReview(id);
  return NextResponse.json(mergeOwnerIntoProperty({ property: row, owner: owner ?? null }));
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
