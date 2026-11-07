// Svarsmotorns körning: nya inkommande meddelanden → kontext → modell → regler →
// utskick, utkast eller överlämning till Kajsa. Plus uppföljningar och inlärning
// av Kajsas ändringar i utkasten.
import { and, desc, eq, gt, gte, inArray, isNotNull, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db as defaultDb } from "../db";
import { todayStockholm } from "../date";
import { gmailAutomationUserId, gmailSend, gmailThreadReplyHeaders } from "../gmail";
import { landlordConversationLockKey, isLandlordConversationReserved } from "../landlord-dialog-coordination";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock, renewLandlordPropertyLock } from "../landlord-property-lock";
import { companies, emails, inboxMessages, landlordDialogs, landlordSmsDialogs, notes, outboxMessages, owners, properties, propertyNotes } from "../schema";
import { buildPartyContext, normalizeTime, stripQuoted, type Party } from "./context";
import { buildDecisionPrompt, decide } from "./decide";
import { applyPolicy, nextFollowUpAt, withinActiveHours, type ModelDecision } from "./policy";
import {
  channelForService,
  decidedSourceIds,
  ensureReplyEngineSchema,
  getSettings,
  insertDecision,
  recentAutoCount,
  setOutboxChannel,
  updateDecision,
  type DB,
  type DecisionRow,
  type EngineSettings,
} from "./store";

const MAX_PER_RUN = 8;
const STALE_HOURS = 48;
const CRM_MAILBOX = process.env.CRM_FROM ?? "kajsa@stayonsite.se";
const AUTOMATED_SENDER = /(no-?reply|do-?not-?reply|mailer-daemon|postmaster|notifications?@|bounce)/i;

export interface RunSummary {
  mode: string;
  skippedReason?: string;
  processed: number;
  autoSent: number;
  drafts: number;
  handovers: number;
  followUps: number;
  feedback: number;
  errors: string[];
}

interface InboundItem {
  sourceType: "sms" | "email";
  sourceId: string;
  coveredIds: string[];
  channel: "sms" | "whatsapp" | "email";
  party: Party;
  text: string;
  subject: string | null;
  at: string;
  toAddress: string;
  threadId: string | null;
}

function nowText(now = new Date()): string {
  return now.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "full", timeStyle: "short" });
}

function sqliteTime(iso: string): string {
  return iso.replace("T", " ").slice(0, 19);
}

function emailAddressOf(value: string): string {
  const m = value.match(/<([^>]+)>/);
  return (m ? m[1] : value).trim().toLowerCase();
}

// ─── Inkommande ──────────────────────────────────────────────────────────────

async function pendingSms(db: DB, since: string): Promise<{ items: InboundItem[]; skipped: { id: string; reason: string; party: Party; at: string }[] }> {
  const rows = await db.select().from(inboxMessages)
    .where(and(eq(inboxMessages.direction, "in"), gte(inboxMessages.sentAt, since), or(isNotNull(inboxMessages.ownerId), isNotNull(inboxMessages.contactId)),
      or(sql`lower(coalesce(${inboxMessages.service}, '')) LIKE '%whats%'`,
        sql`NOT EXISTS (SELECT 1 FROM ${landlordSmsDialogs} WHERE ${landlordSmsDialogs.phone} = ${inboxMessages.fromPhone})`)))
    .orderBy(desc(inboxMessages.sentAt)).limit(200);
  const done = await decidedSourceIds(db, "sms", rows.map((r) => r.id));
  const fresh = rows.filter((r) => !done.has(r.id));
  const byPhone = new Map<string, typeof fresh>();
  for (const r of fresh) byPhone.set(r.fromPhone, [...(byPhone.get(r.fromPhone) ?? []), r]);

  const items: InboundItem[] = [];
  const skipped: { id: string; reason: string; party: Party; at: string }[] = [];
  for (const [phone, list] of byPhone) {
    const [latest, ...older] = list; // nyast först
    const party = { ownerId: latest.ownerId, contactId: latest.contactId, companyId: latest.companyId };
    for (const o of older) skipped.push({ id: o.id, reason: "besvaras tillsammans med ett senare meddelande", party, at: o.sentAt });

    const ageHours = (Date.now() - new Date(normalizeTime(latest.sentAt)).getTime()) / 3600_000;
    if (ageHours > STALE_HOURS) { skipped.push({ id: latest.id, reason: "för gammalt för ett automatiskt svar", party, at: latest.sentAt }); continue; }

    // Har Kajsa redan svarat (i Messages eller via CRM:et) efter meddelandet?
    const [kajsaReply] = await db.select({ id: inboxMessages.id }).from(inboxMessages)
      .where(and(eq(inboxMessages.fromPhone, phone), eq(inboxMessages.direction, "out"), gt(inboxMessages.sentAt, latest.sentAt))).limit(1);
    const [queuedReply] = await db.select({ id: outboxMessages.id }).from(outboxMessages)
      .where(and(eq(outboxMessages.toPhone, phone), inArray(outboxMessages.status, ["queued", "sending", "sent", "draft"]), gt(outboxMessages.createdAt, sqliteTime(normalizeTime(latest.sentAt))))).limit(1);
    if (kajsaReply || queuedReply) { skipped.push({ id: latest.id, reason: "Kajsa har redan svarat eller har ett utkast", party, at: latest.sentAt }); continue; }

    const text = [...list].reverse().map((m) => m.body).join("\n");
    items.push({
      sourceType: "sms",
      sourceId: latest.id,
      coveredIds: list.map((m) => m.id),
      channel: channelForService(latest.service),
      party,
      text,
      subject: null,
      at: latest.sentAt,
      toAddress: phone,
      threadId: null,
    });
  }
  return { items, skipped };
}

async function pendingEmails(db: DB, since: string): Promise<{ items: InboundItem[]; skipped: { id: string; reason: string; party: Party; at: string }[] }> {
  const rows = await db.select().from(emails)
    .where(and(eq(emails.direction, "in"), gte(emails.sentAt, since), or(isNotNull(emails.companyId), isNotNull(emails.ownerId)),
      sql`NOT EXISTS (SELECT 1 FROM ${landlordDialogs} WHERE ${landlordDialogs.gmailThreadId} = ${emails.gmailThreadId})`))
    .orderBy(desc(emails.sentAt)).limit(200);
  const done = await decidedSourceIds(db, "email", rows.map((r) => r.id));
  const fresh = rows.filter((r) => !done.has(r.id));

  // Kvalificeringsflödet sköter sina egna trådar.
  const threadIds = [...new Set(fresh.map((r) => r.gmailThreadId).filter(Boolean) as string[])];
  const qualThreads = new Set<string>();
  if (threadIds.length) {
    const qrows = await db.all<{ t: string }>(sql`SELECT gmail_thread_id AS t FROM crm_request_qualifications WHERE gmail_thread_id IN (${sql.join(threadIds.map((t) => sql`${t}`), sql`, `)})`);
    for (const r of qrows) qualThreads.add(r.t);
  }

  const byThread = new Map<string, typeof fresh>();
  for (const r of fresh) {
    const key = r.gmailThreadId ?? r.id;
    byThread.set(key, [...(byThread.get(key) ?? []), r]);
  }

  const items: InboundItem[] = [];
  const skipped: { id: string; reason: string; party: Party; at: string }[] = [];
  for (const [thread, list] of byThread) {
    const [latest, ...older] = list;
    const party = { ownerId: latest.ownerId, contactId: latest.contactId, companyId: latest.companyId };
    for (const o of older) skipped.push({ id: o.id, reason: "besvaras tillsammans med ett senare mejl", party, at: o.sentAt });
    if (qualThreads.has(thread)) { skipped.push({ id: latest.id, reason: "hanteras av kvalificeringsflödet", party, at: latest.sentAt }); continue; }
    if (AUTOMATED_SENDER.test(latest.fromEmail)) { skipped.push({ id: latest.id, reason: "automatiskt utskick", party, at: latest.sentAt }); continue; }
    const ageHours = (Date.now() - new Date(normalizeTime(latest.sentAt)).getTime()) / 3600_000;
    if (ageHours > STALE_HOURS) { skipped.push({ id: latest.id, reason: "för gammalt för ett automatiskt svar", party, at: latest.sentAt }); continue; }
    if (latest.gmailThreadId) {
      const [reply] = await db.select({ id: emails.id }).from(emails)
        .where(and(eq(emails.gmailThreadId, latest.gmailThreadId), eq(emails.direction, "out"), gt(emails.sentAt, latest.sentAt))).limit(1);
      if (reply) { skipped.push({ id: latest.id, reason: "Kajsa har redan svarat i tråden", party, at: latest.sentAt }); continue; }
    }
    items.push({
      sourceType: "email",
      sourceId: latest.id,
      coveredIds: list.map((m) => m.id),
      channel: "email",
      party,
      text: stripQuoted(latest.body).slice(0, 6000),
      subject: latest.subject,
      at: latest.sentAt,
      toAddress: emailAddressOf(latest.fromEmail),
      threadId: latest.gmailThreadId,
    });
  }
  return { items, skipped };
}

// ─── Kajsas senaste rättelser (inlärning) ────────────────────────────────────

export async function recentCorrections(db: DB, limit = 8): Promise<string> {
  await ensureReplyEngineSchema(db);
  const rows = await db.all<Pick<DecisionRow, "reply_text" | "final_text" | "feedback" | "inbound_text" | "channel">>(
    sql`SELECT reply_text, final_text, feedback, inbound_text, channel FROM crm_reply_decisions
        WHERE feedback IN ('edited', 'discarded') ORDER BY updated_at DESC LIMIT ${limit}`,
  );
  return rows.map((r, i) => {
    const inbound = (r.inbound_text ?? "").slice(0, 300);
    if (r.feedback === "discarded") return `${i + 1}. (${r.channel}) Inkommet: "${inbound}"\n   Motorn föreslog: "${(r.reply_text ?? "").slice(0, 400)}"\n   Kajsa slängde förslaget.`;
    return `${i + 1}. (${r.channel}) Inkommet: "${inbound}"\n   Motorn föreslog: "${(r.reply_text ?? "").slice(0, 400)}"\n   Kajsa skickade i stället: "${(r.final_text ?? "").slice(0, 400)}"`;
  }).join("\n");
}

// ─── Utförande ───────────────────────────────────────────────────────────────

async function notifyKajsa(db: DB, party: Party, reason: string): Promise<void> {
  const today = todayStockholm();
  const time = new Date().toLocaleTimeString("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit" });
  const label = `Svarsmotorn: ${reason}`.slice(0, 300);
  if (party.companyId) {
    const [co] = await db.select({ followUpDate: companies.followUpDate }).from(companies).where(eq(companies.id, party.companyId));
    if (co && (!co.followUpDate || co.followUpDate > today)) {
      await db.update(companies).set({ followUpDate: today, followUpTime: time, followUpReason: label }).where(eq(companies.id, party.companyId));
    }
    await db.insert(notes).values({ id: nanoid(), companyId: party.companyId, channel: "svarsmotor", content: label, source: "crm" });
  }
  if (party.ownerId) {
    const [o] = await db.select({ followUpDate: owners.followUpDate }).from(owners).where(eq(owners.id, party.ownerId));
    if (o && (!o.followUpDate || o.followUpDate > today)) {
      await db.update(owners).set({ followUpDate: today, followUpTime: time, followUpReason: label }).where(eq(owners.id, party.ownerId));
    }
    // Anteckning på bostaden när uthyraren bara har en – annars vet vi inte vilken det gäller.
    const props = await db.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, party.ownerId)).limit(2);
    if (props.length === 1) {
      await db.insert(propertyNotes).values({ id: nanoid(), propertyId: props[0].id, channel: "svarsmotor", content: label, source: "crm" });
    }
  }
}

async function queueMessage(db: DB, item: { toAddress: string; channel: "sms" | "whatsapp"; party: Party; coveredIds: string[] }, body: string, status: "queued" | "draft"): Promise<string> {
  const id = nanoid();
  await db.insert(outboxMessages).values({
    id,
    toPhone: item.toAddress,
    body,
    ownerId: item.party.ownerId,
    contactId: item.party.contactId,
    status,
    replyToInboxIds: item.coveredIds.length ? item.coveredIds : null,
    source: "reply-engine",
  });
  await setOutboxChannel(db, id, item.channel);
  return id;
}

export async function sendEmailReply(db: DB, args: { to: string; subject: string | null; body: string; threadId: string | null; party: Party }): Promise<string> {
  const userId = await gmailAutomationUserId(CRM_MAILBOX);
  let headers: { inReplyTo?: string; references?: string } = {};
  if (args.threadId) {
    try { headers = await gmailThreadReplyHeaders(userId, args.threadId); } catch { /* best effort */ }
  }
  const subject = args.subject ?? "";
  const replySubject = /^(re|sv|vs|odp):/i.test(subject.trim()) ? subject.trim() : `Re: ${subject.trim() || "StayOnSite"}`;
  const result = await gmailSend(userId, {
    from: `Kajsa Sihlén <${CRM_MAILBOX}>`,
    to: args.to,
    subject: replySubject,
    text: args.body,
    threadId: args.threadId ?? undefined,
    inReplyTo: headers.inReplyTo,
    references: headers.references,
  });
  await db.insert(emails).values({
    id: nanoid(),
    companyId: args.party.companyId,
    contactId: args.party.contactId,
    ownerId: args.party.ownerId,
    direction: "out",
    subject: replySubject,
    body: args.body,
    fromEmail: CRM_MAILBOX,
    toEmail: args.to,
    authorId: userId,
    gmailMessageId: result.messageId,
    gmailThreadId: result.threadId,
    isRead: true,
    sentAt: new Date().toISOString(),
  }).onConflictDoNothing();
  return result.messageId;
}

interface ExecuteArgs {
  db: DB;
  settings: EngineSettings;
  decisionId: string;
  item: InboundItem;
  decision: ModelDecision;
  model: string;
  followUpCount: number;
}

async function execute({ db, settings, decisionId, item, decision, model, followUpCount }: ExecuteArgs) {
  const autoSentLast24h = await recentAutoCount(db, item.party);
  const policy = applyPolicy({ mode: settings.mode, channel: item.channel, inboundText: item.text, decision, autoSentLast24h });

  let outboxId: string | null = null;
  let gmailMessageId: string | null = null;
  let followUpAt: string | null = null;
  const reply = decision.reply ?? "";

  if (policy.action === "auto_sent") {
    if (item.channel === "email") {
      gmailMessageId = await sendEmailReply(db, { to: item.toAddress, subject: decision.replySubject ?? item.subject, body: reply, threadId: item.threadId, party: item.party });
      await db.update(emails).set({ isRead: true }).where(inArray(emails.id, item.coveredIds));
    } else {
      outboxId = await queueMessage(db, { toAddress: item.toAddress, channel: item.channel, party: item.party, coveredIds: item.coveredIds }, reply, "queued");
      await db.update(inboxMessages).set({ isRead: true }).where(inArray(inboxMessages.id, item.coveredIds));
    }
    if (decision.followUpInHours != null) followUpAt = nextFollowUpAt(decision.followUpInHours).toISOString();
  } else if (policy.draft && item.channel !== "email") {
    outboxId = await queueMessage(db, { toAddress: item.toAddress, channel: item.channel, party: item.party, coveredIds: item.coveredIds }, reply, "draft");
  }
  if (policy.notifyKajsa) {
    await notifyKajsa(db, item.party, decision.kajsaTask?.trim() || decision.handoverReason?.trim() || policy.reasons.join("; "));
  }

  await updateDecision(db, decisionId, {
    action: policy.action === "shadow" ? "shadow" : policy.action,
    party_role: decision.partyRole,
    intent: decision.intent,
    stage: decision.stage,
    outcome_goal: [decision.outcomeGoal, decision.nextStep ? `nästa: ${decision.nextStep}` : null].filter(Boolean).join(" · "),
    summary: decision.summary,
    reply_text: decision.reply,
    reply_subject: decision.replySubject ?? item.subject,
    reason: [...policy.reasons, decision.kajsaTask ? `att göra för Kajsa: ${decision.kajsaTask}` : null].filter(Boolean).join("; "),
    risk_flags: JSON.stringify(decision.riskFlags),
    confidence: decision.confidence,
    outbox_id: outboxId,
    gmail_message_id: gmailMessageId,
    follow_up_at: followUpAt,
    follow_up_status: followUpAt ? "pending" : null,
    follow_up_count: followUpCount,
    model,
    mode: settings.mode,
  });
  return policy.action;
}

async function handleItem(db: DB, settings: EngineSettings, item: InboundItem, corrections: string, summary: RunSummary) {
  const key = landlordConversationLockKey(item.channel, item.toAddress, item.threadId);
  if (!key) return handleItemInner(db, settings, item, corrections, summary);
  const token = await acquireLandlordPropertyLock(key, db, 360_000);
  if (!token) return; // Another enrollment or response is in progress; retry later.
  try {
    if (await isLandlordConversationReserved(db, item.channel, item.toAddress, item.threadId)) return;
    await handleItemInner(db, settings, item, corrections, summary, { key, token });
  } finally { await releaseLandlordPropertyLock(key, token, db); }
}

async function handleItemInner(db: DB, settings: EngineSettings, item: InboundItem, corrections: string, summary: RunSummary, lease?: { key: string; token: string }) {
  const decisionId = nanoid();
  const claimed = await insertDecision(db, {
    id: decisionId,
    source_type: item.sourceType,
    source_id: item.sourceId,
    channel: item.channel,
    party_type: item.party.ownerId ? "owner" : "company",
    owner_id: item.party.ownerId,
    contact_id: item.party.contactId,
    company_id: item.party.companyId,
    to_address: item.toAddress,
    thread_id: item.threadId,
    inbound_at: item.at,
    inbound_text: item.text.slice(0, 4000),
    action: "skipped",
    reason: "bearbetas",
    mode: settings.mode,
  });
  if (!claimed) return;
  try {
    const ctx = await buildPartyContext(item.party, { db, channelHint: item.channel });
    const prompt = buildDecisionPrompt({
      ctx, channel: item.channel, inbound: { text: item.text, subject: item.subject, at: item.at },
      playbook: settings.playbook, corrections, nowText: nowText(), mode: "reply",
    });
    const { decision, model } = await decide(prompt);
    if (lease && (!await renewLandlordPropertyLock(lease.key, lease.token, db, 360_000)
      || await isLandlordConversationReserved(db, item.channel, item.toAddress, item.threadId))) {
      throw new Error("Dialogen ändrades under behandlingen och behöver kontrolleras.");
    }
    const action = await execute({ db, settings, decisionId, item, decision, model, followUpCount: 0 });
    summary.processed++;
    if (action === "auto_sent") summary.autoSent++;
    if (action === "draft") summary.drafts++;
    if (action === "handover") summary.handovers++;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    summary.errors.push(message.slice(0, 200));
    await updateDecision(db, decisionId, { action: "error", reason: message.slice(0, 500) });
    await notifyKajsa(db, item.party, "kunde inte tolka ett nytt meddelande – svara själv").catch(() => {});
  }
}

// ─── Uppföljningar ───────────────────────────────────────────────────────────

async function processFollowUps(db: DB, settings: EngineSettings, corrections: string, summary: RunSummary, budget: number) {
  const due = await db.all<DecisionRow>(sql`SELECT * FROM crm_reply_decisions d
    WHERE follow_up_status = 'pending' AND follow_up_at <= ${new Date().toISOString()}
      AND NOT ((d.channel = 'sms' AND EXISTS (SELECT 1 FROM crm_landlord_sms_dialogs l WHERE l.phone = d.to_address))
        OR (d.channel = 'email' AND EXISTS (SELECT 1 FROM crm_landlord_dialogs l WHERE l.gmail_thread_id = d.thread_id)))
    ORDER BY follow_up_at LIMIT ${budget}`);
  for (const d of due) {
    const channel = d.channel as InboundItem["channel"];
    const key = landlordConversationLockKey(channel, d.to_address ?? "", d.thread_id);
    const token = key ? await acquireLandlordPropertyLock(key, db, 360_000) : null;
    if (key && !token) continue;
    try {
    if (await isLandlordConversationReserved(db, channel, d.to_address ?? "", d.thread_id)) continue;
    const party: Party = { ownerId: d.owner_id, contactId: d.contact_id, companyId: d.company_id };
    const sentAt = normalizeTime(d.created_at);
    // Har kontakten svarat, eller har Kajsa själv skrivit, sedan dess? Då är uppföljningen inaktuell.
    const answered = d.channel === "email"
      ? await db.select({ id: emails.id }).from(emails).where(and(
        d.thread_id ? eq(emails.gmailThreadId, d.thread_id) : or(eq(emails.companyId, d.company_id ?? ""), eq(emails.ownerId, d.owner_id ?? "")),
        gt(emails.sentAt, sentAt), d.gmail_message_id ? sql`coalesce(${emails.gmailMessageId}, '') <> ${d.gmail_message_id}` : sql`1 = 1`,
      )).limit(1)
      : (await db.select({ id: inboxMessages.id, direction: inboxMessages.direction, body: inboxMessages.body }).from(inboxMessages).where(and(
        eq(inboxMessages.fromPhone, d.to_address ?? ""), gt(inboxMessages.sentAt, sentAt),
      )).limit(20)).filter((m) => m.direction === "in" || !sameMessage(m.body, d.reply_text));
    if (answered.length) { await updateDecision(db, d.id, { follow_up_status: "cancelled" }); continue; }

    if (d.follow_up_count >= 1) {
      await notifyKajsa(db, party, `inget svar efter påminnelse (${d.outcome_goal ?? d.intent ?? "ärende"})`);
      await updateDecision(db, d.id, { follow_up_status: "handed_over" });
      summary.handovers++;
      continue;
    }

    const item: InboundItem = {
      sourceType: "sms", sourceId: d.id, coveredIds: [], channel: d.channel as InboundItem["channel"], party,
      text: d.inbound_text ?? "", subject: d.reply_subject, at: d.created_at, toAddress: d.to_address ?? "", threadId: d.thread_id,
    };
    const decisionId = nanoid();
    const claimed = await insertDecision(db, {
      id: decisionId, source_type: "followup", source_id: `${d.id}:${d.follow_up_count + 1}`, channel: d.channel,
      party_type: d.party_type, owner_id: d.owner_id, contact_id: d.contact_id, company_id: d.company_id,
      to_address: d.to_address, thread_id: d.thread_id, inbound_at: d.created_at,
      inbound_text: `(uppföljning) ${d.reply_text ?? ""}`.slice(0, 4000), action: "skipped", reason: "bearbetas", mode: settings.mode,
    });
    await updateDecision(db, d.id, { follow_up_status: "done" });
    if (!claimed) continue;
    try {
      const ctx = await buildPartyContext(party, { db });
      const prompt = buildDecisionPrompt({
        ctx, channel: item.channel, inbound: { text: "", at: d.created_at }, playbook: settings.playbook, corrections,
        nowText: nowText(), mode: "followup", followUp: { lastMessage: d.reply_text ?? "", reason: d.outcome_goal },
      });
      const { decision, model } = await decide(prompt);
      if (key && token && (!await renewLandlordPropertyLock(key, token, db, 360_000)
        || await isLandlordConversationReserved(db, channel, d.to_address ?? "", d.thread_id))) {
        throw new Error("Dialogen ändrades under behandlingen och behöver kontrolleras.");
      }
      // En påminnelse frågar inte vidare – nästa steg efter den är alltid Kajsa.
      const action = await execute({ db, settings, decisionId, item: { ...item, text: "" }, decision: { ...decision, followUpInHours: decision.followUpInHours ?? 48 }, model, followUpCount: d.follow_up_count + 1 });
      summary.followUps++;
      if (action === "handover") summary.handovers++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.errors.push(message.slice(0, 200));
      await updateDecision(db, decisionId, { action: "error", reason: message.slice(0, 500) });
    }
    } finally { if (key && token) await releaseLandlordPropertyLock(key, token, db); }
  }
}

/** Motorns eget utskick kommer tillbaka från Messages som "out" – det räknas inte som Kajsas svar. */
function sameMessage(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  return Boolean(norm(a)) && norm(a) === norm(b);
}

// ─── Feedback: vad gjorde Kajsa med utkasten? ────────────────────────────────

async function collectFeedback(db: DB): Promise<number> {
  const open = await db.all<DecisionRow>(sql`SELECT * FROM crm_reply_decisions
    WHERE outbox_id IS NOT NULL AND feedback IS NULL AND action IN ('draft', 'handover') ORDER BY created_at DESC LIMIT 50`);
  let n = 0;
  for (const d of open) {
    const [row] = await db.select({ status: outboxMessages.status, body: outboxMessages.body }).from(outboxMessages).where(eq(outboxMessages.id, d.outbox_id!));
    if (!row) { await updateDecision(db, d.id, { feedback: "discarded" }); n++; continue; }
    if (row.status === "draft") continue;
    const same = row.body.trim() === (d.reply_text ?? "").trim();
    await updateDecision(db, d.id, { feedback: same ? "approved" : "edited", final_text: same ? null : row.body });
    n++;
  }
  return n;
}

// ─── Huvudkörning ────────────────────────────────────────────────────────────

export async function runReplyEngine(opts: { db?: DB; force?: boolean } = {}): Promise<RunSummary> {
  const db = opts.db ?? defaultDb;
  const settings = await getSettings(db);
  const summary: RunSummary = { mode: settings.mode, processed: 0, autoSent: 0, drafts: 0, handovers: 0, followUps: 0, feedback: 0, errors: [] };
  summary.feedback = await collectFeedback(db);
  if (settings.mode === "off") return { ...summary, skippedReason: "motorn är avstängd" };
  if (!opts.force && !withinActiveHours()) return { ...summary, skippedReason: "utanför 07–21" };
  if (!settings.activatedAt) return { ...summary, skippedReason: "inte aktiverad" };

  const since = settings.activatedAt;
  const corrections = await recentCorrections(db);
  const [sms, mail] = await Promise.all([pendingSms(db, since), pendingEmails(db, since)]);

  for (const s of [...sms.skipped.map((x) => ({ ...x, type: "sms" as const })), ...mail.skipped.map((x) => ({ ...x, type: "email" as const }))]) {
    await insertDecision(db, {
      id: nanoid(), source_type: s.type, source_id: s.id, channel: s.type === "email" ? "email" : "sms", action: "skipped", reason: s.reason,
      owner_id: s.party.ownerId, contact_id: s.party.contactId, company_id: s.party.companyId, inbound_at: s.at, mode: settings.mode,
    });
  }

  const items = [...sms.items, ...mail.items].sort((a, b) => normalizeTime(a.at).localeCompare(normalizeTime(b.at))).slice(0, MAX_PER_RUN);
  for (const item of items) await handleItem(db, settings, item, corrections, summary);

  await processFollowUps(db, settings, corrections, summary, Math.max(0, MAX_PER_RUN - items.length));
  return summary;
}

// ─── Godkänn/släng mejlutkast från CRM:et ────────────────────────────────────

export async function approveEmailDraft(db: DB, decisionId: string, body: string): Promise<DecisionRow> {
  await ensureReplyEngineSchema(db);
  const [d] = await db.all<DecisionRow>(sql`SELECT * FROM crm_reply_decisions WHERE id = ${decisionId}`);
  if (!d) throw new Error("Förslaget finns inte.");
  if (d.channel !== "email" || !["draft", "handover"].includes(d.action) || d.feedback) throw new Error("Förslaget kan inte skickas härifrån.");
  if (!d.to_address) throw new Error("Mottagare saknas.");
  const text = body.trim();
  if (!text) throw new Error("Mejlet är tomt.");
  const party = { ownerId: d.owner_id, contactId: d.contact_id, companyId: d.company_id };
  const messageId = await sendEmailReply(db, { to: d.to_address, subject: d.reply_subject, body: text, threadId: d.thread_id, party });
  const same = text === (d.reply_text ?? "").trim();
  await updateDecision(db, d.id, { gmail_message_id: messageId, feedback: same ? "approved" : "edited", final_text: same ? null : text });
  const [updated] = await db.all<DecisionRow>(sql`SELECT * FROM crm_reply_decisions WHERE id = ${decisionId}`);
  return updated;
}

export async function discardEmailDraft(db: DB, decisionId: string): Promise<void> {
  await ensureReplyEngineSchema(db);
  await db.run(sql`UPDATE crm_reply_decisions SET feedback = 'discarded', updated_at = datetime('now')
    WHERE id = ${decisionId} AND channel = 'email' AND feedback IS NULL`);
}

// ─── Förhandsgranskning (skriver ingenting, skickar ingenting) ───────────────

export interface PreviewResult {
  channel: string;
  inbound: string;
  at: string;
  party: Party;
  decision: ModelDecision | null;
  wouldDo: string;
  reasons: string[];
  /** Vad Kajsa faktiskt svarade (första svaret efter meddelandet), för jämförelse. */
  kajsaActual: string | null;
  error?: string;
}

/** Kör motorn torrt mot de senaste inkomna meddelandena, oavsett aktiveringstid. */
export async function previewRecent(opts: { db?: DB; limit?: number } = {}): Promise<PreviewResult[]> {
  const db = opts.db ?? defaultDb;
  const settings = await getSettings(db);
  const limit = Math.min(20, Math.max(1, opts.limit ?? 5));
  const since = new Date(Date.now() - 30 * 24 * 3600_000).toISOString();
  const smsRows = await db.select().from(inboxMessages)
    .where(and(eq(inboxMessages.direction, "in"), gte(inboxMessages.sentAt, since), or(isNotNull(inboxMessages.ownerId), isNotNull(inboxMessages.contactId))))
    .orderBy(desc(inboxMessages.sentAt)).limit(limit);
  const mailRows = await db.select().from(emails)
    .where(and(eq(emails.direction, "in"), gte(emails.sentAt, since), or(isNotNull(emails.companyId), isNotNull(emails.ownerId))))
    .orderBy(desc(emails.sentAt)).limit(limit);
  const items: InboundItem[] = [
    ...smsRows.map((m) => ({
      sourceType: "sms" as const, sourceId: m.id, coveredIds: [m.id], channel: channelForService(m.service),
      party: { ownerId: m.ownerId, contactId: m.contactId, companyId: m.companyId }, text: m.body, subject: null,
      at: m.sentAt, toAddress: m.fromPhone, threadId: null,
    })),
    ...mailRows.filter((m) => !AUTOMATED_SENDER.test(m.fromEmail)).map((m) => ({
      sourceType: "email" as const, sourceId: m.id, coveredIds: [m.id], channel: "email" as const,
      party: { ownerId: m.ownerId, contactId: m.contactId, companyId: m.companyId }, text: stripQuoted(m.body).slice(0, 6000),
      subject: m.subject, at: m.sentAt, toAddress: emailAddressOf(m.fromEmail), threadId: m.gmailThreadId,
    })),
  ].sort((a, b) => normalizeTime(b.at).localeCompare(normalizeTime(a.at))).slice(0, limit);

  const corrections = await recentCorrections(db);
  const results: PreviewResult[] = [];
  for (const item of items) {
    try {
      const ctx = await buildPartyContext(item.party, { db, until: item.at });
      const prompt = buildDecisionPrompt({
        ctx, channel: item.channel, inbound: { text: item.text, subject: item.subject, at: item.at },
        playbook: settings.playbook, corrections, nowText: new Date(normalizeTime(item.at)).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "full", timeStyle: "short" }), mode: "reply",
      });
      const { decision } = await decide(prompt);
      const policy = applyPolicy({ mode: "auto", channel: item.channel, inboundText: item.text, decision, autoSentLast24h: 0 });
      const kajsaActual = ctx.later.find((l) => l.from === "Kajsa")?.text ?? null;
      results.push({ channel: item.channel, inbound: item.text.slice(0, 600), at: item.at, party: item.party, decision, wouldDo: policy.action, reasons: policy.reasons, kajsaActual });
    } catch (error) {
      results.push({ channel: item.channel, inbound: item.text.slice(0, 600), at: item.at, party: item.party, decision: null, wouldDo: "error", reasons: [], kajsaActual: null, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return results;
}
