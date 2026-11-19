import { and, asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { notifyAgentPropertyIntake } from "./agent-notify";
import { addDaysYmd, todayStockholm } from "./date";
import { db as defaultDb } from "./db";
import type { DB } from "./mcp/shape";
import { isCurrentContentApproved, type ImageIdentity } from "./property-content-policy";
import { hasPropertyPostalCode } from "./property-postal";
import { validYmd } from "./rental-review-date";
import { owners, properties, propertyImages, propertyIntakeFollowUps, propertyNotes, type Property } from "./schema";

type FollowUp = typeof propertyIntakeFollowUps.$inferSelect;
type IntakeTx = Parameters<Parameters<DB["transaction"]>[0]>[0];

const MINUTE = 60_000;
const CHECK_INTERVAL = 5 * MINUTE;
const WEB_UPLOAD_WINDOW = 15 * MINUTE;
const PAUSED_INTERVAL = 24 * 60 * MINUTE;
const BATCH_SIZE = 12;

function nextWeekday(today: string) {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  return addDaysYmd(today, weekday === 5 ? 3 : weekday === 6 ? 2 : 1);
}

export async function startPropertyIntakeFollowUp(
  tx: IntakeTx,
  propertyId: string,
  source: FollowUp["source"],
  options: { web?: boolean; now?: Date } = {},
) {
  const now = options.now ?? new Date();
  await tx.insert(propertyIntakeFollowUps).values({
    propertyId,
    source,
    createdAt: now.toISOString(),
    nextCheckAt: new Date(now.getTime() + (options.web ? WEB_UPLOAD_WINDOW : CHECK_INTERVAL)).toISOString(),
    nextFollowUpOn: nextWeekday(todayStockholm(now)),
  }).onConflictDoNothing();
}

function missingIntakeDetails(property: Property, hasContact: boolean, images: ImageIdentity[], today: string) {
  const missing: string[] = [];
  if (!property.address?.trim() || !property.city?.trim() || !hasPropertyPostalCode(property.postalCode)) {
    missing.push("Adress, postnummer och ort");
  }
  if (!hasContact) missing.push("Kontaktuppgifter till uthyraren");
  if (property.bedrooms == null) missing.push("Antal sovrum");
  if (property.beds == null) missing.push("Antal sängplatser");
  if (property.egetBoende !== true) missing.push("Bekräfta att hela bostaden hyrs ut");

  const start = validYmd(property.moveInFrom) ? property.moveInFrom : null;
  const end = validYmd(property.availableTo) ? property.availableTo : null;
  const availabilityNote = property.availability?.trim() || property.notes?.match(/^- Tillgänglighetsnotis: (\S.*)$/m)?.[1];
  const occupied = property.status === "rented" || property.status === "reserved";
  if ((!start && !availabilityNote) || (occupied && !(start && start >= today) && !availabilityNote)
    || (end && (end < today || (start && end < start)))) {
    missing.push("Tillgänglighet för kommande uthyrning");
  }

  if (!images.length) missing.push("Bostadsbilder");
  else if (property.contentReviewStatus === "needs_review") missing.push("Granska uppgifterna och bilderna i CRM");
  else if (!isCurrentContentApproved(property, images)) missing.push("Inväntar kontroll av text och bilder");
  return missing;
}

function intakeFollowUpView(row: FollowUp) {
  return {
    source: row.source,
    status: row.status,
    missing: row.assessment?.missing ?? [],
    nextFollowUpOn: row.nextFollowUpOn,
  };
}

export type PropertyIntakeFollowUpView = ReturnType<typeof intakeFollowUpView>;

export async function getPropertyIntakeFollowUp(propertyId: string, db: DB = defaultDb) {
  const [row] = await db.select({ followUp: propertyIntakeFollowUps, address: properties.address, city: properties.city })
    .from(propertyIntakeFollowUps).innerJoin(properties, eq(properties.id, propertyIntakeFollowUps.propertyId))
    .where(eq(propertyIntakeFollowUps.propertyId, propertyId));
  return row ? { ...intakeFollowUpView(row.followUp), address: row.address, city: row.city } : null;
}

export async function listOpenPropertyIntakeFollowUps(db: DB, limit: number) {
  const rows = await db.select({ followUp: propertyIntakeFollowUps, address: properties.address, city: properties.city })
    .from(propertyIntakeFollowUps).innerJoin(properties, eq(properties.id, propertyIntakeFollowUps.propertyId))
    .where(inArray(propertyIntakeFollowUps.status, ["checking", "waiting"]))
    .orderBy(asc(propertyIntakeFollowUps.nextFollowUpOn), asc(propertyIntakeFollowUps.createdAt)).limit(limit);
  return rows.map(({ followUp, address, city }) => ({
    propertyId: followUp.propertyId, address, city, ...intakeFollowUpView(followUp),
  }));
}

async function checkIntake(
  job: FollowUp,
  now: Date,
  db: DB,
  notify: typeof notifyAgentPropertyIntake,
) {
  // Claim by the scheduled instant. A terminated run becomes eligible again
  // and retries its saved notice using the same idempotency key.
  const claimedUntil = new Date(now.getTime() + 2 * MINUTE).toISOString();
  const [claim] = await db.update(propertyIntakeFollowUps).set({ nextCheckAt: claimedUntil })
    .where(and(eq(propertyIntakeFollowUps.propertyId, job.propertyId), eq(propertyIntakeFollowUps.nextCheckAt, job.nextCheckAt!)))
    .returning({ id: propertyIntakeFollowUps.propertyId });
  if (!claim) return "skipped";
  const claimed = and(eq(propertyIntakeFollowUps.propertyId, job.propertyId), eq(propertyIntakeFollowUps.nextCheckAt, claimedUntil));

  const [[context], images, [reply]] = await Promise.all([
    db.select({ property: properties, phone: owners.phone, email: owners.email }).from(properties)
      .leftJoin(owners, eq(properties.ownerId, owners.id)).where(eq(properties.id, job.propertyId)),
    db.select({ id: propertyImages.id, key: propertyImages.key }).from(propertyImages)
      .where(eq(propertyImages.propertyId, job.propertyId)),
    db.select({ id: propertyNotes.id }).from(propertyNotes).where(and(
      eq(propertyNotes.propertyId, job.propertyId), eq(propertyNotes.source, "landlord_agent"),
      sql`datetime(${propertyNotes.createdAt}) >= datetime(${job.createdAt})`,
    )).orderBy(desc(propertyNotes.createdAt), desc(propertyNotes.id)).limit(1),
  ]);
  if (!context) return "skipped";

  const today = todayStockholm(now);
  const { property, phone, email } = context;
  const paused = property.status === "off_market";
  const missing = paused ? [] : missingIntakeDetails(property, Boolean(phone?.trim() || email?.trim()), images, today);
  const status = paused ? "paused" : missing.length ? "waiting" : "ready";
  const assessment = { missing, photoCount: images.length, replyId: reply?.id ?? null };
  const changed = status !== job.status || JSON.stringify(assessment) !== JSON.stringify(job.assessment);
  const nextFollowUpOn = status === "waiting" ? (changed ? nextWeekday(today) : job.nextFollowUpOn ?? nextWeekday(today)) : null;
  let notice = job.notice;
  if (paused) notice = null;
  else if (changed) {
    notice = { id: nanoid(), kind: reply && reply.id !== job.assessment?.replyId ? "reply" : "progress" };
  } else if (!notice && nextFollowUpOn && nextFollowUpOn <= today && job.remindedOn !== nextFollowUpOn) {
    const hour = now.toLocaleTimeString("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", hourCycle: "h23" });
    if (Number.parseInt(hour, 10) >= 9) notice = { id: nanoid(), kind: "due" };
  }

  const [saved] = await db.update(propertyIntakeFollowUps).set({ status, assessment, nextFollowUpOn, notice })
    .where(claimed).returning({ id: propertyIntakeFollowUps.propertyId });
  if (!saved) return "skipped";

  const delivery = notice ? await notify(job.propertyId, notice) : null;
  const acknowledged = delivery === "sent";
  const done = status === "ready" && (!notice || acknowledged);
  await db.update(propertyIntakeFollowUps).set({
    notice: acknowledged ? null : notice,
    remindedOn: acknowledged && notice?.kind === "due" ? nextFollowUpOn : job.remindedOn,
    nextCheckAt: done ? null : new Date(now.getTime() + (paused ? PAUSED_INTERVAL : CHECK_INTERVAL)).toISOString(),
  }).where(claimed);
  return delivery ?? "checked";
}

export async function runPropertyIntakeFollowUpSweep(
  options: { now?: Date; db?: DB; notify?: typeof notifyAgentPropertyIntake } = {},
) {
  const { now = new Date(), db = defaultDb, notify = notifyAgentPropertyIntake } = options;
  const jobs = await db.select().from(propertyIntakeFollowUps).where(lte(propertyIntakeFollowUps.nextCheckAt, now.toISOString()))
    .orderBy(asc(propertyIntakeFollowUps.nextCheckAt)).limit(BATCH_SIZE);
  const result = { checked: 0, sent: 0, disabled: 0, errors: 0 };
  for (const run of await Promise.allSettled(jobs.map((job) => checkIntake(job, now, db, notify)))) {
    if (run.status === "rejected") {
      console.error("Bostadsuppföljningen misslyckades", run.reason instanceof Error ? run.reason.message : "okänt fel");
      result.errors++;
    } else if (run.value !== "skipped") {
      result.checked++;
      if (run.value === "sent") result.sent++;
      if (run.value === "disabled") result.disabled++;
      if (run.value === "failed") result.errors++;
    }
  }
  return result;
}
