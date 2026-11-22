import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import { normalizePhoneE164 } from "./phone-links";
import * as schema from "./schema";
import { outboxMessages, owners, properties, type Owner } from "./schema";
import { homeownerLeadIntakeSms } from "./sms-templates";
import { buildHomeownerLeadConfirmationEmail } from "./homeowner-lead-email";

type DB = LibSQLDatabase<typeof schema>;

// Husägare som fyller i kortformuläret på /for-husagare skickas direkt vidare
// till hela bostadsregistreringen. Deras "registrera bostaden"-SMS och -mejl
// väntar i stället för att landa mitt i registreringen. Blir registreringen
// klar stoppas påminnelsen (createPropertyIntake), annars går den ut efter fördröjningen.
export const WAITING_FOR_INTAKE = "waiting_intake";
export const HOMEOWNER_NUDGE_DELAY_MS = 30 * 60 * 1000;

const sqliteTimestamp = (date: Date) => date.toISOString().replace("T", " ").slice(0, 19);

export function isHomeownerLeadForm(formType: string): formType is "homeowner" | "lp-homeowner" {
  return formType === "homeowner" || formType === "lp-homeowner";
}

export function shouldQueueHomeownerLeadIntakeSms(opts: {
  formType: string;
  hasCrmOwner: boolean;
  customerEmail?: string | null;
}): boolean {
  return opts.hasCrmOwner && isHomeownerLeadForm(opts.formType);
}

export async function queueHomeownerLeadIntakeSms(opts: {
  owner: Pick<Owner, "id" | "phone"> | null;
  fallbackPhone?: string | null;
  /** Husägaren fortsätter direkt till registreringen: vänta med SMS:et. */
  deferred?: boolean;
  db?: DB;
}): Promise<{ queued: boolean; messageId?: string; reason?: "missing_phone" | "duplicate_today" }> {
  const db = opts.db ?? defaultDb;
  const toPhone = normalizePhoneE164(opts.owner?.phone) ?? normalizePhoneE164(opts.fallbackPhone);
  if (!toPhone) return { queued: false, reason: "missing_phone" };

  const body = homeownerLeadIntakeSms();
  const [existing] = await db
    .select({ id: outboxMessages.id })
    .from(outboxMessages)
    .where(
      and(
        eq(outboxMessages.toPhone, toPhone),
        eq(outboxMessages.body, body),
        eq(outboxMessages.source, "intake"),
        sql`date(${outboxMessages.createdAt}) = date('now')`,
      ),
    )
    .limit(1);

  if (existing) return { queued: false, messageId: existing.id, reason: "duplicate_today" };

  const [row] = await db
    .insert(outboxMessages)
    .values({
      id: nanoid(),
      toPhone,
      body,
      status: opts.deferred ? WAITING_FOR_INTAKE : "queued",
      ownerId: opts.owner?.id ?? null,
      source: "intake",
    })
    .returning({ id: outboxMessages.id });

  return { queued: true, messageId: row.id };
}

type NudgeEmail = (to: string, email: ReturnType<typeof buildHomeownerLeadConfirmationEmail>) => Promise<void>;

async function sendNudgeEmail(to: string, email: ReturnType<typeof buildHomeownerLeadConfirmationEmail>) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>",
    to,
    replyTo: "kajsa@stayonsite.se",
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
  if (error) throw new Error("resend_error");
}

/**
 * Släpper väntande registreringspåminnelser (SMS + mejl) för husägare som inte
 * blivit klara inom fördröjningen. Den som hunnit registrera en bostad får
 * ingen påminnelse. Körs av cron var femte minut.
 */
export async function releaseDueHomeownerNudges(opts: { now?: Date; db?: DB; sendEmail?: NudgeEmail } = {}) {
  const db = opts.db ?? defaultDb;
  const sendEmail = opts.sendEmail ?? sendNudgeEmail;
  const cutoff = sqliteTimestamp(new Date((opts.now ?? new Date()).getTime() - HOMEOWNER_NUDGE_DELAY_MS));
  const due = await db.select().from(outboxMessages)
    .where(and(eq(outboxMessages.source, "intake"), eq(outboxMessages.status, WAITING_FOR_INTAKE), lt(outboxMessages.createdAt, cutoff)))
    .orderBy(asc(outboxMessages.createdAt)).limit(50);

  let released = 0;
  let cancelled = 0;
  let emailErrors = 0;
  for (const message of due) {
    // Skydd om registreringen kopplades till uthyraren utan att påminnelsen stoppades.
    const [registered] = message.ownerId
      ? await db.select({ id: properties.id }).from(properties)
        .where(and(eq(properties.ownerId, message.ownerId), gte(properties.createdAt, message.createdAt ?? cutoff))).limit(1)
      : [];
    const [row] = await db.update(outboxMessages)
      .set(registered ? { status: "cancelled", error: "Bostaden har redan registrerats." } : { status: "queued" })
      .where(and(eq(outboxMessages.id, message.id), eq(outboxMessages.status, WAITING_FOR_INTAKE)))
      .returning({ id: outboxMessages.id });
    if (!row) continue; // en annan körning hann före
    if (registered) {
      cancelled += 1;
      continue;
    }
    released += 1;
    if (!message.ownerId) continue;
    const [owner] = await db.select({ email: owners.email }).from(owners).where(eq(owners.id, message.ownerId));
    if (!owner?.email) continue;
    try {
      await sendEmail(owner.email, buildHomeownerLeadConfirmationEmail("sv"));
    } catch {
      emailErrors += 1;
      console.error("Homeowner registration reminder email failed", { messageId: message.id });
    }
  }
  return { released, cancelled, emailErrors };
}
