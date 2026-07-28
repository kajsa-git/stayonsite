// Påminnelser för osignerade uthyrningsuppdrag från bostadsregistreringen.
//
// Del 2 av /registrera-bostad (signeringen) kan hoppas över — kvar finns då en
// fristående uthyrarlänk (audience landlord, owner_id satt, created_by NULL =
// skapad av intagsflödet, inte av en CRM-användare) utan giltig acceptans.
// Cron:en app/api/cron/agreement-reminders kör svepet dagligen:
//
//   påminnelse 1 (mejl): tidigast 2 dagar efter att länken skapades
//   påminnelse 2 (mejl): tidigast 7 dagar efter påminnelse 1 — sedan aldrig mer
//
// Uthyrare utan e-postadress kan inte mejlas — de bumpas EN gång in i
// uppföljningskön (owners.followUpDate) så Kajsa kan skicka länken via SMS,
// och loggas med channel "crm_followup". Varje utskick loggas i
// crm_agreement_reminders; signerat uppdrag ⇒ uthyraren lämnar svepet av sig själv.
import { and, desc, eq, isNull } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { isAcceptanceValid, UTHYRNINGSUPPDRAG } from "./avtal";
import { todayStockholm } from "./date";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { agreementAcceptances, agreementReminders, owners, shareLinks, type Owner, type ShareLink } from "./schema";

// Injicerbar DB (som cascade-delete.ts) så svepet kan enhetstestas mot en
// tempfils-libSQL med det riktiga, migrerade schemat.
type DB = LibSQLDatabase<typeof schema>;

const DAY_MS = 24 * 60 * 60 * 1000;
export const FIRST_REMINDER_AFTER_DAYS = 2;
export const SECOND_REMINDER_AFTER_DAYS = 7;
export const MAX_EMAIL_REMINDERS = 2;

export interface ReminderEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface ReminderSweepSummary {
  checked: number; // kandidatlänkar (osignerade intags-uthyrare)
  emailed: number;
  followUps: number; // utan e-post → bumpade till uppföljningskön
  errors: number;
}

// SQLite:s datetime('now') ger "YYYY-MM-DD HH:MM:SS" i UTC; sent_at skrivs som ISO.
function parseDbTimestamp(value: string): number {
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Date(iso).getTime();
}

function firstName(name: string | null): string {
  return name?.trim().split(/\s+/)[0] || "";
}

// Mejlcopyn följer textriktlinjerna: konkret, inga överdrifter. Kärnbudskapet
// speglar avtalets icke-exklusivitet — det ska kännas riskfritt att godkänna.
export function buildReminderEmail(owner: Owner, token: string, reminderNo: number): ReminderEmail {
  const url = `https://www.stayonsite.se/uthyrare/${token}`;
  const namn = firstName(owner.name);
  const greeting = namn ? `Hej ${namn},` : "Hej,";
  const opening =
    reminderNo === 1
      ? "Tack för att du registrerade din bostad hos StayOnSite. Ett steg återstår: att godkänna uthyrningsuppdraget."
      : "En sista påminnelse: uthyrningsuppdraget för din registrerade bostad väntar fortfarande på ditt godkännande.";

  const text = [
    greeting,
    "",
    opening,
    "",
    "Uppdraget är kostnadsfritt och inte exklusivt — du förbinder dig inte att hyra ut något, och utan förmedlad hyresgäst har du inga åtaganden.",
    "",
    `Godkänn här: ${url}`,
    "",
    "Har du frågor? Svara på det här mejlet eller ring Kajsa på 076-249 84 86.",
    "",
    "Vänliga hälsningar",
    "StayOnSite",
  ].join("\n");

  const html = [
    `<p>${greeting}</p>`,
    `<p>${opening}</p>`,
    "<p>Uppdraget är kostnadsfritt och inte exklusivt — du förbinder dig inte att hyra ut något, och utan förmedlad hyresgäst har du inga åtaganden.</p>",
    `<p><a href="${url}" style="display:inline-block;background:#ff6300;color:#ffffff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600">Godkänn uthyrningsuppdraget</a></p>`,
    `<p>Fungerar inte knappen? Öppna länken direkt: <a href="${url}">${url}</a></p>`,
    "<p>Har du frågor? Svara på det här mejlet eller ring Kajsa på 076-249 84 86.</p>",
    "<p>Vänliga hälsningar<br>StayOnSite</p>",
  ].join("\n");

  return {
    to: owner.email!,
    subject: reminderNo === 1 ? "Ett steg kvar — godkänn uthyrningsuppdraget" : "Påminnelse: godkänn uthyrningsuppdraget",
    text,
    html,
  };
}

async function sendViaResend(mail: ReminderEmail): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>",
    to: mail.to,
    replyTo: "kajsa@stayonsite.se",
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
  if (error) throw new Error(`resend_error: ${JSON.stringify(error)}`);
}

async function hasValidAcceptance(db: DB, ownerId: string): Promise<boolean> {
  const [latest] = await db
    .select()
    .from(agreementAcceptances)
    .where(
      and(eq(agreementAcceptances.ownerId, ownerId), eq(agreementAcceptances.agreementType, UTHYRNINGSUPPDRAG.type))
    )
    .orderBy(desc(agreementAcceptances.acceptedAt))
    .limit(1);
  return isAcceptanceValid(latest, UTHYRNINGSUPPDRAG);
}

// Bumpa in uthyraren i uppföljningskön utan att stampa på en uppföljning som
// redan ligger i framtiden (manuellt satt av Kajsa).
async function bumpOwnerFollowUp(db: DB, owner: Owner): Promise<void> {
  const today = todayStockholm();
  if (owner.followUpDate && owner.followUpDate > today) return;
  await db
    .update(owners)
    .set({
      followUpDate: today,
      followUpReason: "Uthyrningsuppdrag ej signerat — skicka signeringslänken (ingen e-post)",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(owners.id, owner.id));
}

export async function runAgreementReminderSweep(opts?: {
  now?: Date;
  sendEmail?: (mail: ReminderEmail) => Promise<void>;
  db?: DB;
}): Promise<ReminderSweepSummary> {
  const db = opts?.db ?? defaultDb;
  const now = (opts?.now ?? new Date()).getTime();
  const sendEmail = opts?.sendEmail ?? sendViaResend;
  const summary: ReminderSweepSummary = { checked: 0, emailed: 0, followUps: 0, errors: 0 };

  const rows: { link: ShareLink; owner: Owner }[] = await db
    .select({ link: shareLinks, owner: owners })
    .from(shareLinks)
    .innerJoin(owners, eq(owners.id, shareLinks.ownerId))
    .where(
      and(
        eq(shareLinks.audience, "landlord"),
        isNull(shareLinks.revokedAt),
        isNull(shareLinks.createdBy), // skapad av intagsflödet — CRM-skickade länkar påminner Kajsa om själv
        eq(owners.ownerType, "privatperson")
      )
    );

  // ensureShareLink håller en aktiv länk per uthyrare, men var defensiv: en svep-runda per uthyrare.
  const seenOwners = new Set<string>();

  for (const { link, owner } of rows) {
    if (seenOwners.has(owner.id)) continue;
    seenOwners.add(owner.id);

    try {
      if (await hasValidAcceptance(db, owner.id)) continue;
      summary.checked += 1;

      const reminders = await db
        .select()
        .from(agreementReminders)
        .where(eq(agreementReminders.ownerId, owner.id));

      const linkCreatedAt = link.createdAt ? parseDbTimestamp(link.createdAt) : now;

      if (!owner.email) {
        // Kan inte mejlas — in i uppföljningskön en gång, efter samma väntetid som påminnelse 1.
        if (reminders.some((r) => r.channel === "crm_followup")) continue;
        if (now - linkCreatedAt < FIRST_REMINDER_AFTER_DAYS * DAY_MS) continue;
        await bumpOwnerFollowUp(db, owner);
        await db.insert(agreementReminders).values({
          id: nanoid(),
          ownerId: owner.id,
          shareLinkId: link.id,
          channel: "crm_followup",
          recipient: null,
          reminderNo: 1,
          sentAt: new Date(now).toISOString(),
        });
        summary.followUps += 1;
        continue;
      }

      const emailReminders = reminders
        .filter((r) => r.channel === "email")
        .sort((a, b) => parseDbTimestamp(a.sentAt) - parseDbTimestamp(b.sentAt));
      if (emailReminders.length >= MAX_EMAIL_REMINDERS) continue;

      const anchor = emailReminders.length === 0
        ? linkCreatedAt
        : parseDbTimestamp(emailReminders[emailReminders.length - 1].sentAt);
      const waitDays = emailReminders.length === 0 ? FIRST_REMINDER_AFTER_DAYS : SECOND_REMINDER_AFTER_DAYS;
      if (now - anchor < waitDays * DAY_MS) continue;

      const reminderNo = emailReminders.length + 1;
      await sendEmail(buildReminderEmail(owner, link.token, reminderNo));
      await db.insert(agreementReminders).values({
        id: nanoid(),
        ownerId: owner.id,
        shareLinkId: link.id,
        channel: "email",
        recipient: owner.email,
        reminderNo,
        sentAt: new Date(now).toISOString(),
      });
      summary.emailed += 1;
    } catch (error) {
      // En trasig uthyrare (t.ex. studsande mejl) får inte stoppa resten av svepet.
      console.error(`Agreement reminder failed for owner ${owner.id}`, error);
      summary.errors += 1;
    }
  }

  return summary;
}
