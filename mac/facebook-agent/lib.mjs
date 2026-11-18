// Rena hjälpfunktioner för Facebook-agenten (testas i test/lib.test.mjs).
import { createHash } from "node:crypto";

export const TIMEZONE = "Europe/Stockholm";
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 21;
export const MIN_IDLE_SECONDS = 180;
export const RUN_EVERY_MINUTES = 20;
export const MAX_DETAILS_PER_RUN = 5;
export const MAX_SEEN = 3000;

/** Timmen i Sverige, 0-23. */
export function swedishHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat("sv-SE", { timeZone: TIMEZONE, hour: "2-digit", hour12: false }).format(now));
}

export function isDaytime(now = new Date()) {
  const h = swedishHour(now);
  return h >= DAY_START_HOUR && h < DAY_END_HOUR;
}

/** Sekunder sedan senaste mus- eller tangentbordshändelse, ur `ioreg -c IOHIDSystem`. */
export function parseIdleSeconds(ioregOutput) {
  const m = /"HIDIdleTime"\s*=\s*(\d+)/.exec(ioregOutput ?? "");
  return m ? Math.floor(Number(m[1]) / 1e9) : null;
}

/** Antal olästa ur flikens titel, t.ex. "(3) Facebook". */
export function unreadFromTitle(title) {
  const m = /^\((\d+)\)/.exec((title ?? "").trim());
  return m ? Number(m[1]) : 0;
}

/** Facebook-länk utan spårningsparametrar, så samma notis får samma nyckel. */
export function cleanUrl(href) {
  try {
    const u = new URL(href, "https://www.facebook.com");
    const keep = new URLSearchParams();
    for (const k of ["comment_id", "reply_comment_id", "story_fbid", "id", "multi_permalinks"]) {
      if (u.searchParams.has(k)) keep.set(k, u.searchParams.get(k));
    }
    const q = keep.toString();
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}${q ? `?${q}` : ""}`;
  } catch {
    return String(href ?? "");
  }
}

export function normaliseText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

/** Texten utan tidsangivelser som ändras ("2 tim", "för 5 minuter sedan"), för stabila nycklar. */
export function stableText(text) {
  return normaliseText(text)
    .replace(/\b(för\s+)?(ungefär\s+)?(en|ett|\d+)\s*(sek|min|minut|minuter|tim|timme|timmar|dag|dagar|v|vecka|veckor|mån|år)\b(\s+sedan)?/gi, "")
    .replace(/\b\d+\s*(s|m|h|d|w|y)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export function itemKey(kind, url, text) {
  return createHash("sha256").update(`${kind}|${cleanUrl(url)}|${stableText(text)}`).digest("hex").slice(0, 24);
}

const RELEVANT = /(kommenter|svarade|nämnde|taggade|skrev|delade|reagerade på din kommentar|commented|replied|mentioned|tagged|wrote)/i;

/** Notiser som handlar om Kajsas inlägg och kommentarer, inte födelsedagar och tips. */
export function isRelevantNotification(text) {
  const t = normaliseText(text);
  if (t.length < 15) return false;
  if (/(födelsedag|birthday|event|evenemang|minnen|memories|live|sändning|marketplace-tips)/i.test(t)) return false;
  return RELEVANT.test(t);
}

/** Plockar nya poster: bara de som inte har setts förut, högst `max`. */
export function newItems(items, seen, max = 30) {
  const seenSet = new Set(seen);
  const out = [];
  for (const item of items) {
    if (!seenSet.has(item.key)) out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

export function rememberSeen(seen, keys) {
  return [...seen, ...keys.filter((k) => !seen.includes(k))].slice(-MAX_SEEN);
}

/** Tecken på att Facebook vill att en människa loggar in eller verifierar. */
export function needsHuman(url, bodyText) {
  if (/\/(login|checkpoint|two_step_verification|recover)/i.test(url ?? "")) return true;
  return /(captcha|säkerhetskontroll|security check|bekräfta att det är du|confirm it'?s you|ange koden|enter the code|ditt konto har låsts|your account has been locked)/i.test(
    bodyText ?? "",
  );
}

export function truncate(text, max) {
  const t = String(text ?? "");
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** Sista delen av en lång text (senaste meddelandena i en tråd står längst ner). */
export function tail(text, max) {
  const t = String(text ?? "");
  return t.length > max ? `…${t.slice(-max)}` : t;
}

export function jitterMs(minMs, maxMs, rand = Math.random) {
  return Math.round(minMs + rand() * (maxMs - minMs));
}

// ─── Integritetsfilter ────────────────────────────────────────────────────────
// Kontot är Kajsas privata. Bara det som rör jobbet får lämna datorn: kommentarer i
// bostadsgrupper och meddelanden som handlar om boende eller kommer från någon som har
// svarat på ett av hennes bostadsinlägg. Allt annat markeras som sett och skickas aldrig.
const JOBBORD =
  /(uthyr|hyr(a|es|s)?\s+ut|\bhyra\b|hyres|boende|bostad|lägenhet|\blgh\b|villa|\bhus\b|radhus|stuga|\brum\b|bädd|möbler|ledig|inflytt|tillträde|kvm|\bkr\b|kronor|per månad|\/mån|hyresgäst|företag|montör|arbetslag|stayonsite)/i;
// "Såg ditt inlägg" räcker i ett meddelande (så brukar svar på inlägg börja), men inte i en
// notis: "X kommenterade ditt inlägg" kan lika gärna vara en vän på en privat bild.
const INLAGGSORD = /(ditt inlägg|din annons|ditt bostadsinlägg)/i;
const BOSTADSGRUPP = /(lägenhet|bostad|boende|uthyr|\bhyr|\bhus\b|villa|housing|apartment|\brooms?\b|stug|torp|anslagstavla|köp|sälj)/i;

/** Namnet på den som kommenterade/svarade, ur notisens början. */
export function actorName(text) {
  const m = /^(.{2,60}?)\s+(kommenterade|svarade|nämnde|taggade|skrev|commented|replied|mentioned|tagged|wrote)\b/i.exec(normaliseText(text));
  if (!m) return null;
  const name = m[1].replace(/\s+(och|and)\s+\d+\s+(andra|others)$/i, "").trim();
  return name.split(" ").length <= 4 ? name : null;
}

/** Notis som rör Kajsas bostadsinlägg (gruppnamnet eller texten handlar om boende). */
export function isWorkNotification(text) {
  if (!isRelevantNotification(text)) return false;
  const t = normaliseText(text);
  const grupp = /\b(i|in)\s+(.{3,90}?)(:|\.|"|$)/i.exec(t)?.[2] ?? "";
  return BOSTADSGRUPP.test(grupp) || JOBBORD.test(t);
}

/** Messenger-tråd som rör jobbet: boendeord i förhandsvisningen, eller en avsändare som har svarat på ett bostadsinlägg. */
export function isWorkMessage(preview, workNames = []) {
  const t = normaliseText(preview);
  if (JOBBORD.test(t) || INLAGGSORD.test(t)) return true;
  return workNames.some((n) => n && t.toLowerCase().startsWith(n.toLowerCase()));
}

export function rememberNames(names, add) {
  const out = [...names];
  for (const n of add) if (n && !out.includes(n)) out.push(n);
  return out.slice(-500);
}

// ─── Grupper: söka, gå med, svara på medlemsfrågor ────────────────────────────
// Uppdragen kommer från Kajsas agent (GET /mac/uppdrag) efter att Kajsa har sagt ja.
export const MAX_JOINS_PER_DAY = 5;
export const MAX_JOINS_PER_RUN = 2;
export const TASK_CHECK_MINUTES = 3;
export const TASK_RUN_GAP_MINUTES = 5;

/** Dagens datum i Sverige, YYYY-MM-DD. */
export function swedishDate(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Hur många grupper datorn får gå med i till i dag. */
export function joinsLeft(state, now = new Date()) {
  const j = state.joins ?? {};
  return j.date === swedishDate(now) ? Math.max(0, MAX_JOINS_PER_DAY - (j.count ?? 0)) : MAX_JOINS_PER_DAY;
}

export function countJoin(state, now = new Date()) {
  const d = swedishDate(now);
  const j = state.joins?.date === d ? state.joins : { date: d, count: 0 };
  state.joins = { date: d, count: j.count + 1 };
}

const RESERVED = new Set(["feed", "discover", "joins", "create", "notifications", "search", "you", "your_groups", "join"]);

/** Kanonisk grupplänk (samma regel som agentens gruppUrl), eller null. */
export function groupUrl(href) {
  try {
    const u = new URL(href, "https://www.facebook.com");
    if (!/^(www\.|m\.|web\.)?facebook\.com$/.test(u.hostname)) return null;
    const m = /^\/groups\/([A-Za-z0-9._-]{2,100})\/?/.exec(u.pathname);
    if (!m || RESERVED.has(m[1].toLowerCase())) return null;
    return `https://www.facebook.com/groups/${m[1]}`;
  } catch {
    return null;
  }
}

const JOIN = /^(gå med i gruppen|gå med|join group|join)$/i;
const PENDING = /^(avbryt förfrågan|förfrågan skickad|förfrågan har skickats|cancel request|requested)$/i;
const MEMBER = /^(gått med|medlem|joined|visa grupp|besök grupp|visit group|view group)$/i;

export function isJoinLabel(label) {
  return JOIN.test(normaliseText(label));
}

/** Medlemskap utifrån knapparna i gruppens sidhuvud eller ett sökkort. */
export function membershipFromButtons(labels) {
  const l = (labels ?? []).map((x) => normaliseText(x));
  if (l.some((x) => PENDING.test(x))) return "vantar";
  if (l.some((x) => MEMBER.test(x))) return "medlem";
  if (l.some((x) => JOIN.test(x))) return "ej_medlem";
  return "okand";
}

/** Kort beskrivning ur ett sökkort: offentlig/privat, medlemmar, inlägg per dag. */
export function cardInfo(text, name) {
  const t = normaliseText(text).replace(normaliseText(name), "").trim();
  const delar = t
    .split(/\s*·\s*|\s{2,}/)
    .filter((d) => /(offentlig|privat|public|private|medlem|members|inlägg|posts)/i.test(d));
  return truncate(delar.join(" · ").trim(), 160);
}

/** Frågetext jämförd utan skiljetecken, stjärnor och "obligatorisk". */
export function normQuestion(text) {
  return normaliseText(text)
    .toLowerCase()
    .replace(/\b(obligatorisk|obligatoriskt|required|valfri|optional)\b/g, "")
    .replace(/[*?:.!"”“'’()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Matchar frågorna i rutan mot de svar Kajsa har godkänt. Allt måste stämma, annars
 * skickas ingenting: en fråga utan godkänt svar, ett svar som inte finns bland
 * alternativen eller regler som inte är godkända stoppar.
 */
export function matchAnswers(questions, approved, godkannRegler) {
  const byQ = new Map((approved ?? []).map((a) => [normQuestion(a.fraga), a.svar]));
  const plan = [];
  const saknas = [];
  for (const q of questions) {
    if (!q.fraga) {
      saknas.push("(oläslig fråga)");
      continue;
    }
    if (q.typ === "regler") {
      if (godkannRegler) plan.push({ ...q, val: q.alternativ ?? [] });
      else saknas.push(q.fraga);
      continue;
    }
    const svar = byQ.get(normQuestion(q.fraga));
    if (svar == null) {
      saknas.push(q.fraga);
      continue;
    }
    if (q.typ === "text") {
      plan.push({ ...q, text: svar });
      continue;
    }
    const valda = q.typ === "flerval" ? svar.split(/\s*\|\s*/) : [svar];
    const alt = q.alternativ ?? [];
    const traffar = valda.map((v) => alt.find((a) => normQuestion(a) === normQuestion(v)));
    if (!valda.length || traffar.some((t) => t == null)) saknas.push(q.fraga);
    else plan.push({ ...q, val: traffar });
  }
  return saknas.length ? { ok: false, saknas } : { ok: true, plan };
}

const REGEL = /(regler|regel|rules|godkänn|agree|accept)/i;

/** Rättar frågetypen: en kryssruta om gruppens regler är "regler". */
export function questionType(kind, fraga, alternativ = []) {
  if (kind === "text") return "text";
  if (kind === "checkbox" && (REGEL.test(fraga) || alternativ.some((a) => REGEL.test(a)))) return "regler";
  return kind === "radio" ? "val" : "flerval";
}
