import { db } from "./db";
import { accounts } from "./schema";
import { and, eq } from "drizzle-orm";

// ─── Token-hantering ──────────────────────────────────────────────────────────

async function getAccessToken(userId: string): Promise<string> {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));

  if (!account?.access_token) throw new GmailAuthError("Inget Google-konto kopplat.");

  // Kontrollera om scopet inkluderar Gmail
  if (!account.scope?.includes("gmail")) {
    throw new GmailAuthError("Gmail-behörighet saknas. Logga ut och in igen för att koppla Gmail.");
  }

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

    await db
      .update(accounts)
      .set({ access_token: data.access_token, expires_at: Math.floor(Date.now() / 1000) + data.expires_in })
      .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));

    return data.access_token as string;
  }

  return account.access_token;
}

export class GmailAuthError extends Error {
  readonly isAuthError = true;
}

// ─── RFC 2822-byggare ─────────────────────────────────────────────────────────

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
  let msg = `From: ${opts.from}\r\nTo: ${opts.to}\r\nSubject: ${opts.subject}\r\nMIME-Version: 1.0\r\n`;
  if (opts.inReplyTo) msg += `In-Reply-To: ${opts.inReplyTo}\r\nReferences: ${opts.references ?? opts.inReplyTo}\r\n`;

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
  opts: { from: string; to: string; subject: string; text: string; html?: string; threadId?: string },
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
  subject: string;
  date: string;
  text: string;
  html: string | null;
}

function header(msg: { payload: { headers: { name: string; value: string }[] } }, name: string) {
  return msg.payload.headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function extractBody(payload: {
  mimeType?: string;
  body?: { data?: string };
  parts?: typeof payload[];
}): { text: string; html: string | null } {
  if (payload.mimeType === "text/plain") return { text: atob(payload.body?.data?.replace(/-/g, "+").replace(/_/g, "/") ?? ""), html: null };
  if (payload.mimeType === "text/html") return { text: "", html: atob(payload.body?.data?.replace(/-/g, "+").replace(/_/g, "/") ?? "") };
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

// Sök efter tråd-IDs i Gmail som matchar en e-postadress
export async function gmailSearchThreadIds(userId: string, email: string): Promise<string[]> {
  const token = await getAccessToken(userId);
  const q = encodeURIComponent(`to:${email} OR from:${email}`);
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads?q=${q}&maxResults=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.threads ?? []) as { id: string }[]).map((t) => t.id);
}

export async function gmailGetThread(userId: string, threadId: string): Promise<GmailMessage[]> {
  const token = await getAccessToken(userId);
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gmail thread fetch failed");
  const data = await res.json();

  return (data.messages ?? []).map((msg: {
    id: string;
    threadId: string;
    payload: { headers: { name: string; value: string }[]; mimeType?: string; body?: { data?: string }; parts?: unknown[] };
  }) => {
    const { text, html } = extractBody(msg.payload as Parameters<typeof extractBody>[0]);
    return {
      id: msg.id,
      threadId: msg.threadId,
      from: header(msg, "from"),
      to: header(msg, "to"),
      subject: header(msg, "subject"),
      date: header(msg, "date"),
      text,
      html,
    };
  });
}
