// Säkerhetsregler för svarsmotorn. Helt deterministiska: modellen föreslår,
// reglerna bestämmer vad som får skickas utan att Kajsa har sett det.
//
// Grundprincip: bara rutinsvar skickas automatiskt. Allt som rör pris, avtal,
// betalning, löften om tillgänglighet eller datum, klagomål eller oklarheter
// blir ett utkast eller lämnas över till Kajsa.
import type { EngineMode } from "./store";

export const RISK_FLAGS = [
  "price",
  "contract",
  "payment",
  "availability_promise",
  "date_promise",
  "complaint",
  "legal",
  "personal_sensitive",
  "new_commitment",
  "unclear",
  "emotional",
] as const;
export type RiskFlag = (typeof RISK_FLAGS)[number];

export interface ModelDecision {
  partyRole: string;
  intent: string;
  stage: string;
  outcomeGoal: string;
  needsReply: boolean;
  reply: string | null;
  replySubject: string | null;
  routine: boolean;
  confidence: number;
  riskFlags: string[];
  handover: boolean;
  handoverReason: string | null;
  followUpInHours: number | null;
  followUpReason: string | null;
  /** Något Kajsa själv behöver göra (t.ex. "skicka boendeförslag"), även om svaret gick iväg. */
  kajsaTask: string | null;
  nextStep: string | null;
  summary: string;
}

export type PolicyAction = "auto_sent" | "draft" | "handover" | "no_reply" | "shadow";

export interface PolicyInput {
  mode: EngineMode;
  channel: "sms" | "whatsapp" | "email";
  inboundText: string;
  decision: ModelDecision;
  autoSentLast24h: number;
}

export interface PolicyResult {
  action: PolicyAction;
  /** Ska svaret också ligga som utkast (vid överlämning med föreslaget svar)? */
  draft: boolean;
  /** Ska Kajsa få en uppföljning i sin kö? */
  notifyKajsa: boolean;
  reasons: string[];
}

const MIN_AUTO_CONFIDENCE = 0.8;
const MAX_AUTO_PER_DAY = 2;
const MAX_AUTO_CHARS = { sms: 480, whatsapp: 700, email: 1500 } as const;

// Kunden ber oss sluta höra av oss → aldrig svara automatiskt.
const OPT_OUT = /\b(stop+|sluta|avsluta|avregistrera|unsubscribe|ta bort mig|kontakta mig inte|nie kontaktuj|rezygnuj)\b/i;

// Belopp: "12 500 kr", "9500:-", "SEK 3000", "200 €", "15 %".
const MONEY = /(\d[\d\s.,]*\s?(kr\b|kronor|sek\b|:-|€|eur\b|euro|zł|pln\b|%))|((sek|eur|kr)\s?\d)/i;

// Ord som binder oss eller kunden. Svenska, engelska och polska.
const COMMITMENT = new RegExp(
  [
    "avtal", "kontrakt", "faktur", "betalning", "deposition", "garant", "lovar", "utlovar", "bokningen är bekräftad",
    "vi bekräftar", "rabatt", "avgift", "uppsägning", "hyresavi", "skadestånd", "vite",
    "contract", "agreement", "invoice", "payment", "deposit", "guarantee", "we confirm", "discount", "fee", "penalty",
    "umow", "faktur", "płatno", "kaucj", "gwarant", "potwierdzam rezerwacj", "rabat", "opłat",
  ].join("|"),
  "i",
);

// Länkar till annat än StayOnSite och Googles recensionslänk skickas aldrig automatiskt.
const URL = /\bhttps?:\/\/[^\s]+/gi;
const ALLOWED_URL = /^https?:\/\/(www\.)?(stayonsite\.se|g\.page\/r\/CcBH36cXOKj8EBM)(\/|$)/i;

export function isOptOut(text: string): boolean {
  return OPT_OUT.test(text);
}

/** Varför ett svar inte får skickas automatiskt — tom lista = textmässigt ok. */
export function replyTextProblems(reply: string, channel: PolicyInput["channel"]): string[] {
  const problems: string[] = [];
  if (!reply.trim()) problems.push("tomt svar");
  if (reply.length > MAX_AUTO_CHARS[channel]) problems.push("för långt för ett automatiskt svar");
  if (MONEY.test(reply)) problems.push("innehåller belopp");
  if (COMMITMENT.test(reply)) problems.push("rör avtal, betalning eller löften");
  for (const url of reply.match(URL) ?? []) {
    if (!ALLOWED_URL.test(url)) problems.push(`länk till annan webbplats (${url})`);
  }
  return problems;
}

export function applyPolicy(input: PolicyInput): PolicyResult {
  const { decision: d, mode } = input;
  const reasons: string[] = [];

  if (isOptOut(input.inboundText)) {
    return { action: "handover", draft: false, notifyKajsa: true, reasons: ["kontakten ber oss sluta höra av oss"] };
  }

  const flags = d.riskFlags.filter((f) => (RISK_FLAGS as readonly string[]).includes(f));
  const hasReply = Boolean(d.needsReply && d.reply?.trim());

  if (!d.needsReply && !d.handover) {
    const task = d.kajsaTask?.trim();
    return {
      action: mode === "shadow" ? "shadow" : "no_reply",
      draft: false,
      notifyKajsa: mode !== "shadow" && Boolean(task),
      reasons: task ? ["inget svar behövs", `att göra: ${task}`] : ["inget svar behövs"],
    };
  }

  if (mode === "shadow") {
    return { action: "shadow", draft: false, notifyKajsa: false, reasons: ["skuggläge – bara loggat"] };
  }

  if (d.handover) reasons.push(d.handoverReason?.trim() || "motorn vill att Kajsa tar över");
  if (flags.length) reasons.push(`risk: ${flags.join(", ")}`);
  if (!d.routine) reasons.push("inte ett rutinsvar");
  if (d.confidence < MIN_AUTO_CONFIDENCE) reasons.push(`osäkerhet (${Math.round(d.confidence * 100)} %)`);
  if (hasReply) reasons.push(...replyTextProblems(d.reply!, input.channel));
  if (input.autoSentLast24h >= MAX_AUTO_PER_DAY) reasons.push("redan två automatiska svar senaste dygnet");
  if (mode === "draft") reasons.push("utkastläge");

  if (!hasReply) {
    return { action: "handover", draft: false, notifyKajsa: true, reasons: reasons.length ? reasons : ["behöver ett svar som motorn inte kan ge"] };
  }

  if (reasons.length === 0 && mode === "auto") {
    const task = d.kajsaTask?.trim();
    return { action: "auto_sent", draft: false, notifyKajsa: Boolean(task), reasons: task ? ["rutinsvar", `att göra: ${task}`] : ["rutinsvar"] };
  }

  // Risk eller överlämning: utkast + uppföljning hos Kajsa. Annars bara utkast.
  const notify = d.handover || flags.length > 0 || Boolean(d.kajsaTask?.trim());
  return { action: notify ? "handover" : "draft", draft: true, notifyKajsa: notify, reasons };
}

// ─── Tider ───────────────────────────────────────────────────────────────────

const TZ = "Europe/Stockholm";

function stockholmParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { hour: Number(get("hour")), minute: Number(get("minute")), weekday: get("weekday") };
}

/** Motorn agerar 07–21 svensk tid. Utanför det väntar inkomna meddelanden. */
export function withinActiveHours(now = new Date()): boolean {
  const { hour } = stockholmParts(now);
  return hour >= 7 && hour < 21;
}

/**
 * Nästa tid för en automatisk uppföljning. Modellens förslag (timmar) begränsas
 * till 2–72 timmar och flyttas in i 08–18 på vardagar.
 */
export function nextFollowUpAt(inHours: number, now = new Date()): Date {
  const hours = Math.min(72, Math.max(2, Number.isFinite(inHours) ? inHours : 24));
  let at = new Date(now.getTime() + hours * 3600_000);
  for (let i = 0; i < 24 * 7; i++) {
    const { hour, weekday } = stockholmParts(at);
    const weekend = weekday === "Sat" || weekday === "Sun";
    if (!weekend && hour >= 8 && hour < 18) return at;
    at = new Date(at.getTime() + 3600_000);
  }
  return at;
}
