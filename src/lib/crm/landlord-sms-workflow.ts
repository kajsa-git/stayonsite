import { and, asc, desc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { sendLandlordSmsAttachmentNotice, sendLandlordSmsReviewNotice } from "./landlord-dialog-alerts";
import { planLandlordReply, propertyPatchFromFacts, type LandlordBrand } from "./landlord-dialog-model";
import { asksToStopContact, isAcknowledgementOnly } from "./landlord-dialog-policy";
import { indexProperty } from "./search-index";
import { LANDLORD_SMS_SOURCE } from "./landlord-sms-source";
import { unambiguousLandlordPhone } from "./landlord-sms-identity";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "./landlord-property-lock";
import { normalizePhoneE164 } from "./phone-links";
import { inboxMessages, landlordSmsDialogs, landlordSmsReceipts, landlordSmsRuns, outboxMessages, owners, properties, propertyImages, propertyNotes } from "./schema";

type Dialog = typeof landlordSmsDialogs.$inferSelect;

function smsBrand(history: Array<{ direction: string | null; body: string }>, consentSource: string | null): LandlordBrand {
  // Use Kajsa's most recent explicitly branded outgoing message, ignoring
  // unbranded acknowledgements and text supplied by the landlord.
  for (const message of history) {
    if (message.direction !== "out") continue;
    const hus = /\bHyrUtSmart\b/i.test(message.body);
    const stay = /\bStayOnSite\b/i.test(message.body);
    if (hus && stay) throw new Error("Dialogens avsändare är oklar; kontrollera manuellt.");
    if (hus) return "HyrUtSmart";
    if (stay) return "StayOnSite";
  }
  return consentSource === "hus" ? "HyrUtSmart" : "StayOnSite";
}

async function review(guid: string, reason: string) {
  await db.update(landlordSmsRuns).set({ status: "needs_review", error: reason, updatedAt: new Date().toISOString() })
    .where(eq(landlordSmsRuns.inboxGuid, guid));
}

async function notice(dialog: Dialog, run: typeof landlordSmsRuns.$inferSelect) {
  if (run.reviewNoticeSentAt) return;
  await sendLandlordSmsReviewNotice(dialog.propertyId, run.inboxGuid);
  await db.update(landlordSmsRuns).set({ reviewNoticeSentAt: new Date().toISOString() })
    .where(and(eq(landlordSmsRuns.inboxGuid, run.inboxGuid), isNull(landlordSmsRuns.reviewNoticeSentAt)));
}

async function processDialog(dialog: Dialog): Promise<"sent_to_queue" | "review" | "none"> {
  const now = new Date();
  const lease = nanoid();
  const [lock] = await db.update(landlordSmsDialogs).set({ leaseToken: lease, leaseUntil: new Date(now.getTime() + 120_000).toISOString() })
    .where(and(eq(landlordSmsDialogs.id, dialog.id), eq(landlordSmsDialogs.active, true),
      or(isNull(landlordSmsDialogs.leaseUntil), lt(landlordSmsDialogs.leaseUntil, now.toISOString())))).returning({ id: landlordSmsDialogs.id });
  if (!lock) return "none";
  let propertyLock: string | null = null;
  try {
    propertyLock = await acquireLandlordPropertyLock(dialog.propertyId);
    if (!propertyLock) return "none";
    const existing = await db.select().from(landlordSmsRuns).where(eq(landlordSmsRuns.dialogId, dialog.id))
      .orderBy(desc(landlordSmsRuns.createdAt)).limit(10);
    const answeredGuids = new Set<string>();
    for (const run of existing) {
      if (run.status === "needs_review") { await notice(dialog, run); return "review"; }
      if (run.status === "claimed") {
        if (Date.now() - Date.parse(run.updatedAt) > 120_000) {
          await review(run.inboxGuid, "Behandlingen avbröts. Kontrollera dialogen manuellt.");
          await notice(dialog, { ...run, status: "needs_review" });
          return "review";
        }
        return "none";
      }
      if ((run.status === "queued" || run.status === "sent") && run.outboxId) {
        const [out] = await db.select().from(outboxMessages).where(eq(outboxMessages.id, run.outboxId)).limit(1);
        if (!out || out.status === "failed" || (out.status === "sending" && Date.now() - Date.parse(run.updatedAt) > 5 * 60_000)) {
          await review(run.inboxGuid, "SMS-utskicket behöver kontrolleras innan nästa svar.");
          await notice(dialog, { ...run, status: "needs_review" });
          return "review";
        }
        if (out.status !== "sent") return "none";
        answeredGuids.add(run.inboxGuid);
        if (run.status !== "sent") await db.update(landlordSmsRuns).set({ status: "sent", updatedAt: new Date().toISOString() }).where(eq(landlordSmsRuns.inboxGuid, run.inboxGuid));
      }
    }
    const history = await db.select().from(inboxMessages).where(and(eq(inboxMessages.fromPhone, dialog.phone),
      sql`lower(coalesce(${inboxMessages.service}, '')) NOT LIKE '%whats%'`))
      .orderBy(desc(inboxMessages.sentAt), desc(inboxMessages.createdAt)).limit(100);
    const incoming = history[0];
    if (!incoming || incoming.direction !== "in" || !Number.isFinite(Date.parse(incoming.sentAt))
      || Date.parse(incoming.sentAt) <= Date.parse(dialog.enrolledAt)) return "none";
    const turn = [];
    for (const message of history) {
      // Some outgoing Messages.app rows have no handle and cannot be ingested.
      // Our own recorded send still separates earlier incoming messages from a
      // later acknowledgement or new reply.
      if (answeredGuids.has(message.guid)) break;
      if (message.direction !== "in" || !Number.isFinite(Date.parse(message.sentAt)) || Date.parse(message.sentAt) <= Date.parse(dialog.enrolledAt)) break;
      turn.push(message);
    }
    if (!turn.length) return "none";
    const receipts = await db.select().from(landlordSmsReceipts).where(inArray(landlordSmsReceipts.guid, turn.map((message) => message.guid)));
    const attachmentCount = receipts.reduce((total, receipt) => total + receipt.attachmentCount, 0);
    const substantive = turn.filter((message) => !isAcknowledgementOnly(message.body));
    if (!substantive.length && attachmentCount === 0) return "none";
    // Messages.app may represent a photo with only U+FFFC or a missing text
    // placeholder. Do not feed that placeholder to the model as a fact.
    const sourceText = substantive.slice().reverse().map((message) => message.body.replace(/\uFFFC/g, "").trim())
      .filter((body) => body && !body.startsWith("[tomt meddelande"))
      .join("\n\n");
    const time = new Date().toISOString();
    const [claimed] = await db.insert(landlordSmsRuns).values({ inboxGuid: incoming.guid, dialogId: dialog.id,
      status: "claimed", attachmentsNeedReview: attachmentCount > 0, createdAt: time, updatedAt: time }).onConflictDoNothing().returning();
    if (!claimed) return "none";
    try {
      if (turn.length === 100) throw new Error("Dialogen innehåller många nya meddelanden och behöver kontrolleras.");
      if (turn.some((message) => receipts.find((receipt) => receipt.guid === message.guid)?.conversationKind !== "direct")) throw new Error("Det går inte att bekräfta att SMS:et kommer från en enskild dialog.");
      if (!sourceText) throw new Error("SMS:et saknar läsbar text och behöver kontrolleras.");
      if (asksToStopContact(sourceText)) throw new Error("Uthyraren har bett att kontakten ska upphöra.");
      const [property] = await db.select().from(properties).where(and(eq(properties.id, dialog.propertyId), eq(properties.ownerId, dialog.ownerId))).limit(1);
      const [owner] = await db.select().from(owners).where(eq(owners.id, dialog.ownerId)).limit(1);
      if (!property || !owner || normalizePhoneE164(owner.phone) !== dialog.phone) throw new Error("Uthyraren eller telefonnumret har ändrats.");
      if (!await unambiguousLandlordPhone(db, dialog.phone, owner.id)) throw new Error("Telefonnumret används av flera kontakter och behöver kontrolleras.");
      const pictures = await db.select({ id: propertyImages.id }).from(propertyImages).where(eq(propertyImages.propertyId, property.id));
      const notes = await db.select({ content: propertyNotes.content }).from(propertyNotes)
        .where(eq(propertyNotes.propertyId, property.id)).orderBy(desc(propertyNotes.createdAt)).limit(10);
      const plan = await planLandlordReply({ ownerName: owner.name, brand: smsBrand(history, property.publishConsentSource), property: {
        address: property.address, city: property.city, squareMeters: property.squareMeters, bedrooms: property.bedrooms,
        beds: property.beds, bathrooms: property.bathrooms, furnished: property.furnished, broadband: property.broadband,
        kitchen: property.kitchen, rentIn: property.rentIn, excludedNote: property.excludedNote, notes: property.notes,
        contactHistory: notes.reverse().map((n) => n.content).join("\n\n").slice(-8000), pictureCount: pictures.length,
      }, conversation: history.slice(0, 12).reverse().map((m) => `${m.direction === "in" ? owner.name : "Kajsa"}: ${m.body}`).join("\n"),
      newReply: sourceText, possibleImageAttachments: attachmentCount });
      const savedContext = await db.transaction(async (tx) => {
        await tx.insert(propertyNotes).values({ id: nanoid(), propertyId: property.id, channel: "sms", source: "landlord_agent",
          content: `Nya SMS från uthyraren.${attachmentCount ? " Bilagor finns i Meddelanden och har inte importerats automatiskt." : ""}\n\nUthyrarens svar:\n${sourceText}\n\nMaskinell sammanfattning – kontrollera mot källan:\n${plan.summary}` });
        const [current] = await tx.select().from(properties).where(and(eq(properties.id, property.id), eq(properties.ownerId, owner.id))).limit(1);
        const changed = !current || current.updatedAt !== property.updatedAt;
        const mayEdit = current && !changed && !current.published && !current.prospektPublished && !current.autoPublishEnabled;
        const patch = mayEdit ? propertyPatchFromFacts(plan.facts, current, sourceText) : {};
        if (Object.keys(patch).length) await tx.update(properties).set({ ...patch, contentReviewHash: null,
          contentReviewStatus: current?.contentReviewStatus === "checking" ? "checking" : "pending", updatedAt: time }).where(eq(properties.id, property.id));
        return { changed, updated: Object.keys(patch).length > 0, updatedAt: Object.keys(patch).length > 0 ? time : current?.updatedAt ?? null };
      });
      if (savedContext.updated) await indexProperty(property.id).catch(() => console.error("landlord SMS search index failed"));
      if (savedContext.changed) throw new Error("Bostadens uppgifter ändrades medan svaret förbereddes.");
      if (plan.action !== "reply" || plan.reply.length > 1000) throw new Error("SMS-svaret behöver Kajsas bedömning.");

      const queued = await db.transaction(async (tx) => {
        const [current] = await tx.select().from(landlordSmsDialogs).where(eq(landlordSmsDialogs.id, dialog.id)).limit(1);
        const [latest] = await tx.select().from(inboxMessages).where(and(eq(inboxMessages.fromPhone, dialog.phone),
          sql`lower(coalesce(${inboxMessages.service}, '')) NOT LIKE '%whats%'`))
          .orderBy(desc(inboxMessages.sentAt), desc(inboxMessages.createdAt)).limit(1);
        if (!current?.active || latest?.guid !== incoming.guid || latest.direction !== "in") return false;
        const [currentProperty] = await tx.select({ updatedAt: properties.updatedAt }).from(properties).where(and(eq(properties.id, dialog.propertyId), eq(properties.ownerId, dialog.ownerId))).limit(1);
        if (!currentProperty || currentProperty.updatedAt !== savedContext.updatedAt) throw new Error("Bostadens uppgifter ändrades medan svaret förbereddes.");
        const otherPending = await tx.select({ id: outboxMessages.id }).from(outboxMessages).where(and(
          eq(outboxMessages.toPhone, dialog.phone), inArray(outboxMessages.status, ["draft", "queued", "sending"]),
        )).limit(1);
        if (otherPending.length) throw new Error("Det finns redan ett utkast eller ett väntande utskick till numret.");
        const id = `landlord-sms:${incoming.guid}`;
        await tx.insert(outboxMessages).values({ id, toPhone: dialog.phone, ownerId: owner.id, body: plan.reply.trim(),
          status: "queued", source: LANDLORD_SMS_SOURCE, replyToInboxIds: turn.map((message) => message.id), createdAt: time });
        await tx.update(landlordSmsRuns).set({ status: "queued", outboxId: id, attachmentsNeedReview: attachmentCount > 0, updatedAt: new Date().toISOString() })
          .where(eq(landlordSmsRuns.inboxGuid, incoming.guid));
        return true;
      });
      if (!queued) {
        await db.update(landlordSmsRuns).set({ status: "resolved", error: "Dialogen ändrades medan svaret förbereddes.", updatedAt: new Date().toISOString() }).where(eq(landlordSmsRuns.inboxGuid, incoming.guid));
        return "none";
      }
      return "sent_to_queue";
    } catch (error) {
      await review(incoming.guid, error instanceof Error ? error.message.slice(0, 1000) : "SMS-dialogen behöver kontroll.");
      await notice(dialog, claimed);
      return "review";
    }
  } finally {
    try { if (propertyLock) await releaseLandlordPropertyLock(dialog.propertyId, propertyLock); }
    finally { await db.update(landlordSmsDialogs).set({ leaseToken: null, leaseUntil: null })
      .where(and(eq(landlordSmsDialogs.id, dialog.id), eq(landlordSmsDialogs.leaseToken, lease))); }
  }
}

export async function runLandlordSmsSweep(): Promise<{ checked: number; queued: number; review: number; errors: number }> {
  const summary = { checked: 0, queued: 0, review: 0, errors: 0 };
  const pendingAttachments = await db.select({ guid: landlordSmsRuns.inboxGuid, propertyId: landlordSmsDialogs.propertyId }).from(landlordSmsRuns)
    .innerJoin(landlordSmsDialogs, eq(landlordSmsRuns.dialogId, landlordSmsDialogs.id)).where(and(
      eq(landlordSmsRuns.attachmentsNeedReview, true), isNull(landlordSmsRuns.attachmentNoticeSentAt),
    )).limit(20);
  for (const row of pendingAttachments) {
    try {
      await sendLandlordSmsAttachmentNotice(row.propertyId, row.guid);
      await db.update(landlordSmsRuns).set({ attachmentNoticeSentAt: new Date().toISOString() }).where(eq(landlordSmsRuns.inboxGuid, row.guid));
    } catch { summary.errors++; }
  }
  const dialogs = await db.select().from(landlordSmsDialogs).where(eq(landlordSmsDialogs.active, true))
    .orderBy(asc(landlordSmsDialogs.lastCheckedAt), asc(landlordSmsDialogs.id));
  const started = Date.now();
  for (const dialog of dialogs) {
    if (Date.now() - started > 40_000) break;
    try {
      summary.checked++;
      const result = await processDialog(dialog);
      if (result === "sent_to_queue") summary.queued++;
      if (result === "review") summary.review++;
    } catch { summary.errors++; }
    finally { await db.update(landlordSmsDialogs).set({ lastCheckedAt: new Date().toISOString() }).where(eq(landlordSmsDialogs.id, dialog.id)); }
  }
  // Newly queued replies may have attachments; their notice is sent on the
  // next minute's sweep and does not delay sending the SMS reply.
  return summary;
}
