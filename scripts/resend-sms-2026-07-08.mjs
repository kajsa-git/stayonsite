// Omskick 2026-07-08: de 31 kampanjmottagare vars iMessage 2026-07-06 aldrig
// levererades (chat.db error 22) får kampanjfrågan igen — nu som ÄKTA SMS via
// tvingad SMS-tjänst (ingen iMessage-chansning). Text godkänd av Kajsa 2026-07-08.
//
// Kör i FÖRGRUNDEN från repo-roten:  node scripts/resend-sms-2026-07-08.mjs
// Säkerhet: kanarietest (första mottagaren verifieras i chat.db innan resten),
// stopp vid första sändfel, hoppar över alla som redan fått dagens text,
// spärrlista (Andrée/Tumba får ALDRIG utskick — Kajsas order 2026-07-08).
import { createClient } from "@libsql/client";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Spärrlista — skickas ALDRIG till, oavsett listinnehåll.
const BLOCKLIST = new Set([
  "+46702001534", // Andrée, Tumba — Kajsa 2026-07-08: "skicka inte till andre i tumba"
]);

// De 31 med iMessage error 22 den 6/7 (leveranskoll via chat.db 2026-07-07).
const FAILED_PHONES = new Set([
  "+46739825212","+46760698340","+46738392700","+46706951424","+46701499480",
  "+46761692645","+46735770696","+46722210241","+46721454182","+46706370884",
  "+46705329446","+46736910646","+46736136547","+46707584888","+46738243610",
  "+46706529993","+46703594803","+46703482766","+46730324133","+46727294999",
  "+46706565148","+46706419506","+46706554611","+46702582180","+46702764757",
  "+46704610177","+46707545000","+46704600173","+46735894804","+46703023921",
  "+46708240600",
]);

const campaign = JSON.parse(fs.readFileSync("scripts/sms-campaign-final.json", "utf8"));
const recipients = campaign.recipients.filter((r) => FAILED_PHONES.has(r.phone) && !BLOCKLIST.has(r.phone));

// Kajsas godkända text 2026-07-08 (styckebrytningar återskapade från dubbelblanksteg).
const buildBody = (firstName) =>
  `Hej ${firstName}! Kajsa på StayOnSite här, vi har haft kontakt om uthyrning av ditt boende till företagskunder.\n` +
  `Får jag lägga upp ditt boende på vår hemsida? Då ser företag som söker boende det när de söker på din stad, och chansen ökar att jag kan matcha dig mot nya förfrågningar framåt. Helt gratis, exakt adress visas aldrig och inget åtagande: du tackar ja eller nej per förfrågan som vanligt. Du kan ha ditt boende utannonserat även om det just nu är uthyrt - då många företag planerar lång tid framåt.\n` +
  `Svara JA så lägger jag upp det och skickar länken till dig 😊\n` +
  `/Mvh Kajsa\nStayOnSite`;

// TVINGAD SMS — ingen iMessage-fallback åt något håll. Felet bubblar upp och stoppar körningen.
function sendViaSms(toPhone, body) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const script = `
tell application "Messages"
  set msgText to "${esc(body)}"
  set smsSvc to 1st account whose service type = SMS and enabled is true
  send msgText to participant "${esc(toPhone)}" of smsSvc
  return "SMS"
end tell`;
  return execFileSync("osascript", ["-e", script], { encoding: "utf8", timeout: 120_000 }).trim();
}

const APPLE_EPOCH_MS = 978307200000;
function outgoingToday(chatDb, phone, needle) {
  const sinceNs = (Date.now() - 12 * 3600_000 - APPLE_EPOCH_MS) * 1e6;
  const rows = chatDb
    .prepare(
      `SELECT m.text, m.attributedBody AS ab, m.service, m.error FROM message m JOIN handle h ON h.ROWID = m.handle_id
       WHERE m.is_from_me = 1 AND h.id = ? AND m.date > ?`,
    )
    .all(phone, sinceNs);
  return rows.filter((r) => {
    const t = (r.text ?? "").toString();
    return t.includes(needle) || (r.ab ? Buffer.from(r.ab).includes(Buffer.from(needle)) : false);
  });
}

const nanoid = () => crypto.randomBytes(21).toString("base64url").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 21);
const NEEDLE = "Får jag lägga upp ditt boende";

const { DatabaseSync } = await import("node:sqlite");
const chatDb = new DatabaseSync(path.join(os.homedir(), "Library/Messages/chat.db"), { readOnly: true });

// Ägare per telefonnummer (för outbox-koppling + kontaktlogg på objekten).
const phones = recipients.map((r) => r.phone);
const ph = phones.map(() => "?").join(",");
const ownerRows = (await db.execute({ sql: `SELECT id, phone FROM crm_owners WHERE phone IN (${ph})`, args: phones })).rows;
const ownerByPhone = new Map(ownerRows.map((o) => [o.phone, o.id]));

const log = [];
let sent = 0;

async function recordSend(r, body) {
  const ownerId = ownerByPhone.get(r.phone) ?? null;
  await db.execute({
    sql: `INSERT INTO crm_outbox_messages (id, to_phone, body, owner_id, status, created_at, sent_at) VALUES (?, ?, ?, ?, 'sent', datetime('now'), datetime('now'))`,
    args: [nanoid(), r.phone, body, ownerId],
  });
  if (ownerId) {
    const props = (await db.execute({ sql: `SELECT id FROM crm_properties WHERE owner_id = ?`, args: [ownerId] })).rows;
    for (const p of props) {
      await db.execute({
        sql: `INSERT INTO crm_property_notes (id, property_id, channel, content, created_at) VALUES (?, ?, 'sms', ?, datetime('now'))`,
        args: [nanoid(), p.id, "Omskick av kampanjfrågan som äkta SMS (6/7-utskicket nådde aldrig fram — iMessage error 22)."],
      });
    }
  }
}

console.log(`Mottagare efter filter: ${recipients.length} (spärrlista aktiv: ${BLOCKLIST.size} nummer)`);

// Hoppa över alla som redan fått dagens text (om skriptet körs om).
const todo = recipients.filter((r) => outgoingToday(chatDb, r.phone, NEEDLE).length === 0);
if (todo.length < recipients.length) console.log(`hoppar över ${recipients.length - todo.length} som redan fått dagens SMS`);
if (todo.length === 0) { console.log("inget att skicka"); process.exit(0); }

// ── KANARIE: första mottagaren, verifiera i chat.db innan resten ──
const canary = todo[0];
console.log(`KANARIE → ${canary.name} (${canary.phone})`);
const canaryBody = buildBody(canary.firstName);
sendViaSms(canary.phone, canaryBody);
await new Promise((res) => setTimeout(res, 45_000));
const canaryCheck = outgoingToday(chatDb, canary.phone, NEEDLE);
const canaryOk = canaryCheck.some((m) => m.service === "SMS" && Number(m.error ?? 0) === 0);
if (!canaryOk) {
  console.error(`AVBRYTER: kanarien verifierades inte som levererad SMS (hittade: ${JSON.stringify(canaryCheck.map((m) => ({ service: m.service, error: m.error })))}).`);
  process.exit(1);
}
await recordSend(canary, canaryBody);
sent++;
log.push({ name: canary.name, phone: canary.phone, via: "SMS", canary: true });
console.log("kanarie OK (service=SMS, error=0) — fortsätter med resten");

for (const r of todo.slice(1)) {
  const body = buildBody(r.firstName);
  try {
    sendViaSms(r.phone, body);
  } catch (e) {
    console.error(`STOPP vid ${r.name} (${r.phone}): ${e?.message ?? e}`);
    fs.writeFileSync("scripts/resend-sms-2026-07-08-log.json", JSON.stringify({ at: new Date().toISOString(), sent, log, stoppedAt: r.phone }, null, 2));
    process.exit(1);
  }
  await recordSend(r, body);
  sent++;
  log.push({ name: r.name, phone: r.phone, via: "SMS" });
  console.log(`${sent}/${todo.length} skickat → ${r.name}`);
  await new Promise((res) => setTimeout(res, 1500));
}

chatDb.close();
fs.writeFileSync("scripts/resend-sms-2026-07-08-log.json", JSON.stringify({ at: new Date().toISOString(), sent, log }, null, 2));
console.log(`\nKLART: ${sent}/${todo.length} skickade som SMS. Logg: scripts/resend-sms-2026-07-08-log.json`);
process.exit(0);
