import { createHash } from "node:crypto";
import { and, asc, desc, eq, inArray, isNull, lt, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { emails, landlordDialogs, landlordImageCandidates, landlordReplyRuns, owners, properties, propertyImages, propertyNotes } from "./schema";
import { gmailAutomationUserId, gmailGetThread, gmailRecentThreadMessages, gmailSend, gmailThreadReplyHeaders } from "./gmail";
import { asksToStopContact, currentLandlordTurn, eligibleLandlordReply, isAcknowledgementOnly, mailboxAddress, stripLandlordQuote } from "./landlord-dialog-policy";
import { planLandlordReply, propertyPatchFromFacts } from "./landlord-dialog-model";
import { indexProperty } from "./search-index";
import { sendLandlordReviewNotice } from "./landlord-dialog-alerts";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "./landlord-property-lock";

const MAILBOX = process.env.CRM_FROM ?? "kajsa@stayonsite.se";

type Dialog = typeof landlordDialogs.$inferSelect;

async function markForReview(messageId: string, error: string, status: "needs_review" | "send_uncertain" = "needs_review") {
  await db.update(landlordReplyRuns).set({
    status, error: error.slice(0, 1000), updatedAt: new Date().toISOString(),
  }).where(eq(landlordReplyRuns.gmailMessageId, messageId));
}

async function notifyReview(dialog: Dialog) {
  const pending = await db.select().from(landlordReplyRuns).where(and(
    eq(landlordReplyRuns.dialogId, dialog.id),
    or(inArray(landlordReplyRuns.status, ["claimed", "sending", "send_uncertain", "needs_review"]),
      eq(landlordReplyRuns.attachmentsNeedReview, true)),
    isNull(landlordReplyRuns.reviewNoticeAttemptedAt),
  ));
  for (const run of pending) {
    await sendLandlordReviewNotice(dialog.propertyId, run.gmailMessageId);
    await db.update(landlordReplyRuns).set({ reviewNoticeAttemptedAt: new Date().toISOString() })
      .where(and(eq(landlordReplyRuns.gmailMessageId, run.gmailMessageId), isNull(landlordReplyRuns.reviewNoticeAttemptedAt)));
  }
}

type DialogOutcome = "none" | "sent" | "review" | "defer";

async function processDialogInner(dialog: Dialog, userId: string): Promise<DialogOutcome> {
  const messages = await gmailGetThread(userId, dialog.gmailThreadId);
  if (messages.some((message) => message.labelIds?.includes("DRAFT"))) return "defer";
  const incoming = eligibleLandlordReply(messages, dialog.landlordEmail, MAILBOX, dialog.enrolledAt);
  if (!incoming) return "none";
  const turn = currentLandlordTurn(messages, dialog.landlordEmail, MAILBOX, dialog.enrolledAt);
  if (turn.length && turn.every((message) => {
    const text = stripLandlordQuote(message.text ?? "");
    return isAcknowledgementOnly(text) && !message.possibleImageAttachments;
  })) return "none";
  const now = new Date().toISOString();
  // Gmail and Pub/Sub may retry; the unique key makes the claim atomic.
  const claim = await db.insert(landlordReplyRuns).values({
    gmailMessageId: incoming.id, dialogId: dialog.id, status: "claimed", createdAt: now, updatedAt: now,
  }).onConflictDoNothing().returning({ id: landlordReplyRuns.gmailMessageId });
  if (!claim.length) return "none";

  let sendStarted = false;
  try {
    if (!turn.length) throw new Error("Flera avsändare finns i dialogen; kontrollera mottagare manuellt.");
    if (turn.some((message) => !stripLandlordQuote(message.text ?? "") && message.html)) {
      throw new Error("Mejlet saknar läsbar textversion; kontrollera innehållet i Gmail.");
    }
    const [property] = await db.select().from(properties).where(and(
      eq(properties.id, dialog.propertyId), eq(properties.ownerId, dialog.ownerId),
    )).limit(1);
    const [owner] = await db.select().from(owners).where(eq(owners.id, dialog.ownerId)).limit(1);
    if (!property || !owner || mailboxAddress(owner.email ?? "") !== mailboxAddress(dialog.landlordEmail)) {
      throw new Error("Uthyraren eller objektkopplingen har ändrats; kontrollera manuellt.");
    }
    const pictures = await db.select({ id: propertyImages.id }).from(propertyImages)
      .where(eq(propertyImages.propertyId, property.id));
    const priorNotes = await db.select({ content: propertyNotes.content }).from(propertyNotes)
      .where(eq(propertyNotes.propertyId, property.id)).orderBy(desc(propertyNotes.createdAt)).limit(10);
    const reply = turn.map((message) => stripLandlordQuote(message.text)).filter(Boolean).join("\n\n");
    if (asksToStopContact(reply)) throw new Error("Uthyraren har bett att kontakten ska upphöra.");
    const possibleImageAttachments = turn.reduce((count, message) => count + (message.possibleImageAttachments ?? 0), 0);
    const candidates = turn.flatMap((message) => (message.imageAttachments ?? []).map((attachment) => ({ messageId: message.id, ...attachment }))).slice(0, 20);
    const plan = await planLandlordReply({
      ownerName: owner.name,
      property: {
        address: property.address, city: property.city, squareMeters: property.squareMeters,
        bedrooms: property.bedrooms, beds: property.beds, bathrooms: property.bathrooms,
        furnished: property.furnished, kitchen: property.kitchen, broadband: property.broadband,
        washingMachines: property.washingMachines, dryers: property.dryers, dishwasher: property.dishwasher,
        parkingSpaces: property.parkingSpaces, rentIn: property.rentIn, excludedNote: property.excludedNote,
        notes: property.notes, contactHistory: priorNotes.reverse().map((note) => note.content).join("\n\n").slice(-8000),
        pictureCount: pictures.length,
      },
      conversation: messages.slice(-10).map((m) => `${m.from}:\n${stripLandlordQuote(m.text)}`).join("\n\n"),
      newReply: reply, possibleImageAttachments,
    });

    // Never affect a live listing or wake automatic publication. In all other
    // cases the original information remains available in the property note.
    const savedContext = await db.transaction(async (tx) => {
      for (const message of turn) {
        await tx.insert(emails).values({
          id: nanoid(), ownerId: owner.id, direction: "in", subject: message.subject,
          body: stripLandlordQuote(message.text), html: message.html, fromEmail: message.from, toEmail: message.to,
          gmailMessageId: message.id, gmailThreadId: message.threadId, isRead: false,
          sentAt: message.internalDate ? new Date(Number(message.internalDate)).toISOString() : new Date(message.date).toISOString(),
        }).onConflictDoNothing();
      }
      await tx.insert(propertyNotes).values({
        id: nanoid(), propertyId: property.id, channel: "mail", source: "landlord_agent",
        content: [`Nytt svar från uthyraren (Gmail).`, `Källa: https://mail.google.com/mail/u/0/#all/${incoming.threadId}`,
          possibleImageAttachments ? `${possibleImageAttachments} möjliga bildbilagor finns i mejlet; de är inte importerade till CRM.` : "",
          "", "Uthyrarens svar:", reply, "", "Maskinell sammanfattning – kontrollera mot källan:", plan.summary].join("\n"),
      });
      if (candidates.length) await tx.insert(landlordImageCandidates).values(candidates.map((attachment) => ({
        id: nanoid(), propertyId: property.id, gmailMessageId: attachment.messageId, replyRunId: incoming.id,
        attachmentId: attachment.attachmentId, fileName: attachment.fileName, mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes, status: "pending", createdAt: now, updatedAt: now,
      }))).onConflictDoNothing();
      const [currentProperty] = await tx.select().from(properties).where(and(
        eq(properties.id, property.id), eq(properties.ownerId, owner.id),
      )).limit(1);
      const changed = !currentProperty || currentProperty.updatedAt !== property.updatedAt;
      const mayEdit = currentProperty && !changed && !currentProperty.published && !currentProperty.prospektPublished && !currentProperty.autoPublishEnabled;
      const patch = mayEdit ? propertyPatchFromFacts(plan.facts, currentProperty, reply) : {};
      if (Object.keys(patch).length) await tx.update(properties).set({
        ...patch, updatedAt: now, contentReviewHash: null,
        contentReviewStatus: currentProperty?.contentReviewStatus === "checking" ? "checking" : "pending",
      }).where(eq(properties.id, property.id));
      await tx.update(landlordReplyRuns).set({
        draftBody: plan.reply || null, attachmentsNeedReview: possibleImageAttachments > candidates.length, updatedAt: new Date().toISOString(),
      }).where(eq(landlordReplyRuns.gmailMessageId, incoming.id));
      return { changed, updated: Object.keys(patch).length > 0, updatedAt: Object.keys(patch).length > 0 ? now : currentProperty?.updatedAt ?? null };
    });
    if (savedContext.updated) await indexProperty(property.id).catch((error) => console.error("landlord search index:", error));
    if (savedContext.changed) {
      await markForReview(incoming.id, "Bostadens uppgifter ändrades medan svaret förbereddes.");
      return "review";
    }
    if (plan.action !== "reply") {
      await markForReview(incoming.id, "Svaret behöver Kajsas bedömning innan kontakt.");
      return "review";
    }

    // Recheck just before sending: do not answer an already handled message or
    // an inactive dialog. A concurrent new message must be handled separately.
    const [current] = await db.select({ active: landlordDialogs.active }).from(landlordDialogs)
      .where(eq(landlordDialogs.id, dialog.id)).limit(1);
    const [currentOwner] = await db.select({ email: owners.email }).from(owners).where(eq(owners.id, dialog.ownerId)).limit(1);
    const [currentProperty] = await db.select({ id: properties.id, updatedAt: properties.updatedAt }).from(properties).where(and(
      eq(properties.id, dialog.propertyId), eq(properties.ownerId, dialog.ownerId),
    )).limit(1);
    if (!currentProperty || currentProperty.updatedAt !== savedContext.updatedAt || mailboxAddress(currentOwner?.email ?? "") !== mailboxAddress(dialog.landlordEmail)) {
      await markForReview(incoming.id, "Uthyraren eller objektkopplingen har ändrats medan svaret förbereddes.");
      return "review";
    }
    const latest = eligibleLandlordReply(await gmailGetThread(userId, dialog.gmailThreadId), dialog.landlordEmail, MAILBOX, dialog.enrolledAt);
    if (!current?.active || latest?.id !== incoming.id) {
      await db.update(landlordReplyRuns).set({ status: "resolved", error: "Dialogen ändrades medan svaret förbereddes.", updatedAt: new Date().toISOString() })
        .where(eq(landlordReplyRuns.gmailMessageId, incoming.id));
      return "none";
    }
    const headers = await gmailThreadReplyHeaders(userId, dialog.gmailThreadId, incoming.id);
    if (!headers.inReplyTo) {
      await markForReview(incoming.id, "Kunde inte bekräfta svarstrådens meddelande-id.");
      return "review";
    }
    const reserved = await db.update(landlordReplyRuns).set({ status: "sending", updatedAt: new Date().toISOString() })
      .where(and(eq(landlordReplyRuns.gmailMessageId, incoming.id), eq(landlordReplyRuns.status, "claimed")))
      .returning({ id: landlordReplyRuns.gmailMessageId });
    if (!reserved.length) return "review";

    // Once the send starts it is never retried automatically: a timeout may
    // mean Gmail accepted the message even though no response was received.
    sendStarted = true;
    const sent = await gmailSend(userId, {
      from: `Kajsa Sihlén <${mailboxAddress(MAILBOX)}>`, to: dialog.landlordEmail,
      subject: /^\s*(re|sv|aw):/i.test(incoming.subject) ? incoming.subject : `Re: ${incoming.subject}`,
      text: plan.reply.trim(), threadId: dialog.gmailThreadId,
      inReplyTo: headers.inReplyTo, references: headers.references,
    });
    await db.transaction(async (tx) => {
      await tx.insert(emails).values({
        id: nanoid(), ownerId: owner.id, direction: "out", subject: incoming.subject,
        body: plan.reply.trim(), fromEmail: mailboxAddress(MAILBOX), toEmail: dialog.landlordEmail,
        gmailMessageId: sent.messageId, gmailThreadId: sent.threadId, isRead: true,
        authorId: userId, sentAt: new Date().toISOString(),
      }).onConflictDoNothing();
      await tx.update(landlordReplyRuns).set({ status: "sent", outboundGmailMessageId: sent.messageId,
        error: null, updatedAt: new Date().toISOString() }).where(eq(landlordReplyRuns.gmailMessageId, incoming.id));
    });
    return "sent";
  } catch (error) {
    await markForReview(incoming.id, error instanceof Error ? error.message : "Okänt fel.", sendStarted ? "send_uncertain" : "needs_review");
    return "review";
  }
}

async function processDialog(dialog: Dialog, userId: string): Promise<DialogOutcome> {
  const now = new Date();
  const token = nanoid();
  const [lock] = await db.update(landlordDialogs).set({
    leaseToken: token, leaseUntil: new Date(now.getTime() + 120_000).toISOString(),
  }).where(and(eq(landlordDialogs.id, dialog.id), eq(landlordDialogs.active, true),
    or(isNull(landlordDialogs.leaseUntil), lt(landlordDialogs.leaseUntil, now.toISOString())))).returning({ id: landlordDialogs.id });
  if (!lock) return "defer"; // Another scheduled run is already handling it.
  let propertyLock: string | null = null;
  try {
    propertyLock = await acquireLandlordPropertyLock(dialog.propertyId);
    if (!propertyLock) return "defer";
    // A crashed or uncertain send is never repeated or followed by a new
    // automated reply until a person has checked what actually happened.
    const [unresolved] = await db.select({ id: landlordReplyRuns.gmailMessageId }).from(landlordReplyRuns)
      .where(and(eq(landlordReplyRuns.dialogId, dialog.id), inArray(landlordReplyRuns.status, ["claimed", "sending", "send_uncertain", "needs_review"]))).limit(1);
    if (unresolved) return "review";
    return await processDialogInner(dialog, userId);
  } finally {
    try { if (propertyLock) await releaseLandlordPropertyLock(dialog.propertyId, propertyLock); }
    finally { await db.update(landlordDialogs).set({ leaseToken: null, leaseUntil: null })
      .where(and(eq(landlordDialogs.id, dialog.id), eq(landlordDialogs.leaseToken, token))); }
  }
}

export async function runLandlordDialogSweep(options: { full?: boolean } = {}): Promise<{ checked: number; sent: number; review: number; errors: number }> {
  // Rotate through the least recently checked dialogs so a large mailbox or
  // repeated failures cannot starve the same threads on every full sweep.
  const dialogs = await db.select().from(landlordDialogs).where(eq(landlordDialogs.active, true))
    .orderBy(asc(landlordDialogs.lastCheckedAt), asc(landlordDialogs.id));
  const summary = { checked: 0, sent: 0, review: 0, errors: 0 };
  if (!dialogs.length) return summary;
  const userId = await gmailAutomationUserId(MAILBOX);
  const recent = options.full ? null : await gmailRecentThreadMessages(userId);
  const startedAt = Date.now();
  for (const dialog of dialogs.filter((item) => !recent || recent.has(item.gmailThreadId))) {
    if (Date.now() - startedAt > 40_000) break; // the next sweep starts with the least recently checked threads
    const ids = recent?.get(dialog.gmailThreadId);
    const fingerprint = ids ? createHash("sha256").update([...ids].sort().join("\0")).digest("hex") : null;
    if (fingerprint && fingerprint === dialog.lastSeenFingerprint) continue;
    summary.checked++;
    try {
      const status = await processDialog(dialog, userId);
      if (status === "sent") summary.sent++;
      if (status === "review") summary.review++;
      // Also notify after a successful send if attachments need manual import.
      if (status !== "defer") await notifyReview(dialog);
      if (fingerprint && status !== "defer") {
        await db.update(landlordDialogs).set({ lastSeenFingerprint: fingerprint })
          .where(eq(landlordDialogs.id, dialog.id));
      }
    } catch {
      summary.errors++;
    } finally {
      await db.update(landlordDialogs).set({ lastCheckedAt: new Date().toISOString() })
        .where(eq(landlordDialogs.id, dialog.id));
    }
  }
  return summary;
}
