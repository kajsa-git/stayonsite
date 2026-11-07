import type { GmailMessage } from "./gmail";

export function mailboxAddress(value: string): string {
  return (value.match(/<([^>]+)>/)?.[1] ?? value).trim().toLowerCase();
}

export function stripLandlordQuote(body: string): string {
  const markers = [
    /^On .+wrote:\s*$/im,
    /^.{1,160}\bskrev(?:\s+.+)?:\s*$/im,
    /^From:\s.+$/im,
    /^Från:\s.+$/im,
    /^-{2,}\s*Original Message\s*-{2,}$/im,
  ];
  let end = body.length;
  for (const marker of markers) {
    const at = body.search(marker);
    if (at >= 0) end = Math.min(end, at);
  }
  return body.slice(0, end).split("\n")
    .filter((line) => !line.trimStart().startsWith(">"))
    .join("\n").trim();
}

export function isAutomaticMessage(message: GmailMessage): boolean {
  return Boolean(message.autoSubmitted && message.autoSubmitted.toLowerCase() !== "no")
    || /bulk|list|junk/i.test(message.precedence)
    || /no-?reply|mailer-daemon|postmaster|bounce/i.test(message.from);
}

// Treat explicit requests to stop contact as a human decision even if a model
// misinterprets the surrounding message.
export function asksToStopContact(text: string): boolean {
  return /(?:\b(?:sluta|upphör|avsluta)\b.{0,60}\b(?:kontakta|skicka|mejla|ringa|höra av)|\b(?:kontakta|mejla|ringa|hör av)\b.{0,30}\b(?:inte|ej|aldrig)\b|\b(?:ta bort|radera)\b.{0,40}\b(?:mig|mina uppgifter|mitt nummer)\b|\b(?:stop|do not|don't|never)\b.{0,40}\b(?:contact|message|email|text)\b)/iu.test(text);
}

// Reactions and simple thanks don't restart qualification. Attachment-only
// messages use the object-replacement character and must not be discarded.
export function isAcknowledgementOnly(text: string): boolean {
  const value = text.trim();
  if (!value || value.includes("\uFFFC")) return false;
  if (/^(?:gillade|ogillade|älskade|betonade|skrattade åt|liked|loved|disliked)\s*[”"“]/iu.test(value)) return true;
  const stripped = value.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\p{Variation_Selector}\p{P}\s\u200d]/gu, "").toLocaleLowerCase("sv-SE");
  return !stripped || /^(?:tack|tacksåmycket|tackar|toppen|okej|ok|super|perfekt|thankyou|thanks)$/.test(stripped);
}

/**
 * Only reply to the newest message of an explicitly enrolled thread. If Kajsa
 * or anybody else has already replied, an old landlord message is not acted on.
 * Messages that predate enrollment are deliberately never sent a reply.
 */
export function eligibleLandlordReply(
  messages: GmailMessage[], landlordEmail: string, mailbox: string, enrolledAt: string,
): GmailMessage | null {
  // An existing Gmail draft may be Kajsa's in-progress response. Do not race it
  // or treat its unsent contents as part of the actual conversation.
  if (messages.some((message) => message.labelIds?.includes("DRAFT"))) return null;
  const last = messages.at(-1);
  if (!last || mailboxAddress(last.from) !== mailboxAddress(landlordEmail)
    || mailboxAddress(last.from) === mailboxAddress(mailbox)
    || last.labelIds?.some((label) => label === "SPAM" || label === "TRASH")
    || isAutomaticMessage(last) || (!stripLandlordQuote(last.text ?? "") && !last.possibleImageAttachments && !last.html)) return null;
  const receivedAt = last.internalDate ? Number(last.internalDate) : Date.parse(last.date);
  const start = Date.parse(enrolledAt);
  if (!Number.isFinite(receivedAt) || !Number.isFinite(start) || receivedAt <= start) return null;
  return last;
}

// Consecutive incoming messages are one turn, even when they arrive as a
// burst. Preserve all of them rather than only the last one.
export function currentLandlordTurn(
  messages: GmailMessage[], landlordEmail: string, mailbox: string, enrolledAt: string,
): GmailMessage[] {
  if (!eligibleLandlordReply(messages, landlordEmail, mailbox, enrolledAt)) return [];
  const start = Date.parse(enrolledAt);
  let lastOutbound = -1;
  for (let i = 0; i < messages.length; i++) {
    if (mailboxAddress(messages[i].from) === mailboxAddress(mailbox)) lastOutbound = i;
  }
  const turn = messages.slice(lastOutbound + 1).filter((message) => {
    const receivedAt = message.internalDate ? Number(message.internalDate) : Date.parse(message.date);
    return Number.isFinite(receivedAt) && receivedAt > start;
  });
  if (turn.some((message) => mailboxAddress(message.from) !== mailboxAddress(landlordEmail) || isAutomaticMessage(message))) return [];
  return turn;
}

export function evidenceAppearsInReply(evidence: string, reply: string): boolean {
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLocaleLowerCase("sv-SE");
  const quote = normalize(evidence);
  return quote.length >= 3 && normalize(reply).includes(quote);
}
