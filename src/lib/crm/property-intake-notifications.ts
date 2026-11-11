import { and, asc, count, eq, isNotNull, isNull, lte, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { db } from "./db";
import { buildIntakeNotificationEmail } from "./intake-emails";
import { propertyImages, propertyIntakeNotifications } from "./schema";

// A quiet browser is not proof that an upload failed. After 15 minutes the
// fallback explicitly reports the count so far and asks Kajsa to check CRM.
export const INTAKE_UPLOAD_TIMEOUT_MS = 15 * 60_000;
const LEASE_MS = 2 * 60_000;
const RETRY_MS = 5 * 60_000;
type NoticeKind = "completed" | "interrupted";
type EmailSnapshot = { from: string; to: string; subject: string; text: string; html: string };

function eligible(now: Date) {
  const current = now.toISOString();
  const cutoff = new Date(now.getTime() - INTAKE_UPLOAD_TIMEOUT_MS).toISOString();
  return and(
    or(isNull(propertyIntakeNotifications.leaseUntil), lte(propertyIntakeNotifications.leaseUntil, current)),
    or(isNull(propertyIntakeNotifications.retryAfter), lte(propertyIntakeNotifications.retryAfter, current)),
    or(
      isNotNull(propertyIntakeNotifications.activeKind),
      and(isNotNull(propertyIntakeNotifications.completedAt), isNull(propertyIntakeNotifications.completedNotifiedAt)),
      and(isNull(propertyIntakeNotifications.completedAt), isNull(propertyIntakeNotifications.interruptedNotifiedAt),
        lte(propertyIntakeNotifications.lastActivityAt, cutoff)),
    ),
  );
}

// Called at the start and end of each upload so slow-but-active uploads do not
// cause a premature fallback. No row exists for the separate HUS intake flow.
export async function touchPropertyIntakeUpload(propertyId: string, now = new Date()) {
  await db.update(propertyIntakeNotifications).set({ lastActivityAt: now.toISOString() }).where(and(
    eq(propertyIntakeNotifications.propertyId, propertyId), isNull(propertyIntakeNotifications.completedAt),
  ));
}

export async function finishPropertyIntakeUpload(propertyId: string, failedImages: number, now = new Date()) {
  await db.update(propertyIntakeNotifications).set({
    completedAt: now.toISOString(), lastActivityAt: now.toISOString(), failedImages,
  }).where(and(eq(propertyIntakeNotifications.propertyId, propertyId), isNull(propertyIntakeNotifications.completedAt)));
  return deliverPropertyIntakeNotice(propertyId, now);
}

// Only the server's image rows determine the count. A stable snapshot and
// provider idempotency key make retries safe even if a send times out.
export async function deliverPropertyIntakeNotice(propertyId: string, now = new Date()): Promise<"sent" | "ignored" | "error"> {
  const token = nanoid();
  const [job] = await db.update(propertyIntakeNotifications).set({
    leaseToken: token,
    leaseUntil: new Date(now.getTime() + LEASE_MS).toISOString(),
  }).where(and(eq(propertyIntakeNotifications.propertyId, propertyId), eligible(now))).returning();
  if (!job) return "ignored";

  let kind: NoticeKind;
  try {
    kind = job.activeKind as NoticeKind || (job.completedAt ? "completed" : "interrupted");
    let snapshot: EmailSnapshot;
    if (job.activeKind && job.messageSnapshot) {
      snapshot = JSON.parse(job.messageSnapshot) as EmailSnapshot;
    } else {
      const [result] = await db.select({ value: count() }).from(propertyImages).where(eq(propertyImages.propertyId, propertyId));
      const mail = buildIntakeNotificationEmail({
        propertyId, ownerName: job.ownerName, ownerPhone: job.ownerPhone, ownerEmail: job.ownerEmail,
        ownerType: job.ownerType, address: job.address, city: job.city,
        imageCount: result.value,
        imageErrors: Array.from({ length: kind === "completed" ? job.failedImages : 0 }, () => "upload failed"),
        uploadIncomplete: kind === "interrupted",
        uploadUpdate: kind === "completed" && Boolean(job.interruptedNotifiedAt),
      });
      snapshot = {
        from: process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>",
        to: process.env.CONTACT_FORM_TO || "kajsa@stayonsite.se",
        ...mail,
      };
      const [saved] = await db.update(propertyIntakeNotifications).set({ activeKind: kind, messageSnapshot: JSON.stringify(snapshot) })
        .where(and(eq(propertyIntakeNotifications.propertyId, propertyId), eq(propertyIntakeNotifications.leaseToken, token))).returning();
      if (!saved) return "ignored";
    }

    if (!process.env.RESEND_API_KEY) throw new Error("Notification service is not configured");
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send(snapshot, {
      idempotencyKey: `property-intake/${propertyId}/${kind}`,
    });
    if (result.error || !result.data?.id) throw new Error("Notification delivery failed");

    const [updated] = await db.update(propertyIntakeNotifications).set({
      ...(kind === "completed" ? { completedNotifiedAt: now.toISOString() } : { interruptedNotifiedAt: now.toISOString() }),
      activeKind: null, messageSnapshot: null, leaseToken: null, leaseUntil: null, retryAfter: null,
    }).where(and(eq(propertyIntakeNotifications.propertyId, propertyId), eq(propertyIntakeNotifications.leaseToken, token))).returning();
    if (!updated) return "ignored";
    // A browser can finish while the timeout notice is being sent. In that
    // case also send a final update, containing the complete image count.
    if (kind === "interrupted" && updated.completedAt && !updated.completedNotifiedAt) {
      await deliverPropertyIntakeNotice(propertyId, now);
    }
    return "sent";
  } catch (error) {
    console.error("Property intake notification failed", error instanceof Error ? error.message : "unknown");
    await db.update(propertyIntakeNotifications).set({
      leaseToken: null, leaseUntil: null, retryAfter: new Date(now.getTime() + RETRY_MS).toISOString(),
    }).where(and(eq(propertyIntakeNotifications.propertyId, propertyId), eq(propertyIntakeNotifications.leaseToken, token)));
    return "error";
  }
}

export async function runPropertyIntakeNotificationSweep(now = new Date()) {
  const jobs = await db.select({ propertyId: propertyIntakeNotifications.propertyId })
    .from(propertyIntakeNotifications).where(eligible(now)).orderBy(asc(propertyIntakeNotifications.createdAt)).limit(50);
  let sent = 0;
  let errors = 0;
  for (const job of jobs) {
    const result = await deliverPropertyIntakeNotice(job.propertyId, now);
    if (result === "sent") sent++;
    if (result === "error") errors++;
  }
  return { checked: jobs.length, sent, errors };
}
