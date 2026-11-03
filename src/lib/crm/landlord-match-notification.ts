import { and, eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { createHash } from "node:crypto";
import { db as defaultDb } from "./db";
import { GmailAuthError, gmailAutomationUserId, gmailSend } from "./gmail";
import { buildLandlordMatchMessages } from "./landlord-match-message";
import type { LandlordMatchStatus } from "./landlord-match-status";
import { normalizePhoneE164 } from "./phone-links";
import * as schema from "./schema";
import { emails, matchEvents, matches, outboxMessages, owners, properties, requests } from "./schema";

type DB = LibSQLDatabase<typeof schema>;
type Message = { to: string; subject: string; text: string };
type SendMail = (message: Message) => Promise<{ authorId: string; messageId: string; threadId: string }>;

async function sendMail(message: Message) {
  const authorId = await gmailAutomationUserId();
  const from = process.env.CRM_FROM ?? "kajsa@stayonsite.se";
  const result = await gmailSend(authorId, { ...message, from: `Kajsa <${from}>` });
  return { authorId, ...result };
}

export class MatchCreationError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function createMatchWithLandlordNotification(
  input: { requestId: string; propertyId: string; status?: string; matchScore?: number | null; notes?: string | null },
  options?: { db?: DB; sendEmail?: SendMail },
) {
  const db = options?.db ?? defaultDb;
  const sendEmail = options?.sendEmail ?? sendMail;
  // Matchning, sms-kö och händelsen skapas atomiskt. Ett omförsök på samma
  // kombination kan därmed aldrig skapa ett andra utskick.
  const created = await db.transaction(async (tx) => {
    const [dupe] = await tx.select({ id: matches.id }).from(matches)
      .where(and(eq(matches.requestId, input.requestId), eq(matches.propertyId, input.propertyId))).limit(1);
    if (dupe) throw new MatchCreationError("Already suggested", 409);
    const [request] = await tx.select().from(requests).where(eq(requests.id, input.requestId)).limit(1);
    const [property] = await tx.select().from(properties).where(eq(properties.id, input.propertyId)).limit(1);
    if (!request || !property) throw new MatchCreationError("Förfrågan eller bostad finns inte", 404);
    const [owner] = property.ownerId
      ? await tx.select().from(owners).where(eq(owners.id, property.ownerId)).limit(1)
      : [];
    const id = nanoid();
    const [match] = await tx.insert(matches).values({
      id, requestId: input.requestId, propertyId: input.propertyId,
      status: input.status ?? "suggested", matchScore: input.matchScore ?? null, notes: input.notes ?? null,
    }).returning();
    const built = owner ? buildLandlordMatchMessages(request, property, owner) : null;
    const phone = owner ? normalizePhoneE164(owner.phone) : null;
    const recipient = owner?.email?.trim() ?? "";
    const validEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient) ? recipient : null;
    const smsStatus = !phone ? "missing_phone" : built!.sms.length > 1600 ? "too_long" : "queued";
    const smsId = smsStatus === "queued" ? `landlord-match-${id}` : null;
    if (smsId && phone && built && owner) {
      await tx.insert(outboxMessages).values({
        id: smsId, toPhone: phone, body: built.sms, ownerId: owner.id,
        status: "queued", source: "landlord_match",
      });
    }
    // En stabil primärnyckel skyddar även samtidiga anrop från olika serverinstanser.
    const eventId = `landlord-match-${createHash("sha256").update(input.requestId).update("\0").update(input.propertyId).digest("hex")}`;
    const eventData = {
      smsId, smsStatus, emailStatus: validEmail && built ? "pending" : "missing_email",
      ownerId: owner?.id ?? null, emailTo: validEmail, emailSubject: built?.subject ?? null, emailBody: built?.email ?? null,
    };
    await tx.insert(matchEvents).values({ id: eventId, matchId: id, requestId: input.requestId, actor: "internal", type: "landlord_match_notification", data: eventData });
    return { match, eventId, eventData, built, recipient: validEmail, ownerId: owner?.id ?? null };
  });

  let emailStatus = created.eventData.emailStatus;
  if (created.recipient && created.built && created.ownerId) {
    let delivery: Awaited<ReturnType<SendMail>> | null = null;
    try {
      delivery = await sendEmail({ to: created.recipient, subject: created.built.subject, text: created.built.email });
      emailStatus = "sent";
    } catch (error) {
      // Ett nätverksfel kan inträffa efter att Gmail tagit emot meddelandet.
      // Försök inte igen automatiskt när leveransen är osäker.
      emailStatus = error instanceof GmailAuthError ? "failed" : "unknown";
      console.error("Landlord match email:", error);
    }
    if (delivery) {
      try {
        await db.insert(emails).values({
          id: nanoid(), requestId: input.requestId, ownerId: created.ownerId,
          direction: "out", subject: created.built.subject, body: created.built.email,
          fromEmail: process.env.CRM_FROM ?? "kajsa@stayonsite.se", toEmail: created.recipient,
          authorId: delivery.authorId, gmailMessageId: delivery.messageId, gmailThreadId: delivery.threadId,
          sentAt: new Date().toISOString(),
        }).onConflictDoNothing();
      } catch (error) {
        // Gmail har redan skickat: ett loggfel får aldrig utlösa omskick.
        console.error("Landlord match email log:", error);
      }
    }
    try {
      await db.update(matchEvents).set({ data: { ...created.eventData, emailStatus } }).where(eq(matchEvents.id, created.eventId));
    } catch (error) {
      // Händelsen ligger kvar i "pending", vilket UI:t visar som osäker status.
      console.error("Landlord match email status:", error);
    }
  }
  const landlordNotification: LandlordMatchStatus = { sms: created.eventData.smsStatus, email: emailStatus };
  return { ...created.match, landlordNotification };
}
