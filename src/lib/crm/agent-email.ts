// Mejl via MCP (Kajsas agent): bara till kontakter och uthyrare som finns i CRM:et.
// Mottagarens adress hämtas alltid ur CRM:et, aldrig ur anroparens indata. Mejlet går
// från Kajsas Gmail (samma koppling som hyresvärdsdialogen) och loggas i crm_emails,
// så det syns i kundens eller uthyrarens tidslinje precis som ett mejl från CRM-vyn.
// Agenten kräver Kajsas godkännande innan verktyget körs; här finns spärrarna som
// gäller oavsett vem som anropar.
import { and, desc, eq, gte, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import { gmailAutomationUserId, gmailSend, gmailThreadReplyHeaders } from "./gmail";
import type { DB } from "./mcp/shape";
import { contacts, emails, owners, requests } from "./schema";

export const DEDUPE_MINUTES = 15;

type Recipient = { email: string; name: string | null; companyId: string | null; contactId: string | null; ownerId: string | null };

export type AgentEmailResult =
  | { ok: true; alreadySent: boolean; to: string; subject: string; gmailThreadId: string | null; companyId: string | null; ownerId: string | null }
  | { ok: false; message: string };

export interface AgentEmailDeps {
  db?: DB;
  send?: typeof gmailSend;
  automationUserId?: () => Promise<string>;
  replyHeaders?: typeof gmailThreadReplyHeaders;
  now?: () => Date;
  from?: string;
}

async function loadRecipient(db: DB, contactId?: string, ownerId?: string): Promise<Recipient | string> {
  if (!!contactId === !!ownerId) return "Ange antingen contactId eller ownerId.";
  if (contactId) {
    const [c] = await db
      .select({ email: contacts.email, name: contacts.name, companyId: contacts.companyId })
      .from(contacts)
      .where(eq(contacts.id, contactId));
    if (!c) return `Kontakten ${contactId} finns inte.`;
    if (!c.email?.includes("@")) return "Kontakten saknar e-postadress i CRM:et.";
    return { email: c.email.trim(), name: c.name, companyId: c.companyId, contactId, ownerId: null };
  }
  const [o] = await db.select({ email: owners.email, name: owners.name }).from(owners).where(eq(owners.id, ownerId!));
  if (!o) return `Uthyraren ${ownerId} finns inte.`;
  if (!o.email?.includes("@")) return "Uthyraren saknar e-postadress i CRM:et.";
  return { email: o.email.trim(), name: o.name, companyId: null, contactId: null, ownerId: ownerId! };
}

/** En tråd får bara fortsättas om den redan hör till mottagaren i CRM:et. */
async function threadBelongs(db: DB, threadId: string, r: Recipient): Promise<boolean> {
  const conditions = [eq(emails.toEmail, r.email), eq(emails.fromEmail, r.email)];
  if (r.contactId) conditions.push(eq(emails.contactId, r.contactId));
  if (r.ownerId) conditions.push(eq(emails.ownerId, r.ownerId));
  if (r.companyId) conditions.push(eq(emails.companyId, r.companyId));
  const [row] = await db
    .select({ id: emails.id })
    .from(emails)
    .where(and(eq(emails.gmailThreadId, threadId), or(...conditions)))
    .limit(1);
  return !!row;
}

export async function sendAgentEmail(
  args: { contactId?: string; ownerId?: string; subject: string; body: string; threadId?: string; requestId?: string },
  deps: AgentEmailDeps = {},
): Promise<AgentEmailResult> {
  const db = deps.db ?? defaultDb;
  const now = deps.now ?? (() => new Date());
  const subject = args.subject.replace(/[\r\n]+/g, " ").trim();
  const body = args.body.trim();
  if (!subject || !body) return { ok: false, message: "Ämne och text krävs." };

  const recipient = await loadRecipient(db, args.contactId, args.ownerId);
  if (typeof recipient === "string") return { ok: false, message: recipient };

  if (args.requestId) {
    const [req] = await db.select({ id: requests.id }).from(requests).where(eq(requests.id, args.requestId));
    if (!req) return { ok: false, message: `Förfrågan ${args.requestId} finns inte.` };
  }
  if (args.threadId && !(await threadBelongs(db, args.threadId, recipient))) {
    return { ok: false, message: "Tråden hör inte till den här mottagaren i CRM:et." };
  }

  // Samma mejl till samma mottagare nyligen: skicka inte igen (t.ex. vid ett nytt försök
  // efter ett oklart nätverksfel).
  const since = new Date(now().getTime() - DEDUPE_MINUTES * 60_000).toISOString();
  const [dup] = await db
    .select({ gmailThreadId: emails.gmailThreadId })
    .from(emails)
    .where(and(eq(emails.direction, "out"), eq(emails.toEmail, recipient.email), eq(emails.subject, subject), eq(emails.body, body), gte(emails.sentAt, since)))
    .orderBy(desc(emails.sentAt))
    .limit(1);
  if (dup) {
    return { ok: true, alreadySent: true, to: recipient.email, subject, gmailThreadId: dup.gmailThreadId, companyId: recipient.companyId, ownerId: recipient.ownerId };
  }

  const userId = await (deps.automationUserId ?? (() => gmailAutomationUserId()))();
  const from = deps.from ?? process.env.CRM_FROM ?? "kajsa@stayonsite.se";
  let reply: { inReplyTo?: string; references?: string } = {};
  if (args.threadId) {
    reply = await (deps.replyHeaders ?? gmailThreadReplyHeaders)(userId, args.threadId).catch(() => ({}));
  }
  const sent = await (deps.send ?? gmailSend)(userId, {
    from: `Kajsa <${from}>`,
    to: recipient.email,
    subject,
    text: body,
    threadId: args.threadId,
    inReplyTo: reply.inReplyTo,
    references: reply.references,
  });

  // Mejlet är skickat. En miss i loggningen får inte se ut som ett sändfel.
  await db
    .insert(emails)
    .values({
      id: nanoid(),
      companyId: recipient.companyId,
      requestId: args.requestId ?? null,
      contactId: recipient.contactId,
      ownerId: recipient.ownerId,
      direction: "out",
      subject,
      body,
      fromEmail: from,
      toEmail: recipient.email,
      authorId: userId,
      gmailMessageId: sent.messageId,
      gmailThreadId: sent.threadId,
      sentAt: now().toISOString(),
    })
    .onConflictDoNothing()
    .catch((e) => console.error("Agentmejl: loggningen misslyckades", e instanceof Error ? e.message : e));

  return { ok: true, alreadySent: false, to: recipient.email, subject, gmailThreadId: sent.threadId, companyId: recipient.companyId, ownerId: recipient.ownerId };
}

/** Senaste mejlen med en kontakt, uthyrare eller kund, nyast först. */
export async function emailHistory(
  args: { contactId?: string; ownerId?: string; companyId?: string; limit?: number },
  opts: { db?: DB } = {},
) {
  const db = opts.db ?? defaultDb;
  const conditions = [];
  if (args.contactId) conditions.push(eq(emails.contactId, args.contactId));
  if (args.ownerId) conditions.push(eq(emails.ownerId, args.ownerId));
  if (args.companyId) conditions.push(eq(emails.companyId, args.companyId));
  if (!conditions.length) return null;
  return db
    .select({
      direction: emails.direction,
      subject: emails.subject,
      body: emails.body,
      fromEmail: emails.fromEmail,
      toEmail: emails.toEmail,
      sentAt: emails.sentAt,
      gmailThreadId: emails.gmailThreadId,
    })
    .from(emails)
    .where(or(...conditions))
    .orderBy(desc(emails.sentAt))
    .limit(Math.min(Math.max(args.limit ?? 10, 1), 30));
}
