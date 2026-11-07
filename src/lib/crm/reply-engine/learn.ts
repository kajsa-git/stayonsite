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

Ta ALDRIG med personnamn, telefonnummer, mejladresser, gatuadresser, företagsnamn eller enskilda belopp. Beskriv mönster, inte enskilda personer.`;

const MERGE_PROMPT = `Slå ihop anteckningarna nedan till en samlad playbook för Kajsas svarsassistent. Behåll rubrikerna, ta bort dubbletter, prioritera mönster som återkommer ofta, och håll den under 1 800 ord. Inga personnamn, telefonnummer, mejladresser, adresser, företagsnamn eller belopp. Skriv på svenska, konkret och användbart.`;

export async function learnFromHistory(opts: { db?: DB; maxConversations?: number; batchChars?: number } = {}): Promise<{ conversations: number; batches: number; playbook: string }> {
  const db = opts.db ?? defaultDb;
  const status = (s: string) => setSetting(db, "learn_status", `${new Date().toISOString()} ${s}`);
  await status("läser historiken");
  const conversations = await loadConversations(db, opts.maxConversations ?? 150);
  if (!conversations.length) {
    await status("ingen historik att lära av");
    return { conversations: 0, batches: 0, playbook: "" };
  }

  const batchChars = opts.batchChars ?? 45_000;
  const batches: string[] = [];
  let current = "";
  conversations.forEach((c, i) => {
    const block = renderConversation(c, i);
    if (current && current.length + block.length > batchChars) { batches.push(current); current = ""; }
    current += `${block}\n\n`;
  });
  if (current) batches.push(current);

  const notesPerBatch: string[] = [];
  for (let i = 0; i < batches.length; i++) {
    await status(`analyserar del ${i + 1} av ${batches.length}`);
    const { text } = await callClaude(`${BATCH_PROMPT}\n\n${batches[i]}`, { maxTokens: 3000 });
    notesPerBatch.push(text.trim());
  }

  await status("sammanställer playbook");
  const playbook = notesPerBatch.length === 1
    ? notesPerBatch[0]
    : (await callClaude(`${MERGE_PROMPT}\n\n${notesPerBatch.map((n, i) => `## Anteckningar ${i + 1}\n${n}`).join("\n\n")}`, { maxTokens: 4000 })).text.trim();

  await setSetting(db, "playbook", playbook);
  await setSetting(db, "playbook_updated_at", new Date().toISOString());
  await status(`klar: ${conversations.length} konversationer i ${batches.length} delar`);
  return { conversations: conversations.length, batches: batches.length, playbook };
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
