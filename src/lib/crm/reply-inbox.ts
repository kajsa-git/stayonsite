// "Att svara på" i Min dag: olästa SMS och mejl som väntar på svar, samlade per person.
// Ett svar är ingen egen etapp i funneln utan en knuff som gäller någon som oftast redan
// finns där — därför grupperas allt per uthyrare/kontakt och berikas med hur många öppna
// förfrågningar företaget har, så att svaret kan avslutas med ett funnel-beslut.
import { and, eq, inArray, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import { computeWaitingEmails, ensureEmailSyncSchema, getMailboxSyncStatus, type WaitingThread } from "./email-sync";
import { listInbox, type InboxItem } from "./inbox-list";
import * as schema from "./schema";
import { emailSenderSuggestions, requests } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export type SmsReply = Pick<
  InboxItem,
  "id" | "fromPhone" | "body" | "service" | "sentAt" | "ownerId" | "contactId" | "companyId" |
  "ownerName" | "contactName" | "companyName" | "repliedTo" | "replyStatus"
>;

export type MailReply = Pick<
  WaitingThread,
  "key" | "gmailThreadId" | "subject" | "fromEmail" | "fromName" | "preview" | "sentAt" | "messageCount" | "unreadIds" |
  "companyId" | "companyName" | "contactId" | "contactName" | "ownerId" | "ownerName"
>;

export interface ReplyGroup {
  key: string;
  name: string;
  context: string | null; // företagsnamn, "Uthyrare", båda, eller null för okända
  companyName: string | null;
  companyId: string | null;
  contactId: string | null;
  ownerId: string | null;
  phone: string | null;
  email: string | null;
  latestAt: string;
  preview: string;
  sms: SmsReply[]; // nyast först
  mails: MailReply[]; // nyast först
  openRequests: number; // företagets förfrågningar i incoming/matching/won
}

function groupKey(item: { ownerId: string | null; contactId: string | null; companyId: string | null }, fallback: string): string {
  if (item.ownerId) return `owner:${item.ownerId}`;
  if (item.contactId) return `contact:${item.contactId}`;
  if (item.companyId) return `company:${item.companyId}:${fallback}`;
  return `unknown:${fallback}`;
}

function oneLine(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

// Samma person kan ha både sms:at och mejlat: ett kort per person, nyast överst.
export function groupReplies(sms: SmsReply[], mails: MailReply[]): ReplyGroup[] {
  const groups = new Map<string, ReplyGroup>();
  const entry = (key: string, init: () => ReplyGroup) => {
    let g = groups.get(key);
    if (!g) groups.set(key, (g = init()));
    return g;
  };

  for (const s of sms) {
    const g = entry(groupKey(s, s.fromPhone), () => ({
      key: groupKey(s, s.fromPhone),
      name: s.contactName ?? s.ownerName ?? s.companyName ?? s.fromPhone,
      context: null,
      companyName: s.companyName,
      companyId: s.companyId,
      contactId: s.contactId,
      ownerId: s.ownerId,
      phone: s.fromPhone,
      email: null,
      latestAt: s.sentAt,
      preview: oneLine(s.body),
      sms: [],
      mails: [],
      openRequests: 0,
    }));
    g.sms.push(s);
    g.phone ??= s.fromPhone;
    g.companyName ??= s.companyName;
    g.companyId ??= s.companyId;
    g.contactId ??= s.contactId;
    if (s.sentAt > g.latestAt) {
      g.latestAt = s.sentAt;
      g.preview = oneLine(s.body);
    }
  }

  for (const m of mails) {
    const g = entry(groupKey(m, m.fromEmail), () => ({
      key: groupKey(m, m.fromEmail),
      name: m.contactName ?? m.ownerName ?? m.fromName ?? m.fromEmail,
      context: null,
      companyName: m.companyName,
      companyId: m.companyId,
      contactId: m.contactId,
      ownerId: m.ownerId,
      phone: null,
      email: m.fromEmail,
      latestAt: m.sentAt,
      preview: oneLine(m.preview || m.subject),
      sms: [],
      mails: [],
      openRequests: 0,
    }));
    g.mails.push(m);
    g.email ??= m.fromEmail;
    g.companyId ??= m.companyId;
    g.contactId ??= m.contactId;
    g.companyName ??= m.companyName;
    if (m.sentAt > g.latestAt) {
      g.latestAt = m.sentAt;
      g.preview = oneLine(m.preview || m.subject);
    }
  }

  for (const g of groups.values()) {
    g.context = g.companyName
      ? g.ownerId ? `${g.companyName} · även uthyrare` : g.companyName
      : g.ownerId ? "Uthyrare" : null;
    g.sms.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    g.mails.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }
  return [...groups.values()].sort((a, b) => b.latestAt.localeCompare(a.latestAt));
}

export interface ReplyInbox {
  groups: ReplyGroup[];
  suggestionCount: number;
  mailSync: { lastRunAt: string | null; lastSuccessAt: string | null; lastError: string | null };
}

export async function computeReplyInbox(opts: { db?: DB } = {}): Promise<ReplyInbox> {
  const db = opts.db ?? defaultDb;
  await ensureEmailSyncSchema(db);
  const [sms, mails, mailSync, [suggestions]] = await Promise.all([
    listInbox({ unreadOnly: true, db }),
    computeWaitingEmails({ db }),
    getMailboxSyncStatus(db),
    db.select({ n: sql<number>`count(*)` }).from(emailSenderSuggestions).where(eq(emailSenderSuggestions.status, "pending")),
  ]);
  const groups = groupReplies(sms, mails);

  const companyIds = [...new Set(groups.map((g) => g.companyId).filter(Boolean) as string[])];
  if (companyIds.length) {
    const counts = await db
      .select({ companyId: requests.companyId, n: sql<number>`count(*)` })
      .from(requests)
      .where(and(inArray(requests.companyId, companyIds), inArray(requests.status, ["incoming", "matching", "won"])))
      .groupBy(requests.companyId);
    const byCompany = new Map(counts.map((c) => [c.companyId, Number(c.n)]));
    for (const g of groups) if (g.companyId) g.openRequests = byCompany.get(g.companyId) ?? 0;
  }

  return { groups, suggestionCount: Number(suggestions?.n ?? 0), mailSync };
}
