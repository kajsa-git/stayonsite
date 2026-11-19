// Messenger-trådar från Facebook-datorn på Kajsas Mac (via Kajsas agent), kopplade till
// uthyrare och kontakter i CRM:et. Varje jobbrelaterat Messenger-meddelande loggas på
// tråden; när tråden är kopplad syns meddelandena i uthyrarens tidslinje.
//
// Egna tabeller, inte inkorgen: inkorgen läses av sms-automatiken, som aldrig ska försöka
// svara på ett Messenger-meddelande. Tabellerna skapas av appen själv (CREATE ... IF NOT
// EXISTS), samma mönster som Gmail-synken och svarsmotorn.
import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import type * as schema from "./schema";
import { contacts, owners } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export const MESSENGER_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS crm_messenger_threads (
    thread_id text PRIMARY KEY NOT NULL,
    url text NOT NULL,
    name text,
    owner_id text,
    contact_id text,
    linked_at text,
    last_message_at text,
    created_at text DEFAULT (datetime('now')),
    updated_at text DEFAULT (datetime('now'))
  )`,
  "CREATE INDEX IF NOT EXISTS crm_messenger_threads_owner_idx ON crm_messenger_threads (owner_id)",
  "CREATE INDEX IF NOT EXISTS crm_messenger_threads_contact_idx ON crm_messenger_threads (contact_id)",
  `CREATE TABLE IF NOT EXISTS crm_messenger_messages (
    id text PRIMARY KEY NOT NULL,
    event_key text NOT NULL,
    thread_id text NOT NULL,
    text text NOT NULL,
    detail text,
    seen_at text NOT NULL,
    created_at text DEFAULT (datetime('now'))
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS crm_messenger_messages_event_key_idx ON crm_messenger_messages (event_key)",
  "CREATE INDEX IF NOT EXISTS crm_messenger_messages_thread_idx ON crm_messenger_messages (thread_id, seen_at)",
];

const schemaReady = new WeakMap<object, Promise<void>>();

export function ensureMessengerSchema(db: DB = defaultDb): Promise<void> {
  let ready = schemaReady.get(db);
  if (!ready) {
    ready = (async () => {
      for (const statement of MESSENGER_SCHEMA_STATEMENTS) await db.run(sql.raw(statement));
    })();
    ready.catch(() => schemaReady.delete(db));
    schemaReady.set(db, ready);
  }
  return ready;
}

/** Trådens id ur en Messenger-länk (/messages/t/<id> eller /messages/e2ee/t/<id>), annars null. */
export function messengerThreadId(url: string): string | null {
  try {
    const u = new URL(url, "https://www.facebook.com");
    if (!/(^|\.)(facebook|messenger)\.com$/.test(u.hostname)) return null;
    const m = /\/(?:messages\/)?(?:e2ee\/)?t\/([A-Za-z0-9._-]{1,64})\/?$/.exec(u.pathname);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export type MessengerThread = {
  threadId: string;
  url: string;
  name: string | null;
  ownerId: string | null;
  contactId: string | null;
  ownerName?: string | null;
  contactName?: string | null;
};

async function readThread(db: DB, threadId: string): Promise<MessengerThread | null> {
  const rows = await db.all<{ thread_id: string; url: string; name: string | null; owner_id: string | null; contact_id: string | null }>(
    sql`SELECT thread_id, url, name, owner_id, contact_id FROM crm_messenger_threads WHERE thread_id = ${threadId}`,
  );
  const r = rows[0];
  if (!r) return null;
  const [owner] = r.owner_id ? await db.select({ name: owners.name }).from(owners).where(eq(owners.id, r.owner_id)) : [];
  const [contact] = r.contact_id ? await db.select({ name: contacts.name }).from(contacts).where(eq(contacts.id, r.contact_id)) : [];
  return {
    threadId: r.thread_id,
    url: r.url,
    name: r.name,
    ownerId: owner ? r.owner_id : null,
    contactId: contact ? r.contact_id : null,
    ownerName: owner?.name ?? null,
    contactName: contact?.name ?? null,
  };
}

export type LogInput = { url: string; name?: string | null; text: string; detail?: string | null; eventKey: string; seenAt?: string };

/** Loggar ett Messenger-meddelande på tråden. Samma eventKey loggas bara en gång. */
export async function logMessengerMessage(input: LogInput, deps: { db?: DB } = {}) {
  const db = deps.db ?? defaultDb;
  const threadId = messengerThreadId(input.url);
  if (!threadId) return { status: "invalid" as const, message: "Inte en Messenger-länk." };
  if (!input.eventKey?.trim() || !input.text?.trim()) return { status: "invalid" as const, message: "eventKey och text krävs." };
  await ensureMessengerSchema(db);
  const now = input.seenAt ?? new Date().toISOString();
  const url = `https://www.facebook.com/messages/t/${threadId}`;
  const name = input.name?.trim() || null;
  await db.run(sql`
    INSERT INTO crm_messenger_threads (thread_id, url, name, last_message_at)
    VALUES (${threadId}, ${url}, ${name}, ${now})
    ON CONFLICT(thread_id) DO UPDATE SET
      name = COALESCE(excluded.name, crm_messenger_threads.name),
      last_message_at = excluded.last_message_at,
      updated_at = datetime('now')`);
  const res = await db.run(sql`
    INSERT OR IGNORE INTO crm_messenger_messages (id, event_key, thread_id, text, detail, seen_at)
    VALUES (${randomUUID()}, ${input.eventKey.trim().slice(0, 100)}, ${threadId}, ${input.text.trim().slice(0, 2000)},
            ${input.detail?.slice(0, 6000) ?? null}, ${now})`);
  const thread = await readThread(db, threadId);
  return { status: res.rowsAffected ? ("logged" as const) : ("already_logged" as const), thread: thread! };
}

/** Kopplar en tråd till en uthyrare och/eller kontakt. Båda måste finnas i CRM:et. */
export async function linkMessengerThread(
  input: { url: string; ownerId?: string | null; contactId?: string | null; name?: string | null },
  deps: { db?: DB } = {},
) {
  const db = deps.db ?? defaultDb;
  const threadId = messengerThreadId(input.url);
  if (!threadId) return { status: "invalid" as const, message: "Inte en Messenger-länk." };
  if (!input.ownerId && !input.contactId) return { status: "invalid" as const, message: "Ange ownerId eller contactId." };
  if (input.ownerId) {
    const [o] = await db.select({ id: owners.id }).from(owners).where(eq(owners.id, input.ownerId));
    if (!o) return { status: "invalid" as const, message: `Ingen uthyrare med id ${input.ownerId}.` };
  }
  if (input.contactId) {
    const [c] = await db.select({ id: contacts.id }).from(contacts).where(eq(contacts.id, input.contactId));
    if (!c) return { status: "invalid" as const, message: `Ingen kontakt med id ${input.contactId}.` };
  }
  await ensureMessengerSchema(db);
  const url = `https://www.facebook.com/messages/t/${threadId}`;
  await db.run(sql`
    INSERT INTO crm_messenger_threads (thread_id, url, name, owner_id, contact_id, linked_at)
    VALUES (${threadId}, ${url}, ${input.name?.trim() || null}, ${input.ownerId ?? null}, ${input.contactId ?? null}, datetime('now'))
    ON CONFLICT(thread_id) DO UPDATE SET
      owner_id = COALESCE(excluded.owner_id, crm_messenger_threads.owner_id),
      contact_id = COALESCE(excluded.contact_id, crm_messenger_threads.contact_id),
      name = COALESCE(excluded.name, crm_messenger_threads.name),
      linked_at = datetime('now'),
      updated_at = datetime('now')`);
  return { status: "linked" as const, thread: (await readThread(db, threadId))! };
}

export type MessengerMessage = { id: string; threadId: string; url: string; text: string; seenAt: string };

/** Messenger-meddelanden i trådar som är kopplade till uthyraren, nyast först. */
export async function messengerMessagesForOwner(ownerId: string, deps: { db?: DB; limit?: number } = {}): Promise<MessengerMessage[]> {
  const db = deps.db ?? defaultDb;
  await ensureMessengerSchema(db);
  const rows = await db.all<{ id: string; thread_id: string; url: string; text: string; seen_at: string }>(sql`
    SELECT m.id, m.thread_id, t.url, m.text, m.seen_at
    FROM crm_messenger_messages m JOIN crm_messenger_threads t ON t.thread_id = m.thread_id
    WHERE t.owner_id = ${ownerId}
    ORDER BY m.seen_at DESC LIMIT ${deps.limit ?? 200}`);
  return rows.map((r) => ({ id: r.id, threadId: r.thread_id, url: r.url, text: r.text, seenAt: r.seen_at }));
}
