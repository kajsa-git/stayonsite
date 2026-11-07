// Inlärning från historiken: går igenom Kajsas tidigare SMS/WhatsApp- och
// mejlkonversationer och destillerar en playbook – hur hon skriver, vilka frågor
// som återkommer, vad hon brukar svara och vad som för affären framåt.
// Playbooken sparas i databasen (aldrig i koden – repot är publikt) och kan
// redigeras av Kajsa i CRM:et. Motorn läser den vid varje beslut.
import { and, asc, eq, isNotNull, or, sql } from "drizzle-orm";
import { db as defaultDb } from "../db";
import { companies, emails, inboxMessages, owners } from "../schema";
import { normalizeTime, stripQuoted } from "./context";
import { callClaude } from "./decide";
import { setSetting, type DB } from "./store";

interface Conversation {
  key: string;
  kind: "uthyrare" | "företag";
  name: string;
  lines: { at: string; from: "kontakt" | "Kajsa"; channel: string; text: string }[];
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

async function loadConversations(db: DB, maxConversations: number): Promise<Conversation[]> {
  const convs = new Map<string, Conversation>();
  const ownerNames = new Map((await db.select({ id: owners.id, name: owners.name }).from(owners)).map((o) => [o.id, o.name]));
  const companyNames = new Map((await db.select({ id: companies.id, name: companies.name }).from(companies)).map((c) => [c.id, c.name]));

  const sms = await db.select().from(inboxMessages)
    .where(or(isNotNull(inboxMessages.ownerId), isNotNull(inboxMessages.companyId)))
    .orderBy(asc(inboxMessages.sentAt));
  for (const m of sms) {
    const key = m.ownerId ? `owner:${m.ownerId}` : `company:${m.companyId}`;
    const conv = convs.get(key) ?? {
      key, kind: m.ownerId ? "uthyrare" : "företag",
      name: (m.ownerId ? ownerNames.get(m.ownerId) : companyNames.get(m.companyId ?? "")) ?? "okänd", lines: [],
    } as Conversation;
    conv.lines.push({ at: normalizeTime(m.sentAt), from: m.direction === "out" ? "Kajsa" : "kontakt", channel: /whats/i.test(m.service ?? "") ? "whatsapp" : "sms", text: clip(m.body, 500) });
    convs.set(key, conv);
  }

  const mails = await db.select().from(emails)
    .where(and(or(isNotNull(emails.ownerId), isNotNull(emails.companyId))))
    .orderBy(asc(emails.sentAt));
  for (const m of mails) {
    const key = m.ownerId ? `owner:${m.ownerId}` : `company:${m.companyId}`;
    const conv = convs.get(key) ?? {
      key, kind: m.ownerId ? "uthyrare" : "företag",
      name: (m.ownerId ? ownerNames.get(m.ownerId) : companyNames.get(m.companyId ?? "")) ?? "okänd", lines: [],
    } as Conversation;
    conv.lines.push({ at: normalizeTime(m.sentAt), from: m.direction === "out" ? "Kajsa" : "kontakt", channel: "mejl", text: clip(`[${m.subject}] ${stripQuoted(m.body)}`, 900) });
    convs.set(key, conv);
  }

  // Bara riktiga dialoger (båda parter har skrivit), nyast aktivitet först.
  return [...convs.values()]
    .filter((c) => c.lines.some((l) => l.from === "Kajsa") && c.lines.some((l) => l.from === "kontakt"))
    .map((c) => ({ ...c, lines: c.lines.sort((a, b) => a.at.localeCompare(b.at)).slice(-40) }))
    .sort((a, b) => (b.lines.at(-1)?.at ?? "").localeCompare(a.lines.at(-1)?.at ?? ""))
    .slice(0, maxConversations);
}

function renderConversation(c: Conversation, i: number): string {
  return `### Konversation ${i + 1} (${c.kind})\n${c.lines.map((l) => `[${l.at.slice(0, 10)} ${l.channel} ${l.from}] ${l.text}`).join("\n")}`;
}

const BATCH_PROMPT = `Du analyserar Kajsa Sihléns tidigare konversationer med kunder och uthyrare på StayOnSite (möblerat företagsboende i Sverige, minst tre månader). Syftet är att en svarsassistent ska kunna svara som Kajsa och föra varje kontakt mot rätt utfall.

Skriv anteckningar på svenska under rubrikerna:
1. Kajsas ton och stil (ordval, längd, hälsningar, språkbyten, emojis)
2. Återkommande frågor från företagskunder och hur Kajsa svarar
3. Återkommande frågor från uthyrare/husägare och hur Kajsa svarar
4. Fakta och regler som Kajsa konsekvent anger (vad som ingår, minsta hyrestid, process, vad hon ber om)
5. Vad som för affärer framåt och vad som får dem att stanna av
6. Saker Kajsa aldrig skriver eller undviker
7. Exempel på bra korta svar (omskrivna, utan namn, telefonnummer, adresser eller belopp)

Ta ALDRIG med personnamn, telefonnummer, mejladresser, gatuadresser, kunders eller uthyrares företagsnamn eller enskilda belopp. Beskriv mönster, inte enskilda personer. Det egna bolaget heter StayOnSite – skriv det namnet rakt ut.`;

const MERGE_PROMPT = `Slå ihop anteckningarna nedan till en samlad playbook för Kajsas svarsassistent. Behåll alla sju rubrikerna, ta bort dubbletter, prioritera mönster som återkommer ofta, och håll den under 1 800 ord. Inga personnamn, telefonnummer, mejladresser, adresser, kunders eller uthyrares företagsnamn eller belopp. Det egna bolaget heter StayOnSite. Skriv på svenska, konkret och användbart.`;

// Inlärningen körs i steg, eftersom historiken är för stor för ett enda
// serveranrop: start → ett antal delsteg (några delar åt gången) → sammanställning.
const LEARN_TABLE = `CREATE TABLE IF NOT EXISTS crm_reply_learn_batches (
  idx integer PRIMARY KEY NOT NULL,
  text text NOT NULL,
  notes text,
  created_at text DEFAULT (datetime('now'))
)`;

export interface LearnProgress {
  total: number;
  done: number;
  finished: boolean;
  conversations?: number;
}

async function status(db: DB, s: string) {
  await setSetting(db, "learn_status", `${new Date().toISOString()} ${s}`);
}

export async function learnStart(opts: { db?: DB; maxConversations?: number; batchChars?: number } = {}): Promise<LearnProgress> {
  const db = opts.db ?? defaultDb;
  await db.run(sql.raw(LEARN_TABLE));
  await status(db, "läser historiken");
  const conversations = await loadConversations(db, opts.maxConversations ?? 120);
  await db.run(sql`DELETE FROM crm_reply_learn_batches`);
  if (!conversations.length) {
    await status(db, "ingen historik att lära av");
    return { total: 0, done: 0, finished: true, conversations: 0 };
  }
  const batchChars = opts.batchChars ?? 40_000;
  const batches: string[] = [];
  let current = "";
  conversations.forEach((c, i) => {
    const block = renderConversation(c, i);
    if (current && current.length + block.length > batchChars) { batches.push(current); current = ""; }
    current += `${block}\n\n`;
  });
  if (current) batches.push(current);
  for (let i = 0; i < batches.length; i++) {
    await db.run(sql`INSERT INTO crm_reply_learn_batches (idx, text) VALUES (${i}, ${batches[i]})`);
  }
  await status(db, `${conversations.length} konversationer uppdelade i ${batches.length} delar`);
  return { total: batches.length, done: 0, finished: false, conversations: conversations.length };
}

export async function learnStep(opts: { db?: DB; maxBatches?: number } = {}): Promise<LearnProgress> {
  const db = opts.db ?? defaultDb;
  await db.run(sql.raw(LEARN_TABLE));
  const rows = await db.all<{ idx: number; text: string; notes: string | null }>(sql`SELECT idx, text, notes FROM crm_reply_learn_batches ORDER BY idx`);
  const total = rows.length;
  if (!total) return { total: 0, done: 0, finished: true };
  const pending = rows.filter((r) => r.notes == null).slice(0, opts.maxBatches ?? 2);
  for (const r of pending) {
    await status(db, `analyserar del ${r.idx + 1} av ${total}`);
    const { text } = await callClaude(`${BATCH_PROMPT}\n\n${r.text}`, { maxTokens: 8000 });
    await db.run(sql`UPDATE crm_reply_learn_batches SET notes = ${text.trim()} WHERE idx = ${r.idx}`);
  }
  const done = rows.filter((r) => r.notes != null).length + pending.length;
  // Sammanställningen får ett eget anrop, så att inget enskilt anrop blir för långt.
  if (pending.length > 0) return { total, done, finished: false };

  await status(db, "sammanställer playbook");
  const all = await db.all<{ notes: string }>(sql`SELECT notes FROM crm_reply_learn_batches ORDER BY idx`);
  const playbook = all.length === 1
    ? all[0].notes
    : (await callClaude(`${MERGE_PROMPT}\n\n${all.map((n, i) => `## Anteckningar ${i + 1}\n${n.notes}`).join("\n\n")}`, { maxTokens: 16000 })).text.trim();
  await setSetting(db, "playbook", playbook);
  await setSetting(db, "playbook_updated_at", new Date().toISOString());
  await db.run(sql`DELETE FROM crm_reply_learn_batches`);
  await status(db, `klar: ${total} delar`);
  return { total, done: total, finished: true };
}

export async function historyStats(db: DB = defaultDb): Promise<{ smsIn: number; smsOut: number; emailIn: number; emailOut: number }> {
  const count = async (q: Promise<{ n: number }[]>) => Number((await q)[0]?.n ?? 0);
  return {
    smsIn: await count(db.select({ n: sql<number>`count(*)` }).from(inboxMessages).where(eq(inboxMessages.direction, "in"))),
    smsOut: await count(db.select({ n: sql<number>`count(*)` }).from(inboxMessages).where(eq(inboxMessages.direction, "out"))),
    emailIn: await count(db.select({ n: sql<number>`count(*)` }).from(emails).where(eq(emails.direction, "in"))),
    emailOut: await count(db.select({ n: sql<number>`count(*)` }).from(emails).where(eq(emails.direction, "out"))),
  };
}
