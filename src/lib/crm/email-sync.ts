// Gmail ↔ CRM-synk. Två vägar in, samma importregler:
//  • runMailboxSync: bakgrundsjobbet (GitHub Actions var 15:e minut). Läser bara det som
//    hänt i brevlådan sedan förra körningen via Gmails historik-API och kopplar varje
//    nytt mejl till rätt företag och/eller uthyrare.
//  • syncEntityEmails: ↻ Synka på ett enskilt företags-/uthyrarkort (sökning per adress).
// Okända avsändare på ett känt företags domän hamnar i en förslagskö i stället för att
// kopplas automatiskt.
import { and, desc, eq, gte, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import {
  buildAddressBook,
  hasLinks,
  isAutomaticMessage,
  isOutgoing,
  normalizeEmail,
  parseAddressList,
  resolveMessageLinks,
  suggestSender,
  type AddressBook,
  type MessageLinks,
  type SenderSuggestion,
  type ThreadLinks,
} from "./email-matching";
import {
  GmailHistoryExpiredError,
  GmailRateLimitError,
  gmailAutomationUserId,
  gmailCurrentHistoryId,
  gmailGetMessage,
  gmailGetThread,
  gmailListAddedMessageIds,
  gmailListMessageIds,
  gmailSearchThreadIds,
  type GmailMessage,
} from "./gmail";
import * as schema from "./schema";
import { companies, contacts, emailSenderSuggestions, emails, gmailSyncState, owners } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export const CRM_MAILBOX = mailboxOf(process.env.CRM_FROM ?? "kajsa@stayonsite.se");

function mailboxOf(value: string): string {
  return parseAddressList(value)[0]?.email ?? value.trim().toLowerCase();
}

// ─── Schema ──────────────────────────────────────────────────────────────────

// Samma satser som drizzle/0050_gmail_mailbox_sync.sql (ett test håller dem i takt).
// Appen skapar tabellerna själv vid första synken, så en driftsättning aldrig väntar
// på att migreringsskriptet körts manuellt.
export const EMAIL_SYNC_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS crm_gmail_sync_state (
  mailbox text PRIMARY KEY NOT NULL,
  history_id text,
  backfill_after text,
  last_run_at text,
  last_success_at text,
  last_error text,
  last_imported integer DEFAULT 0 NOT NULL,
  updated_at text DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS crm_email_sender_suggestions (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  name text,
  domain text NOT NULL,
  company_ids text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  message_count integer DEFAULT 1 NOT NULL,
  last_gmail_message_id text,
  last_gmail_thread_id text,
  last_subject text,
  last_snippet text,
  last_seen_at text NOT NULL,
  resolved_contact_id text REFERENCES crm_contacts(id) ON DELETE SET NULL,
  resolved_at text,
  created_at text DEFAULT (datetime('now'))
)`,
  "CREATE UNIQUE INDEX IF NOT EXISTS crm_email_sender_suggestions_email_unique_idx ON crm_email_sender_suggestions (email)",
  "CREATE INDEX IF NOT EXISTS crm_email_sender_suggestions_status_idx ON crm_email_sender_suggestions (status)",
  "CREATE INDEX IF NOT EXISTS crm_emails_gmail_thread_id_idx ON crm_emails (gmail_thread_id)",
];

const schemaReady = new WeakMap<object, Promise<void>>();

export function ensureEmailSyncSchema(db: DB = defaultDb): Promise<void> {
  let ready = schemaReady.get(db);
  if (!ready) {
    ready = (async () => {
      for (const statement of EMAIL_SYNC_SCHEMA_STATEMENTS) await db.run(sql.raw(statement));
    })();
    ready.catch(() => schemaReady.delete(db));
    schemaReady.set(db, ready);
  }
  return ready;
}

// ─── Hjälpare ────────────────────────────────────────────────────────────────

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  let failed = false; // ett fel stoppar övriga arbetare — inga fler anrop i onödan
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length && !failed) {
        const index = next++;
        try {
          results[index] = await fn(items[index]);
        } catch (error) {
          failed = true;
          throw error;
        }
      }
    }),
  );
  return results;
}

function messageTime(msg: Pick<GmailMessage, "receivedAt" | "date">): string {
  if (msg.receivedAt) return msg.receivedAt;
  const parsed = new Date(msg.date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function htmlToText(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

// Det nya i ett svar, utan citerad tidigare text — för förhandsvisning i Min dag.
export function replyPreview(body: string, max = 280): string {
  const lines: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith(">")) break;
    if (/^(on|den|am|le|w dniu)\b.*(wrote|skrev|schrieb|écrit|napisał)/i.test(t)) break;
    if (/^-{2,}\s*(original|ursprungligt|vidarebefordrat|forwarded)/i.test(t)) break;
    if (/^(från|from|von|od):\s/i.test(t) && lines.length) break;
    lines.push(line);
  }
  const text = lines.join("\n").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// ─── Adressbok och trådkopplingar ────────────────────────────────────────────

export async function loadAddressBook(db: DB = defaultDb): Promise<AddressBook> {
  const [contactRows, companyRows, ownerRows] = await Promise.all([
    db.select({ id: contacts.id, companyId: contacts.companyId, email: contacts.email }).from(contacts).where(isNotNull(contacts.email)),
    db.select({ id: companies.id, website: companies.website, invoiceEmail: companies.invoiceEmail }).from(companies),
    db.select({ id: owners.id, email: owners.email }).from(owners).where(isNotNull(owners.email)),
  ]);
  return buildAddressBook({ contacts: contactRows, companies: companyRows, owners: ownerRows });
}

async function threadLinksFor(db: DB, threadIds: string[]): Promise<Map<string, ThreadLinks>> {
  const map = new Map<string, ThreadLinks>();
  for (const ids of chunk([...new Set(threadIds)], 200)) {
    const rows = await db
      .select({ threadId: emails.gmailThreadId, companyId: emails.companyId, ownerId: emails.ownerId })
      .from(emails)
      .where(and(inArray(emails.gmailThreadId, ids), or(isNotNull(emails.companyId), isNotNull(emails.ownerId))));
    for (const r of rows) {
      if (!r.threadId) continue;
      const current = map.get(r.threadId) ?? { companyId: null, ownerId: null };
      map.set(r.threadId, { companyId: current.companyId ?? r.companyId, ownerId: current.ownerId ?? r.ownerId });
    }
  }
  return map;
}

async function existingMessageIds(db: DB, messageIds: string[]): Promise<Set<string>> {
  const found = new Set<string>();
  for (const ids of chunk(messageIds, 200)) {
    const rows = await db.select({ id: emails.gmailMessageId }).from(emails).where(inArray(emails.gmailMessageId, ids));
    for (const r of rows) if (r.id) found.add(r.id);
  }
  return found;
}

// ─── Import av ett meddelande ────────────────────────────────────────────────

export type ImportOutcome = "inserted" | "linked" | "unchanged";

// Lägger in meddelandet, eller — finns det redan (Gmail-id:t är unikt) — fyller i de
// kopplingar som saknas. Så hamnar ett mejl till en person som är både kundkontakt och
// uthyrare på båda korten, oavsett vilket kort som synkades först.
export async function importGmailMessage(
  db: DB,
  msg: GmailMessage,
  links: MessageLinks,
  opts: { mailbox?: string; isRead?: boolean } = {},
): Promise<ImportOutcome> {
  const mailbox = opts.mailbox ?? CRM_MAILBOX;
  const [existing] = await db
    .select({ id: emails.id, companyId: emails.companyId, ownerId: emails.ownerId, contactId: emails.contactId })
    .from(emails)
    .where(eq(emails.gmailMessageId, msg.id))
    .limit(1);

  if (existing) {
    const patch: Partial<typeof emails.$inferInsert> = {};
    if (!existing.companyId && links.companyId) patch.companyId = links.companyId;
    if (!existing.ownerId && links.ownerId) patch.ownerId = links.ownerId;
    if (!existing.contactId && links.contactId && (existing.companyId ?? links.companyId) === links.companyId) {
      patch.contactId = links.contactId;
    }
    if (!Object.keys(patch).length) return "unchanged";
    await db.update(emails).set(patch).where(eq(emails.id, existing.id));
    return "linked";
  }

  const outgoing = isOutgoing(msg, mailbox);
  const inserted = await db
    .insert(emails)
    .values({
      id: nanoid(),
      companyId: links.companyId,
      contactId: links.contactId,
      ownerId: links.ownerId,
      direction: outgoing ? "out" : "in",
      subject: msg.subject || "(inget ämne)",
      body: msg.text || htmlToText(msg.html) || msg.snippet || "(inget textinnehåll)",
      html: msg.html,
      fromEmail: msg.from,
      toEmail: [msg.to, msg.cc].filter(Boolean).join(", "),
      gmailMessageId: msg.id,
      gmailThreadId: msg.threadId,
      isRead: outgoing || isAutomaticMessage(msg) ? true : opts.isRead ?? false,
      sentAt: messageTime(msg),
    })
    .onConflictDoNothing()
    .returning({ id: emails.id });
  return inserted.length ? "inserted" : "unchanged";
}

// ─── Förslagskön för okända avsändare ────────────────────────────────────────

export async function recordSenderSuggestion(
  db: DB,
  suggestion: SenderSuggestion,
  msg: Pick<GmailMessage, "id" | "threadId" | "subject" | "snippet" | "receivedAt" | "date">,
): Promise<"created" | "updated" | "skipped"> {
  const seenAt = messageTime(msg);
  const [existing] = await db
    .select()
    .from(emailSenderSuggestions)
    .where(eq(emailSenderSuggestions.email, suggestion.email))
    .limit(1);

  if (existing) {
    if (existing.status === "ignored" || existing.lastGmailMessageId === msg.id) return "skipped";
    const reopened = existing.status === "linked"; // kontakten har tagits bort sedan dess
    await db
      .update(emailSenderSuggestions)
      .set({
        status: "pending",
        name: existing.name ?? suggestion.name,
        domain: suggestion.domain,
        companyIds: suggestion.companyIds,
        messageCount: reopened ? 1 : existing.messageCount + 1,
        lastGmailMessageId: msg.id,
        lastGmailThreadId: msg.threadId,
        lastSubject: msg.subject,
        lastSnippet: msg.snippet.slice(0, 400),
        lastSeenAt: seenAt > existing.lastSeenAt ? seenAt : existing.lastSeenAt,
        resolvedAt: reopened ? null : existing.resolvedAt,
        resolvedContactId: reopened ? null : existing.resolvedContactId,
      })
      .where(eq(emailSenderSuggestions.id, existing.id));
    return "updated";
  }

  const inserted = await db
    .insert(emailSenderSuggestions)
    .values({
      id: nanoid(),
      email: suggestion.email,
      name: suggestion.name,
      domain: suggestion.domain,
      companyIds: suggestion.companyIds,
      lastGmailMessageId: msg.id,
      lastGmailThreadId: msg.threadId,
      lastSubject: msg.subject,
      lastSnippet: msg.snippet.slice(0, 400),
      lastSeenAt: seenAt,
    })
    .onConflictDoNothing()
    .returning({ id: emailSenderSuggestions.id });
  return inserted.length ? "created" : "skipped";
}

export interface SuggestionView {
  id: string;
  email: string;
  name: string | null;
  domain: string;
  messageCount: number;
  lastSubject: string | null;
  lastSnippet: string | null;
  lastSeenAt: string;
  companies: { id: string; name: string }[];
}

export async function listSenderSuggestions(db: DB = defaultDb): Promise<SuggestionView[]> {
  await ensureEmailSyncSchema(db);
  const rows = await db
    .select()
    .from(emailSenderSuggestions)
    .where(eq(emailSenderSuggestions.status, "pending"))
    .orderBy(desc(emailSenderSuggestions.lastSeenAt))
    .limit(50);
  const ids = [...new Set(rows.flatMap((r) => r.companyIds ?? []))];
  const names = new Map<string, string>();
  for (const part of chunk(ids, 200)) {
    const found = await db.select({ id: companies.id, name: companies.name }).from(companies).where(inArray(companies.id, part));
    for (const c of found) names.set(c.id, c.name);
  }
  return rows
    .map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      domain: r.domain,
      messageCount: r.messageCount,
      lastSubject: r.lastSubject,
      lastSnippet: r.lastSnippet,
      lastSeenAt: r.lastSeenAt,
      companies: (r.companyIds ?? []).filter((id) => names.has(id)).map((id) => ({ id, name: names.get(id)! })),
    }))
    .filter((r) => r.companies.length > 0);
}

export class SuggestionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// "Koppla": avsändaren blir kontakt på det valda företaget och företagets mejl synkas
// direkt, så att tråden syns på kortet utan att vänta på nästa bakgrundskörning.
export async function linkSenderSuggestion(
  db: DB,
  id: string,
  companyId: string,
  opts: { userId?: string; syncNow?: boolean } = {},
): Promise<{ contactId: string; synced: number; syncError?: string }> {
  await ensureEmailSyncSchema(db);
  const [suggestion] = await db.select().from(emailSenderSuggestions).where(eq(emailSenderSuggestions.id, id)).limit(1);
  if (!suggestion) throw new SuggestionError("Förslaget finns inte längre", 404);
  if (suggestion.status !== "pending") throw new SuggestionError("Förslaget är redan hanterat", 409);
  const [company] = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, companyId)).limit(1);
  if (!company) throw new SuggestionError("Företaget finns inte", 404);

  const [existingContact] = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(eq(contacts.companyId, companyId), sql`lower(trim(${contacts.email})) = ${suggestion.email}`))
    .limit(1);
  const contactId = existingContact?.id ?? nanoid();
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    if (!existingContact) {
      await tx.insert(contacts).values({ id: contactId, companyId, name: suggestion.name, email: suggestion.email, isPrimary: false });
    }
    await tx
      .update(emailSenderSuggestions)
      .set({ status: "linked", resolvedContactId: contactId, resolvedAt: now })
      .where(eq(emailSenderSuggestions.id, id));
  });

  // Kopplingen står kvar även om Gmail inte svarar just nu — nästa synk hämtar mejlen.
  if (opts.syncNow === false) return { contactId, synced: 0 };
  try {
    const userId = opts.userId ?? await gmailAutomationUserId(CRM_MAILBOX);
    const { synced } = await syncEntityEmails(db, userId, { companyId });
    return { contactId, synced };
  } catch (error) {
    return { contactId, synced: 0, syncError: error instanceof Error ? error.message : String(error) };
  }
}

export async function ignoreSenderSuggestion(db: DB, id: string): Promise<void> {
  await ensureEmailSyncSchema(db);
  const updated = await db
    .update(emailSenderSuggestions)
    .set({ status: "ignored", resolvedAt: new Date().toISOString() })
    .where(and(eq(emailSenderSuggestions.id, id), eq(emailSenderSuggestions.status, "pending")))
    .returning({ id: emailSenderSuggestions.id });
  if (!updated.length) throw new SuggestionError("Förslaget finns inte eller är redan hanterat", 404);
}

// ─── ↻ Synka på ett enskilt kort ─────────────────────────────────────────────

export async function syncEntityEmails(
  db: DB,
  userId: string,
  scope: { companyId: string } | { ownerId: string },
  opts: { mailbox?: string } = {},
): Promise<{ synced: number }> {
  const mailbox = opts.mailbox ?? CRM_MAILBOX;
  const companyId = "companyId" in scope ? scope.companyId : null;
  const ownerId = "ownerId" in scope ? scope.ownerId : null;
  const scopeFilter = companyId ? eq(emails.companyId, companyId) : eq(emails.ownerId, ownerId!);

  const existing = await db.select({ threadId: emails.gmailThreadId }).from(emails).where(scopeFilter);
  const threadIds = new Set(existing.map((e) => e.threadId).filter(Boolean) as string[]);

  let searchEmails: string[];
  if (companyId) {
    const [rows, [company]] = await Promise.all([
      db.select({ email: contacts.email }).from(contacts).where(eq(contacts.companyId, companyId)),
      db.select({ invoiceEmail: companies.invoiceEmail }).from(companies).where(eq(companies.id, companyId)),
    ]);
    searchEmails = [...rows.map((c) => c.email), company?.invoiceEmail ?? null]
      .flatMap((v) => (v ?? "").split(/[\s,;]+/))
      .map((v) => normalizeEmail(v))
      .filter((v): v is string => Boolean(v));
  } else {
    const [owner] = await db.select({ email: owners.email }).from(owners).where(eq(owners.id, ownerId!));
    searchEmails = (owner?.email ?? "").split(/[\s,;]+/).map((v) => normalizeEmail(v)).filter((v): v is string => Boolean(v));
  }
  for (const addr of new Set(searchEmails)) {
    for (const id of await gmailSearchThreadIds(userId, addr)) threadIds.add(id);
  }
  if (!threadIds.size) return { synced: 0 };

  const book = await loadAddressBook(db);
  const scopeLinks: ThreadLinks = { companyId, ownerId };
  let synced = 0;
  for (const threadId of threadIds) {
    const messages = await gmailGetThread(userId, threadId);
    for (const msg of messages) {
      // Drafts are not sent mail. Never display or count them as a reply.
      if (msg.labelIds.some((label) => ["DRAFT", "SPAM", "TRASH", "CHAT"].includes(label))) continue;
      // Kortets egen koppling gäller alltid; övriga (t.ex. samma person som uthyrare)
      // läggs till utifrån adresserna.
      const links = resolveMessageLinks(msg, book, mailbox, scopeLinks);
      const outcome = await importGmailMessage(db, msg, links, { mailbox });
      if (outcome !== "unchanged") synced++;
    }
  }
  return { synced };
}

// ─── Bakgrundssynken ─────────────────────────────────────────────────────────

const BOOTSTRAP_DAYS = 30;
const MAX_SCAN = 1000;
const RECENT_UNREAD_MS = 48 * 60 * 60 * 1000;

export interface MailboxSyncSummary {
  mode: "bootstrap" | "incremental" | "recovery";
  scanned: number;
  imported: number;
  linked: number;
  suggested: number;
  partial: boolean;
}

export async function runMailboxSync(opts: {
  db?: DB;
  mailbox?: string;
  budgetMs?: number;
  now?: () => number;
} = {}): Promise<MailboxSyncSummary> {
  const db = opts.db ?? defaultDb;
  const mailbox = opts.mailbox ?? CRM_MAILBOX;
  const now = opts.now ?? Date.now;
  const started = now();
  const deadline = started + (opts.budgetMs ?? 45_000);
  await ensureEmailSyncSchema(db);

  const [state] = await db.select().from(gmailSyncState).where(eq(gmailSyncState.mailbox, mailbox)).limit(1);
  const startedIso = new Date(started).toISOString();
  await db
    .insert(gmailSyncState)
    .values({ mailbox, lastRunAt: startedIso })
    .onConflictDoUpdate({ target: gmailSyncState.mailbox, set: { lastRunAt: startedIso, updatedAt: startedIso } });

  try {
    const userId = await gmailAutomationUserId(mailbox);
    let mode: MailboxSyncSummary["mode"];
    let messageIds: string[];
    let nextHistoryId: string;

    // Sökfönster för första synken och återhämtning: fortsätt efter senast genomgångna
    // mejl om en tidigare körning hann bara en del, annars de senaste `days` dagarna.
    const searchQuery = (days: number) =>
      state?.backfillAfter
        ? `after:${Math.floor(Date.parse(state.backfillAfter) / 1000) - 1} -in:chats -in:drafts`
        : `newer_than:${days}d -in:chats -in:drafts`;

    if (state?.historyId && !state.backfillAfter) {
      try {
        const added = await gmailListAddedMessageIds(userId, state.historyId);
        mode = "incremental";
        messageIds = added.messageIds;
        nextHistoryId = added.historyId;
      } catch (error) {
        if (!(error instanceof GmailHistoryExpiredError)) throw error;
        // Historiken har gått ut (synken har stått still i över en vecka): sök i stället
        // igenom perioden sedan senaste lyckade körning.
        mode = "recovery";
        nextHistoryId = await gmailCurrentHistoryId(userId);
        const since = state.lastSuccessAt ? Date.parse(state.lastSuccessAt) : NaN;
        const days = Number.isNaN(since) ? BOOTSTRAP_DAYS : Math.min(BOOTSTRAP_DAYS, Math.ceil((started - since) / 86_400_000) + 1);
        messageIds = (await gmailListMessageIds(userId, searchQuery(days), MAX_SCAN)).reverse();
      }
    } else {
      // Första körningen (eller fortsättning på den): ta historik-id:t FÖRE sökningen så
      // att inget mejl hamnar mellan sökningen och nästa inkrementella körning.
      mode = state?.historyId ? "recovery" : "bootstrap";
      nextHistoryId = await gmailCurrentHistoryId(userId);
      messageIds = (await gmailListMessageIds(userId, searchQuery(BOOTSTRAP_DAYS), MAX_SCAN)).reverse();
    }

    const known = await existingMessageIds(db, messageIds);
    const pending = messageIds.filter((id) => !known.has(id));
    const book = await loadAddressBook(db);
    const summary: MailboxSyncSummary = { mode, scanned: 0, imported: 0, linked: 0, suggested: 0, partial: false };
    let processedUntil: string | null = null;

    // I historikordning (äldst först) så att en tråd som kopplas av ett tidigare
    // meddelande också fångar senare svar från nya adresser i samma körning.
    const processChunk = async (ids: string[]) => {
      const metas = (await mapLimited(ids, 3, (id) => gmailGetMessage(userId, id, "metadata")))
        .filter((m): m is GmailMessage => Boolean(m))
        .filter((m) => !m.labelIds.some((l) => l === "DRAFT" || l === "SPAM" || l === "TRASH" || l === "CHAT"));
      summary.scanned += ids.length;
      const threads = await threadLinksFor(db, metas.map((m) => m.threadId));

      // Matcha i ordning (billigt, i minnet) så att trådkopplingar förs vidare, hämta
      // sedan de matchade mejlen parallellt och importera dem i ordning.
      const toImport: { meta: GmailMessage; links: MessageLinks }[] = [];
      for (const meta of metas) {
        const links = resolveMessageLinks(meta, book, mailbox, threads.get(meta.threadId));
        if (hasLinks(links)) {
          toImport.push({ meta, links });
          threads.set(meta.threadId, {
            companyId: threads.get(meta.threadId)?.companyId ?? links.companyId,
            ownerId: threads.get(meta.threadId)?.ownerId ?? links.ownerId,
          });
          continue;
        }
        const suggestion = suggestSender(meta, book, mailbox);
        if (suggestion && (await recordSenderSuggestion(db, suggestion, meta)) !== "skipped") summary.suggested++;
      }

      const fulls = await mapLimited(toImport, 2, ({ meta }) => gmailGetMessage(userId, meta.id, "full"));
      for (let i = 0; i < toImport.length; i++) {
        const full = fulls[i];
        if (!full) continue;
        // Äldre mejl som tas in vid första körningen räknas som redan hanterade, så att
        // Min dag inte fylls av en månads gamla trådar.
        const isRead = mode !== "incremental" && Date.parse(messageTime(full)) < started - RECENT_UNREAD_MS;
        const outcome = await importGmailMessage(db, full, toImport[i].links, { mailbox, isRead });
        if (outcome === "inserted") summary.imported++;
        if (outcome === "linked") summary.linked++;
      }
      for (const meta of metas) {
        if (meta.receivedAt && (!processedUntil || meta.receivedAt > processedUntil)) processedUntil = meta.receivedAt;
      }
    };

    for (const ids of chunk(pending, 16)) {
      if (now() > deadline) {
        summary.partial = true;
        break;
      }
      try {
        await processChunk(ids);
      } catch (error) {
        // Gmails hastighetsgräns: spara det som hunnits och fortsätt vid nästa körning.
        if (!(error instanceof GmailRateLimitError)) throw error;
        summary.partial = true;
        break;
      }
    }

    const finishedIso = new Date(now()).toISOString();
    const progress: Partial<typeof gmailSyncState.$inferInsert> = !summary.partial
      ? { historyId: nextHistoryId, backfillAfter: null, lastSuccessAt: finishedIso }
      : mode === "incremental"
        ? {} // Avbruten inkrementell körning: behåll startpunkten; nästa körning tar resten.
        : { backfillAfter: processedUntil ?? state?.backfillAfter ?? null }; // fortsätt efter senast genomgångna mejl
    await db
      .update(gmailSyncState)
      .set({ ...progress, lastError: null, lastImported: summary.imported + summary.linked, updatedAt: finishedIso })
      .where(eq(gmailSyncState.mailbox, mailbox));
    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(gmailSyncState)
      .set({ lastError: message.slice(0, 500), updatedAt: new Date(now()).toISOString() })
      .where(eq(gmailSyncState.mailbox, mailbox));
    throw error;
  }
}

export async function getMailboxSyncStatus(db: DB = defaultDb, mailbox = CRM_MAILBOX) {
  await ensureEmailSyncSchema(db);
  const [state] = await db.select().from(gmailSyncState).where(eq(gmailSyncState.mailbox, mailbox)).limit(1);
  return {
    lastRunAt: state?.lastRunAt ?? null,
    lastSuccessAt: state?.lastSuccessAt ?? null,
    lastError: state?.lastError ?? null,
  };
}

// ─── Mejl som väntar på svar (Min dag) ───────────────────────────────────────

export interface WaitingThread {
  key: string;
  gmailThreadId: string | null;
  latestId: string;
  subject: string;
  fromEmail: string;
  fromName: string | null;
  preview: string;
  sentAt: string;
  messageCount: number;
  unreadIds: string[];
  companyId: string | null;
  companyName: string | null;
  contactId: string | null;
  contactName: string | null;
  ownerId: string | null;
  ownerName: string | null;
}

// Trådar där senaste meddelandet är ett oläst inkommande mejl, de senaste `days`
// dagarna. Svarar Kajsa — i CRM:et eller direkt i Gmail — synkas svaret in och tråden
// försvinner av sig själv; ✓ Hanterad markerar den som läst.
export async function computeWaitingEmails(opts: { db?: DB; days?: number; now?: number } = {}): Promise<WaitingThread[]> {
  const db = opts.db ?? defaultDb;
  const cutoff = new Date((opts.now ?? Date.now()) - (opts.days ?? 14) * 86_400_000).toISOString();
  const rows = await db
    .select({
      id: emails.id,
      gmailThreadId: emails.gmailThreadId,
      direction: emails.direction,
      subject: emails.subject,
      body: emails.body,
      fromEmail: emails.fromEmail,
      isRead: emails.isRead,
      sentAt: emails.sentAt,
      companyId: emails.companyId,
      ownerId: emails.ownerId,
      contactId: emails.contactId,
      companyName: companies.name,
      ownerName: owners.name,
      contactName: contacts.name,
    })
    .from(emails)
    .leftJoin(companies, eq(emails.companyId, companies.id))
    .leftJoin(owners, eq(emails.ownerId, owners.id))
    .leftJoin(contacts, eq(emails.contactId, contacts.id))
    .where(and(gte(emails.sentAt, cutoff), or(isNotNull(emails.companyId), isNotNull(emails.ownerId))));

  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.gmailThreadId ?? `solo-${r.id}`;
    const list = groups.get(key);
    if (list) list.push(r);
    else groups.set(key, [r]);
  }

  const result: WaitingThread[] = [];
  for (const [key, list] of groups) {
    list.sort((a, b) => a.sentAt.localeCompare(b.sentAt));
    const latest = list[list.length - 1];
    if (latest.direction !== "in" || latest.isRead) continue;
    const linked = [...list].reverse();
    const sender = parseAddressList(latest.fromEmail)[0];
    result.push({
      key,
      gmailThreadId: latest.gmailThreadId,
      latestId: latest.id,
      subject: latest.subject,
      fromEmail: sender?.email ?? latest.fromEmail,
      fromName: sender?.name ?? null,
      preview: replyPreview(latest.body),
      sentAt: latest.sentAt,
      messageCount: list.length,
      unreadIds: list.filter((m) => m.direction === "in" && !m.isRead).map((m) => m.id),
      companyId: linked.find((m) => m.companyId)?.companyId ?? null,
      companyName: linked.find((m) => m.companyName)?.companyName ?? null,
      contactId: linked.find((m) => m.contactId)?.contactId ?? null,
      contactName: linked.find((m) => m.contactName)?.contactName ?? null,
      ownerId: linked.find((m) => m.ownerId)?.ownerId ?? null,
      ownerName: linked.find((m) => m.ownerName)?.ownerName ?? null,
    });
  }
  return result.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export async function markEmailsRead(db: DB, ids: string[]): Promise<number> {
  let count = 0;
  for (const part of chunk([...new Set(ids)], 200)) {
    const updated = await db
      .update(emails)
      .set({ isRead: true })
      .where(and(inArray(emails.id, part), or(eq(emails.isRead, false), isNull(emails.isRead))))
      .returning({ id: emails.id });
    count += updated.length;
  }
  return count;
}
