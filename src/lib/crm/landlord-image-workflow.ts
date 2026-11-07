import { createHash } from "node:crypto";
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { and, asc, eq, isNull, lt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { gmailAutomationUserId, gmailGetImageAttachment } from "./gmail";
import { createImageVariants } from "./image-variants";
import { sniffImageType } from "./image-type";
import { sendLandlordImageReviewNotice } from "./landlord-dialog-alerts";
import { inspectLandlordImage } from "./landlord-image-classifier";
import { mailboxAddress } from "./landlord-dialog-policy";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "./landlord-property-lock";
import { R2_BUCKET, r2 } from "./r2";
import { landlordAgentHealth, landlordDialogs, landlordImageCandidates, landlordReplyRuns, owners, properties, propertyImages, propertyNotes } from "./schema";

type Candidate = typeof landlordImageCandidates.$inferSelect;
const MAX_BYTES = 15 * 1024 * 1024;

async function isDuplicate(propertyId: string, bytes: Buffer): Promise<boolean> {
  const images = await db.select({ key: propertyImages.key }).from(propertyImages).where(eq(propertyImages.propertyId, propertyId));
  if (!images.length) return false;
  const gallery = new Set(images.map((row) => row.key));
  const digest = createHash("md5").update(bytes).digest("hex");
  let token: string | undefined;
  do {
    const page = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: `properties/${propertyId}/`, ContinuationToken: token }), { abortSignal: AbortSignal.timeout(15_000) });
    if ((page.Contents ?? []).some((object) => object.Key && gallery.has(object.Key) && (object.ETag ?? "").replace(/"/g, "") === digest)) return true;
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return false;
}

async function requireReview(candidate: Candidate, token: string, reason: string, objectKey: string | null) {
  const [updated] = await db.update(landlordImageCandidates).set({ status: "needs_review", error: reason.slice(0, 500), objectKey,
    leaseToken: null, leaseUntil: null, updatedAt: new Date().toISOString() })
    .where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.leaseToken, token))).returning();
  if (!updated) return;
  await db.update(landlordReplyRuns).set({ attachmentsNeedReview: true }).where(eq(landlordReplyRuns.gmailMessageId, candidate.replyRunId));
  await sendLandlordImageReviewNotice(candidate.propertyId, candidate.replyRunId);
  await db.update(landlordImageCandidates).set({ reviewNoticeSentAt: new Date().toISOString() })
    .where(and(eq(landlordImageCandidates.id, candidate.id), isNull(landlordImageCandidates.reviewNoticeSentAt)));
}

async function processCandidate(candidate: Candidate, userId: string): Promise<"imported" | "review" | "ignored"> {
  const now = new Date(); const token = nanoid();
  const [locked] = await db.update(landlordImageCandidates).set({ status: "processing", leaseToken: token,
    leaseUntil: new Date(now.getTime() + 120_000).toISOString(), updatedAt: now.toISOString() })
    .where(and(eq(landlordImageCandidates.id, candidate.id), or(eq(landlordImageCandidates.status, "pending"),
      and(eq(landlordImageCandidates.status, "processing"), or(isNull(landlordImageCandidates.leaseUntil), lt(landlordImageCandidates.leaseUntil, now.toISOString())))))).returning();
  if (!locked) return "ignored";
  const propertyLock = await acquireLandlordPropertyLock(candidate.propertyId);
  if (!propertyLock) {
    await db.update(landlordImageCandidates).set({ status: "pending", leaseToken: null, leaseUntil: null, updatedAt: new Date().toISOString() })
      .where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.leaseToken, token)));
    return "ignored";
  }
  let uploadedKey: string | null = null;
  try {
    const [run] = await db.select().from(landlordReplyRuns).where(eq(landlordReplyRuns.gmailMessageId, candidate.replyRunId)).limit(1);
    const [dialog] = run ? await db.select().from(landlordDialogs).where(eq(landlordDialogs.id, run.dialogId)).limit(1) : [];
    const [owner] = dialog ? await db.select().from(owners).where(eq(owners.id, dialog.ownerId)).limit(1) : [];
    const [property] = dialog ? await db.select().from(properties).where(and(eq(properties.id, candidate.propertyId), eq(properties.ownerId, dialog.ownerId))).limit(1) : [];
    if (!dialog?.active || !owner || !property || dialog.propertyId !== candidate.propertyId
      || mailboxAddress(owner.email ?? "") !== mailboxAddress(dialog.landlordEmail)) throw new Error("Uthyraren eller objektkopplingen har ändrats; kontrollera bilden manuellt.");
    if (candidate.sizeBytes > MAX_BYTES) throw new Error("Bildbilagan är större än 15 MB.");
    const bytes = await gmailGetImageAttachment(userId, candidate.gmailMessageId, candidate.attachmentId);
    const sniffed = sniffImageType(bytes);
    if (!sniffed) throw new Error("Bilagan har inget bildformat som CRM stöder.");
    const inspected = await inspectLandlordImage(bytes, candidate.fileName);
    if (inspected.decision === "ignore") {
      await db.update(landlordImageCandidates).set({ status: "ignored", error: inspected.reason, leaseToken: null, leaseUntil: null, updatedAt: new Date().toISOString() })
        .where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.leaseToken, token)));
      return "ignored";
    }
    if (await isDuplicate(candidate.propertyId, bytes)) {
      await db.update(landlordImageCandidates).set({ status: "imported", error: "Bilden fanns redan i galleriet.", leaseToken: null, leaseUntil: null, updatedAt: new Date().toISOString() })
        .where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.leaseToken, token)));
      return "imported";
    }
    const key = `properties/${candidate.propertyId}/landlord-candidates/${candidate.id}.${sniffed.ext}`;
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: bytes, ContentType: sniffed.mime }), { abortSignal: AbortSignal.timeout(15_000) });
    uploadedKey = key;
    if (inspected.decision !== "accept") {
      await requireReview(candidate, token, inspected.reason, key);
      return "review";
    }
    const imageId = `landlord-image:${candidate.id}`;
    const outcome = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(properties).where(eq(properties.id, candidate.propertyId)).limit(1);
      const [held] = await tx.select().from(landlordImageCandidates).where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.leaseToken, token))).limit(1);
      if (!current) return "deleted";
      if (!held) return "lost";
      const [latestOwner] = await tx.select({ email: owners.email }).from(owners).where(eq(owners.id, dialog.ownerId)).limit(1);
      const [latestDialog] = await tx.select({ active: landlordDialogs.active }).from(landlordDialogs).where(eq(landlordDialogs.id, dialog.id)).limit(1);
      if (!latestDialog?.active || current.ownerId !== dialog.ownerId || mailboxAddress(latestOwner?.email ?? "") !== mailboxAddress(dialog.landlordEmail)) return "owner_changed";
      if (current.published || current.prospektPublished || current.autoPublishEnabled) return "review";
      const images = await tx.select({ id: propertyImages.id }).from(propertyImages).where(eq(propertyImages.propertyId, current.id));
      await tx.insert(propertyImages).values({ id: imageId, propertyId: current.id, key, fileName: candidate.fileName,
        sortOrder: images.length, isPrimary: images.length === 0 }).onConflictDoNothing();
      await tx.update(properties).set({ contentReviewHash: null, contentReviewStatus: current.contentReviewStatus === "checking" ? "checking" : "pending",
        updatedAt: new Date().toISOString() }).where(eq(properties.id, current.id));
      await tx.update(landlordImageCandidates).set({ status: "imported", objectKey: key, error: null, leaseToken: null, leaseUntil: null,
        updatedAt: new Date().toISOString() }).where(and(eq(landlordImageCandidates.id, candidate.id), eq(landlordImageCandidates.leaseToken, token)));
      await tx.insert(propertyNotes).values({ id: nanoid(), propertyId: current.id, channel: "mail", source: "landlord_agent", content: `En bildbilaga från uthyraren har lagts till i bostadens bilder: ${candidate.fileName}.` });
      return "imported";
    });
    if (outcome === "deleted") {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })).catch(() => undefined);
      return "ignored";
    }
    if (outcome === "lost") return "ignored";
    if (outcome === "review" || outcome === "owner_changed") {
      await requireReview(candidate, token, outcome === "owner_changed" ? "Uthyraren eller dialogen har ändrats; kontrollera bilden manuellt."
        : "Bilden är sparad privat. Kontrollera den innan den läggs i ett publicerat eller automatiskt publicerbart boende.", key);
      return "review";
    }
    try {
      const variants = await createImageVariants(key, bytes);
      await db.update(propertyImages).set(variants).where(eq(propertyImages.id, imageId));
    } catch { console.error("landlord image variants failed"); }
    return "imported";
  } catch (error) {
    const [current] = await db.select({ status: landlordImageCandidates.status }).from(landlordImageCandidates).where(eq(landlordImageCandidates.id, candidate.id)).limit(1);
    if (current?.status === "needs_review") throw error; // failed notice is retried with the same idempotency key
    await requireReview(candidate, token, error instanceof Error ? error.message : "Bilden kunde inte hanteras automatiskt.", uploadedKey);
    return "review";
  } finally {
    await releaseLandlordPropertyLock(candidate.propertyId, propertyLock);
  }
}

export async function runLandlordImageSweep(): Promise<{ checked: number; imported: number; review: number; errors: number }> {
  const clock = new Date(); const now = clock.toISOString(); const sweepToken = nanoid();
  const summary = { checked: 0, imported: 0, review: 0, errors: 0 };
  await db.insert(landlordAgentHealth).values({ id: "images" }).onConflictDoNothing();
  // Serialize the image importer: overlapping Vercel cron invocations must not
  // import identical photos before either worker sees the other's gallery row.
  const [lock] = await db.update(landlordAgentHealth).set({ leaseToken: sweepToken, leaseUntil: new Date(clock.getTime() + 360_000).toISOString() })
    .where(and(eq(landlordAgentHealth.id, "images"), or(isNull(landlordAgentHealth.leaseUntil), lt(landlordAgentHealth.leaseUntil, now)))).returning();
  if (!lock) return summary;
  try {
  const pendingNotices = await db.select().from(landlordImageCandidates).where(and(eq(landlordImageCandidates.status, "needs_review"),
    isNull(landlordImageCandidates.reviewNoticeSentAt))).limit(10);
  for (const candidate of pendingNotices) {
    await db.update(landlordReplyRuns).set({ attachmentsNeedReview: true }).where(eq(landlordReplyRuns.gmailMessageId, candidate.replyRunId));
    await sendLandlordImageReviewNotice(candidate.propertyId, candidate.replyRunId);
    await db.update(landlordImageCandidates).set({ reviewNoticeSentAt: new Date().toISOString() }).where(eq(landlordImageCandidates.id, candidate.id));
  }
  const candidates = await db.select().from(landlordImageCandidates).where(or(eq(landlordImageCandidates.status, "pending"),
    and(eq(landlordImageCandidates.status, "processing"), or(isNull(landlordImageCandidates.leaseUntil), lt(landlordImageCandidates.leaseUntil, now))))
  ).orderBy(asc(landlordImageCandidates.createdAt)).limit(2);
  if (!candidates.length) return summary;
  const userId = await gmailAutomationUserId();
  for (const candidate of candidates) {
    summary.checked++;
    try {
      const result = await processCandidate(candidate, userId);
      if (result === "imported") summary.imported++;
      if (result === "review") summary.review++;
    } catch { summary.errors++; }
  }
  return summary;
  } finally {
    await db.update(landlordAgentHealth).set({ leaseToken: null, leaseUntil: null })
      .where(and(eq(landlordAgentHealth.id, "images"), eq(landlordAgentHealth.leaseToken, sweepToken)));
  }
}
