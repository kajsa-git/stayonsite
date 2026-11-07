import { and, eq, sql } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "./db";
import { landlordAgentHealth } from "./schema";

const mailbox = process.env.CRM_FROM ?? "kajsa@stayonsite.se";

async function sendSelfNotice(subject: string, text: string, idempotencyKey: string) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) throw new Error("Aviseringstjänsten är inte konfigurerad.");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: process.env.RESEND_FROM, to: mailbox, subject, text }, { idempotencyKey });
  if (result.error || !result.data?.id) throw new Error("Aviseringen kunde inte skickas.");
}

// A different provider is used so a Gmail outage can still be reported. The
// idempotency key makes a retry after a timeout safe; content remains constant.
export async function sendLandlordReviewNotice(propertyId: string, gmailMessageId: string) {
  await sendSelfNotice("En bostadsdialog behöver din kontroll",
    `Hej Kajsa!\n\nEn automatisk bostadsdialog behöver din kontroll. Öppna CRM för att se kontakten och om det finns bilagor att hämta.\n\nhttps://www.stayonsite.se/crm/properties?id=${encodeURIComponent(propertyId)}\n\nOm leveransen är oklar, kontrollera mejltråden innan du skickar ett nytt svar.`,
    `landlord-review/${gmailMessageId}`);
}

export async function sendLandlordSmsReviewNotice(propertyId: string, guid: string) {
  await sendSelfNotice("En SMS-dialog om en bostad behöver din kontroll",
    `Hej Kajsa!\n\nEn automatisk SMS-dialog behöver din kontroll. Öppna CRM och kontrollera meddelandena innan du skickar ett nytt svar.\n\nhttps://www.stayonsite.se/crm/properties?id=${encodeURIComponent(propertyId)}`,
    `landlord-sms-review/${guid}`);
}

export async function sendLandlordSmsAttachmentNotice(propertyId: string, guid: string) {
  await sendSelfNotice("En SMS-bilaga från en uthyrare behöver din kontroll",
    `Hej Kajsa!\n\nEn uthyrardialog innehåller en bilaga som inte har importerats automatiskt. Kontrollera meddelandet och lägg in relevanta bilder i CRM.\n\nhttps://www.stayonsite.se/crm/properties?id=${encodeURIComponent(propertyId)}`,
    `landlord-sms-attachment/${guid}`);
}

export async function sendLandlordImageReviewNotice(propertyId: string, replyRunId: string) {
  await sendSelfNotice("Bilder från en uthyrare behöver din kontroll",
    `Hej Kajsa!\n\nEtt eller flera möjliga bostadsbilder behöver din kontroll innan de läggs in i bildgalleriet. Öppna bostaden i CRM.\n\nhttps://www.stayonsite.se/crm/properties?id=${encodeURIComponent(propertyId)}`,
    `landlord-image-review/${replyRunId}`);
}

export async function sendLandlordFollowUpQuestion(propertyId: string, channel: "mejl" | "sms", sourceId: string) {
  await sendSelfNotice("Hur vill du följa upp uthyrarkontakten?",
    `Hej Kajsa!\n\nEtt automatiskt ${channel}-svar har skickats om en bostad.${channel === "sms" ? " SMS-leveransen är inte alltid bekräftad." : ""} Vill du att uthyrarkontakten ska ligga kvar i dialog, klarmarkeras eller få ett nytt uppföljningsdatum?\n\nhttps://www.stayonsite.se/crm/properties?id=${encodeURIComponent(propertyId)}`,
    `landlord-followup/${channel}/${sourceId}`);
}

export async function recordLandlordSweepSuccess(kind: "minute" | "full" | "sms" | "images") {
  const now = new Date().toISOString();
  await db.insert(landlordAgentHealth).values({ id: kind, lastSuccessAt: now })
    .onConflictDoUpdate({ target: landlordAgentHealth.id, set: {
      lastSuccessAt: now, failureStartedAt: null, alertSentAt: null,
    } });
}

export async function recordLandlordSweepFailure(kind: "minute" | "full" | "sms" | "images") {
  const now = new Date().toISOString();
  let startedAt: string | null = null;
  try {
    const [health] = await db.insert(landlordAgentHealth).values({ id: kind, lastErrorAt: now, failureStartedAt: now })
      .onConflictDoUpdate({ target: landlordAgentHealth.id, set: {
        lastErrorAt: now, failureStartedAt: sql`coalesce(${landlordAgentHealth.failureStartedAt}, ${now})`,
      } }).returning();
    if (health.alertSentAt) return;
    startedAt = health.failureStartedAt;
  } catch {
    // If the database itself is unavailable, still try to alert once per day.
    startedAt = `database-${now.slice(0, 10)}`;
  }
  const incident = startedAt ?? now;
  await sendSelfNotice(kind === "sms" ? "SMS-bevakningen för bostäder behöver kontroll" : kind === "images" ? "Bildhanteringen för bostäder behöver kontroll" : "Mejlbevakningen för bostäder behöver kontroll",
    kind === "sms" ? "Hej Kajsa!\n\nDen automatiska SMS-bevakningen för bostadsdialoger har stött på ett fel och kan ha missat svar. Kontrollera meddelandena och CRM tills felet är löst."
      : kind === "images" ? "Hej Kajsa!\n\nDen automatiska bildhanteringen för bostadsdialoger har stött på ett fel. Kontrollera nya bilder i mejlen tills felet är löst."
      : "Hej Kajsa!\n\nDen automatiska mejlbevakningen för bostadsdialoger har stött på ett fel och kan ha missat svar. Kontrollera mejlen och CRM tills felet är löst.",
    `landlord-sweep/${kind}/${incident}`);
  if (!incident.startsWith("database-")) {
    await db.update(landlordAgentHealth).set({ alertSentAt: new Date().toISOString() }).where(and(
      eq(landlordAgentHealth.id, kind), eq(landlordAgentHealth.failureStartedAt, incident),
    ));
  }
}
