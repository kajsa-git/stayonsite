import { db } from "./db";
import { accounts, users } from "./schema";
import { and, eq } from "drizzle-orm";

// ─── Token-hantering ──────────────────────────────────────────────────────────

// Kort processcache: bakgrundssynken gör hundratals Gmail-anrop per körning och ska
// inte slå mot databasen för varje. Posten gäller till 60 s före tokenens utgång.
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessToken(userId: string): Promise<string> {
  const cached = tokenCache.get(userId);
  if (cached && cached.expiresAt > Math.floor(Date.now() / 1000) + 60) return cached.token;
  const fresh = await loadAccessToken(userId);
  if (fresh.expiresAt) tokenCache.set(userId, { token: fresh.token, expiresAt: fresh.expiresAt });
  return fresh.token;
}

async function loadAccessToken(userId: string): Promise<{ token: string; expiresAt: number | null }> {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));

  if (!account?.access_token) throw new GmailAuthError("Inget Google-konto kopplat. Logga in igen.");

  // Förnya om token går ut inom 60 sekunder
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at < now + 60) {
    if (!account.refresh_token) throw new GmailAuthError("Ingen refresh-token. Logga ut och in igen.");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        refresh_token: account.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json();
    if (data.error) throw new GmailAuthError(`Token-förnyelse misslyckades: ${data.error}`);

    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
    await db
      .update(accounts)
      .set({ access_token: data.access_token, expires_at: expiresAt })
      .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));

    return { token: data.access_token as string, expiresAt };
  }

  return { token: account.access_token, expiresAt: account.expires_at ?? null };
}

// GET mot Gmail-API:t med gemensam felhantering.
// • 401: cachad token kan vara inaktuell (t.ex. efter ny inloggning) — läs om den en
//   gång; nekas den igen ber vi om ny inloggning i stället för att visa ett tekniskt fel.
// • Hastighetsgräns (429, eller 403 med rateLimitExceeded/userRateLimitExceeded) och
//   tillfälliga 5xx-fel: försök igen med paus. Kvarstår gränsen kastas
//   GmailRateLimitError, så att bakgrundssynken kan spara sina framsteg och fortsätta
//   vid nästa körning.
async function gmailGet(userId: string, path: string): Promise<Response> {
  let refreshed = false;
  for (let attempt = 0; ; attempt++) {
    const token = await getAccessToken(userId);
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      tokenCache.delete(userId);
      if (refreshed) throw new GmailAuthError("Gmail-behörigheten har gått ut. Logga in igen.");
      refreshed = true;
      continue;
    }
    const rateLimited = res.status === 429 || (res.status === 403 && await isRateLimitResponse(res));
    if (rateLimited || res.status >= 500) {
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
        continue;
      }
      if (rateLimited) throw new GmailRateLimitError("Gmails hastighetsgräns nådd — fortsätter vid nästa körning.");
    }
    return res;
  }
}

async function isRateLimitResponse(res: Response): Promise<boolean> {
  try {
    const body = await res.clone().json() as { error?: { errors?: { reason?: string }[]; status?: string } };
    const reasons = (body.error?.errors ?? []).map((e) => e.reason ?? "");
    return reasons.some((r) => /ratelimit|quota/i.test(r)) || body.error?.status === "RESOURCE_EXHAUSTED";
  } catch {
    return false;
  }
}

export class GmailRateLimitError extends Error {}

// Gmails felbeskrivning i klartext, för felraden i Min dag och Vercel-loggen.
async function gmailErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.clone().json() as { error?: { message?: string } };
    return body.error?.message ? `: ${body.error.message.slice(0, 200)}` : "";
  } catch {
    return "";
  }
}

export class GmailAuthError extends Error {
  readonly isAuthError = true;
}

function mailboxAddress(value: string): string {
  return value.match(/<([^>]+)>/)?.[1]?.trim().toLowerCase() ?? value.trim().toLowerCase();
}

// Serverjobb har ingen webbsession. Hämta i stället den godkända CRM-användare
// vars Google-konto motsvarar avsändaradressen och använd samma refresh-token som
// CRM:s manuella Gmail-utskick.
export async function gmailAutomationUserId(address = process.env.CRM_FROM ?? "kajsa@stayonsite.se"): Promise<string> {
  const email = mailboxAddress(address);
  const [row] = await db
    .select({ userId: users.id })
    .from(users)
    .innerJoin(accounts, and(eq(accounts.userId, users.id), eq(accounts.provider, "google")))
    .where(and(eq(users.email, email), eq(users.approved, true)))
    .limit(1);
  if (!row) throw new GmailAuthError(`Inget godkänt Google-konto hittades för ${email}.`);
  return row.userId;
}

// ─── RFC 2822-byggare ─────────────────────────────────────────────────────────

// Skydd mot header-injektion: ett header-värde får aldrig innehålla CR/LF (då kan
// en angripare smuggla in extra headers eller en body). Vik ihop till mellanslag.
function headerValue(v: string): string {
  return v.replace(/[\r\n]+/g, " ").trim();
}

// RFC 2047 krävs för icke-ASCII i exempelvis svenska/polska ämnesrader.
// Utan detta kan Gmail acceptera rå UTF-8 men visa rubriken som mojibake hos
// mottagaren ("några" blir exempelvis "nÃ¥gra").
export function mimeHeaderValue(v: string): string {
  const safe = headerValue(v);
  return /[^\x20-\x7e]/.test(safe)
    ? `=?UTF-8?B?${Buffer.from(safe, "utf8").toString("base64")}?=`
    : safe;
}

function buildRfc2822(opts: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const boundary = `=_Part_${Date.now()}`;
  const from = headerValue(opts.from);
  const to = headerValue(opts.to);
  const subject = mimeHeaderValue(opts.subject);
  let msg = `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\n`;
  if (opts.inReplyTo) {
    const inReplyTo = headerValue(opts.inReplyTo);
    const references = headerValue(opts.references ?? opts.inReplyTo);
    msg += `In-Reply-To: ${inReplyTo}\r\nReferences: ${references}\r\n`;
  }

  if (opts.html) {
    msg += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
    msg += `--${boundary}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${opts.text}\r\n\r\n`;
    msg += `--${boundary}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${opts.html}\r\n\r\n`;
    msg += `--${boundary}--`;
  } else {
    msg += `Content-Type: text/plain; charset=utf-8\r\n\r\n${opts.text}`;
  }
  return msg;
}

// ─── Skicka mejl ─────────────────────────────────────────────────────────────

export async function gmailSend(
  userId: string,
  opts: { from: string; to: string; subject: string; text: string; html?: string; threadId?: string; inReplyTo?: string; references?: string },
): Promise<{ messageId: string; threadId: string }> {
  const token = await getAccessToken(userId);
  const raw = Buffer.from(buildRfc2822(opts)).toString("base64url");
  const body: Record<string, string> = { raw };
  if (opts.threadId) body.threadId = opts.threadId;

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gmail send error: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return { messageId: data.id as string, threadId: data.threadId as string };
}

// ─── Hämta tråd ──────────────────────────────────────────────────────────────

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  cc: string;
  subject: string;
  date: string;
  text: string;
  html: string | null;
  autoSubmitted: string;
  precedence: string;
  listUnsubscribe: string;
  labelIds: string[];
  snippet: string;
  // Gmails egen mottagningstid (ISO). Pålitligare än Date-rubriken, som kan saknas
  // eller vara felformaterad.
  receivedAt: string | null;
}

interface RawGmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: { name: string; value: string }[]; mimeType?: string; body?: { data?: string }; parts?: unknown[] };
}

function header(msg: RawGmailMessage, name: string) {
  return msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

// Gmail levererar base64url-kodade kroppar. atob() ger Latin-1 och förstör all UTF-8
// (åäö, emoji) — avkoda via Buffer som UTF-8 i stället.
function decodeB64Url(data?: string): string {
  if (!data) return "";
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function extractBody(payload: {
  mimeType?: string;
  body?: { data?: string };
  parts?: typeof payload[];
}): { text: string; html: string | null } {
  if (payload.mimeType === "text/plain") return { text: decodeB64Url(payload.body?.data), html: null };
  if (payload.mimeType === "text/html") return { text: "", html: decodeB64Url(payload.body?.data) };
  if (payload.parts) {
    let text = "";
    let html: string | null = null;
    for (const part of payload.parts) {
      const sub = extractBody(part);
      if (sub.text) text = sub.text;
      if (sub.html) html = sub.html;
    }
    return { text, html };
  }
  return { text: "", html: null };
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// Gemensam tolkning av ett Gmail-meddelande (format=full eller format=metadata;
// metadata saknar kropp och ger då tom text).
export function parseGmailMessage(msg: RawGmailMessage): GmailMessage {
  const { text, html } = msg.payload
    ? extractBody(msg.payload as Parameters<typeof extractBody>[0])
    : { text: "", html: null };
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: header(msg, "from"),
    to: header(msg, "to"),
    cc: header(msg, "cc"),
    subject: header(msg, "subject"),
    date: header(msg, "date"),
    text,
    html,
    autoSubmitted: header(msg, "auto-submitted"),
    precedence: header(msg, "precedence"),
    listUnsubscribe: header(msg, "list-unsubscribe"),
    labelIds: msg.labelIds ?? [],
    // Gmails förhandsvisning kommer HTML-kodad (&#39; m.m.).
    snippet: decodeHtmlEntities(msg.snippet ?? ""),
    receivedAt: msg.internalDate && Number.isFinite(Number(msg.internalDate))
      ? new Date(Number(msg.internalDate)).toISOString()
      : null,
  };
}

// Sök efter tråd-IDs i Gmail som matchar en e-postadress
export async function gmailSearchThreadIds(userId: string, email: string): Promise<string[]> {
  const q = encodeURIComponent(`to:${email} OR from:${email} OR cc:${email}`);
  const res = await gmailGet(userId, `threads?q=${q}&maxResults=50`);
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.threads ?? []) as { id: string }[]).map((t) => t.id);
}

// Hämta In-Reply-To/References för att besvara en tråd korrekt. Gmails threadId
// trådar i avsändarens konto, men RFC-headern (Message-ID) krävs för korrekt trådning
// hos mottagaren och i strikta mejlklienter. Bygger References-kedjan.
export async function gmailThreadReplyHeaders(
  userId: string,
  threadId: string,
): Promise<{ inReplyTo?: string; references?: string }> {
  const res = await gmailGet(userId, `threads/${threadId}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References`);
  if (!res.ok) return {};
  const data = await res.json();
  const msgs = (data.messages ?? []) as { payload?: { headers?: { name: string; value: string }[] } }[];
  if (!msgs.length) return {};
  const last = msgs[msgs.length - 1];
  const getH = (n: string) => last.payload?.headers?.find((h) => h.name.toLowerCase() === n)?.value;
  const messageId = getH("message-id");
  if (!messageId) return {};
  const prevRefs = getH("references");
  return { inReplyTo: messageId, references: prevRefs ? `${prevRefs} ${messageId}` : messageId };
}

export async function gmailGetThread(userId: string, threadId: string): Promise<GmailMessage[]> {
  const res = await gmailGet(userId, `threads/${threadId}?format=full`);
  // Tråden raderad i Gmail: inget att hämta (ska inte stoppa synken av övriga trådar).
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("Gmail thread fetch failed");
  const data = await res.json();
  return ((data.messages ?? []) as RawGmailMessage[]).map(parseGmailMessage);
}

// ─── Bakgrundssynk: historik och enskilda meddelanden ───────────────────────

const METADATA_HEADERS = ["From", "To", "Cc", "Subject", "Date", "Auto-Submitted", "Precedence", "List-Unsubscribe"];

// Ett meddelande. "metadata" räcker för att avgöra om det hör till CRM:et (bara
// rubriker, billigt); "full" hämtas först när det faktiskt ska importeras.
// Returnerar null om meddelandet hunnit raderas i Gmail.
export async function gmailGetMessage(
  userId: string,
  messageId: string,
  format: "full" | "metadata",
): Promise<GmailMessage | null> {
  const query = format === "metadata"
    ? `format=metadata&${METADATA_HEADERS.map((h) => `metadataHeaders=${encodeURIComponent(h)}`).join("&")}`
    : "format=full";
  const res = await gmailGet(userId, `messages/${messageId}?${query}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gmail message fetch failed (${res.status})${await gmailErrorDetail(res)}`);
  return parseGmailMessage(await res.json());
}

// Brevlådans aktuella historik-id — startpunkten för nästa inkrementella synk.
export async function gmailCurrentHistoryId(userId: string): Promise<string> {
  const res = await gmailGet(userId, "profile");
  if (!res.ok) throw new Error(`Gmail profile fetch failed (${res.status})${await gmailErrorDetail(res)}`);
  const data = await res.json();
  return String(data.historyId);
}

// Gmail sparar historik ungefär en vecka. Ett för gammalt startHistoryId ger 404,
// och då måste synken börja om med en sökning över tidsfönstret.
export class GmailHistoryExpiredError extends Error {}

// Lägg-till-händelser sedan startHistoryId: nya meddelanden (inkommande och skickade).
// Utkast, skräppost, papperskorg och chatt hoppas över redan här.
export async function gmailListAddedMessageIds(
  userId: string,
  startHistoryId: string,
): Promise<{ messageIds: string[]; historyId: string }> {
  const ids = new Set<string>();
  let pageToken: string | undefined;
  let latest = startHistoryId;
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({ startHistoryId, historyTypes: "messageAdded", maxResults: "500" });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await gmailGet(userId, `history?${params}`);
    if (res.status === 404) throw new GmailHistoryExpiredError("Gmail-historiken är för gammal");
    if (!res.ok) throw new Error(`Gmail history fetch failed (${res.status})${await gmailErrorDetail(res)}`);
    const data = await res.json() as {
      history?: { messagesAdded?: { message: { id: string; labelIds?: string[] } }[] }[];
      historyId?: string;
      nextPageToken?: string;
    };
    for (const entry of data.history ?? []) {
      for (const added of entry.messagesAdded ?? []) {
        const labels = added.message.labelIds ?? [];
        if (labels.some((l) => l === "DRAFT" || l === "SPAM" || l === "TRASH" || l === "CHAT")) continue;
        ids.add(added.message.id);
      }
    }
    if (data.historyId) latest = String(data.historyId);
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return { messageIds: [...ids], historyId: latest };
}

// Meddelande-id:n som matchar en Gmail-sökning, nyast först, högst `max` stycken.
export async function gmailListMessageIds(userId: string, q: string, max: number): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  while (ids.length < max) {
    const params = new URLSearchParams({ q, maxResults: String(Math.min(500, max - ids.length)) });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await gmailGet(userId, `messages?${params}`);
    if (!res.ok) throw new Error(`Gmail message search failed (${res.status})${await gmailErrorDetail(res)}`);
    const data = await res.json() as { messages?: { id: string }[]; nextPageToken?: string };
    for (const m of data.messages ?? []) ids.push(m.id);
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return ids.slice(0, max);
}
