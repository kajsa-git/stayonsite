// Mac-agent för CRM:ts meddelanden. Körs av launchd var 30:e sekund
// (se se.stayonsite.imessage-agent.plist) och gör två saker:
//
//   1. INKOMMANDE: läser nya svar ur ~/Library/Messages/chat.db — men BARA från
//      telefonnummer som redan finns i CRM:et (ägare/kontakter; listan hämtas från
//      /api/crm/inbox/agent). Övriga konversationer lämnas orörda. Nya meddelanden
//      postas till CRM:et (idempotent via chat.db-guid) och dyker upp i Min dag.
//   2. UTGÅENDE: hämtar köade meddelanden från CRM:t, skickar via Messages.app
//      (iMessage, fallback SMS) och rapporterar tillbaka status.
//      TYSTA TIMMAR: mellan 21:00 och 08:00 svensk tid skickas INGENTING —
//      köade meddelanden ligger kvar och går ut först på morgonen.
//
// Konfiguration (env, sätts i plisten eller läses ur .env.local):
//   CRM_AGENT_TOKEN  — bearer-token, samma som i Vercel
//   CRM_BASE_URL     — default https://www.stayonsite.se
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Läs .env.local bredvid repot om env saknas (gör att agenten funkar både via
// launchd med plist-env och manuellt via `node scripts/imessage-agent.mjs`).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(repoRoot, ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

const BASE = process.env.CRM_BASE_URL ?? "https://www.stayonsite.se";
const TOKEN = process.env.CRM_AGENT_TOKEN;
if (!TOKEN) {
  console.error("CRM_AGENT_TOKEN saknas — avbryter");
  process.exit(1);
}
const AUTH = { authorization: `Bearer ${TOKEN}` };

const CHAT_DB = path.join(os.homedir(), "Library/Messages/chat.db");
const STATE_FILE = path.join(os.homedir(), ".stayonsite-imessage-agent.json");
const APPLE_EPOCH_MS = 978307200000; // 2001-01-01 i unix-ms (chat.db räknar därifrån)
const BACKFILL_DAYS = 3; // första körningen: läs in svar från de senaste dagarna

function ts() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

// Svensk timme 0–23. Tysta timmar = 21:00–07:59: inga utskick, bara inläsning.
function stockholmHour() {
  return Number(
    new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", hour12: false }).format(new Date()),
  );
}
const isQuietHours = (h) => h >= 21 || h < 8;

// ---------- INKOMMANDE (chat.db → CRM) ----------

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}
function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (e) {
    console.error(`${ts()} kunde inte spara cursor-fil: ${e}`);
  }
}

// chat.db date konverteras till ms redan i SQL (rådata i ns spränger JS-number,
// node:sqlite kastar RangeError på kolumnvärden > MAX_SAFE_INTEGER).
function appleMsToIso(ms) {
  return new Date(APPLE_EPOCH_MS + (Number(ms) || 0)).toISOString();
}

// Många iMessage saknar message.text — innehållet ligger i attributedBody
// (typedstream-arkiv). Känd heuristik: UTF-8-strängen ligger efter "NSString"-
// markören, längdprefixad ('+' 0x2b följt av längd; 0x81 = uint16 LE, 0x82 = uint32 LE).
function decodeAttributedBody(buf) {
  try {
    const i = buf.indexOf(Buffer.from("NSString"));
    if (i === -1) return null;
    const plus = buf.indexOf(0x2b, i + 8);
    if (plus === -1 || plus - (i + 8) > 12) return null;
    let p = plus + 1;
    let len = buf[p];
    p += 1;
    if (len === 0x81) {
      len = buf.readUInt16LE(p);
      p += 2;
    } else if (len === 0x82) {
      len = buf.readUInt32LE(p);
      p += 4;
    }
    if (!len || p + len > buf.length) return null;
    const text = buf.subarray(p, p + len).toString("utf8");
    return text.trim() || null;
  } catch {
    return null;
  }
}

async function ingestIncoming() {
  // Kända nummer från CRM:et — utan dem läser vi ingenting ur chat.db.
  let known;
  try {
    const res = await fetch(`${BASE}/api/crm/inbox/agent`, { headers: AUTH });
    if (res.status === 404) return; // endpoint ej deployad ännu — tyst
    if (!res.ok) {
      console.error(`${ts()} inbox: kunde inte hämta kända nummer: HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    known = new Set(Array.isArray(data.phones) ? data.phones : []);
  } catch (e) {
    console.error(`${ts()} inbox: nätverksfel vid nummerhämtning: ${e?.message ?? e}`);
    return;
  }
  if (known.size === 0) return;

  // node:sqlite är stabilt i Node 24 men flaggat "experimental" — filtrera bort just
  // den varningen så launchd-loggen inte fylls (andra varningar skrivs fortfarande ut).
  process.removeAllListeners("warning");
  process.on("warning", (w) => {
    if (w.name !== "ExperimentalWarning") console.error(w.stack ?? String(w));
  });
  let dbMod;
  try {
    dbMod = await import("node:sqlite");
  } catch {
    console.error(`${ts()} inbox: node:sqlite saknas (Node ${process.version}) — hoppar inläsning`);
    return;
  }

  let db;
  try {
    db = new dbMod.DatabaseSync(CHAT_DB, { readOnly: true });
  } catch (e) {
    // Vanligaste orsaken: node saknar Full diskåtkomst (TCC). Agenten kör var
    // 30:e sekund — logga max en gång i timmen så loggen inte dränks.
    const state = readState();
    if (!state.lastFdaErrAt || Date.now() - state.lastFdaErrAt > 3600_000) {
      console.error(
        `${ts()} inbox: kunde inte öppna chat.db — ge node Full diskåtkomst (Systeminställningar → Integritet & säkerhet → Full diskåtkomst → lägg till ${process.execPath}): ${e?.message ?? e}`,
      );
      writeState({ ...state, lastFdaErrAt: Date.now() });
    }
    return;
  }

  try {
    const state = readState();
    let cursor = Number.isFinite(state.lastRowId) ? state.lastRowId : null;

    if (cursor === null) {
      // Första körningen: börja vid meddelanden från de senaste BACKFILL_DAYS dagarna
      // (fångar kampanjsvaren) i stället för hela historiken.
      const cutoffNs = (Date.now() - BACKFILL_DAYS * 86400_000 - APPLE_EPOCH_MS) * 1e6;
      const row = db.prepare("SELECT IFNULL(MAX(ROWID), 0) AS max_id FROM message WHERE date <= ?").get(cutoffNs);
      cursor = Number(row?.max_id ?? 0);
      console.log(`${ts()} inbox: initierar cursor vid ROWID ${cursor} (${BACKFILL_DAYS} dagars backfill)`);
    }

    // date räknas om till ms i SQL: ns-rådata (~8e17) spränger JS-number och får
    // node:sqlite att kasta RangeError. Tröskeln skiljer ns (nya macOS) från
    // sekunder (mycket gamla databaser). BÅDA riktningarna läses (is_from_me
    // avgör direction) så att Kajsas egna Messages-svar också når CRM-historiken.
    const rows = db
      .prepare(
        `SELECT m.ROWID AS rowid, m.guid AS guid, m.text AS text, m.attributedBody AS ab,
                CASE WHEN m.date > 100000000000 THEN m.date / 1000000 ELSE m.date * 1000 END AS date_ms,
                m.service AS service, m.is_from_me AS is_from_me, h.id AS handle
         FROM message m
         JOIN handle h ON h.ROWID = m.handle_id
         WHERE m.ROWID > ?
         ORDER BY m.ROWID ASC
         LIMIT 500`,
      )
      .all(cursor);
    if (rows.length === 0) return;

    const maxRowId = Number(rows[rows.length - 1].rowid);
    const matching = [];
    for (const r of rows) {
      const handle = String(r.handle ?? "");
      if (!handle.startsWith("+") || !known.has(handle)) continue; // bara kända CRM-nummer
      let body = (r.text ?? "").toString().trim();
      if (!body && r.ab) body = decodeAttributedBody(Buffer.from(r.ab)) ?? "";
      matching.push({
        guid: String(r.guid),
        fromPhone: handle,
        body,
        service: r.service ? String(r.service) : null,
        direction: Number(r.is_from_me) === 1 ? "out" : "in",
        sentAt: appleMsToIso(r.date_ms),
      });
    }

    if (matching.length === 0) {
      writeState({ ...state, lastRowId: maxRowId });
      return;
    }

    const res = await fetch(`${BASE}/api/crm/inbox/agent`, {
      method: "POST",
      headers: { ...AUTH, "content-type": "application/json" },
      body: JSON.stringify({ messages: matching }),
    });
    if (!res.ok) {
      // Flytta INTE fram cursorn — raderna försöks igen nästa tick (guid gör om-försök ofarliga).
      console.error(`${ts()} inbox: ingest misslyckades: HTTP ${res.status}`);
      return;
    }
    writeState({ ...state, lastRowId: maxRowId });
    console.log(`${ts()} inbox: läste in ${matching.length} svar (t.o.m. ROWID ${maxRowId})`);
  } catch (e) {
    console.error(`${ts()} inbox: fel vid läsning: ${e?.message ?? e}`);
  } finally {
    try {
      db.close();
    } catch {
      /* redan stängd */
    }
  }
}

// ---------- UTGÅENDE (CRM → Messages.app) ----------

// Skicka via Messages.app. AppleScript-strängen escapas (backslash + citattecken);
// själva texten skickas som variabel så inga andra tecken kan bryta scriptet.
function sendViaMessages(toPhone, body) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const script = `
tell application "Messages"
  set msgText to "${esc(body)}"
  try
    set svc to 1st account whose service type = iMessage and enabled is true
    send msgText to participant "${esc(toPhone)}" of svc
    return "iMessage"
  on error
    set smsSvc to 1st account whose service type = SMS and enabled is true
    send msgText to participant "${esc(toPhone)}" of smsSvc
    return "SMS"
  end try
end tell`;
  // 120 s timeout: första körningen visar macOS en behörighetsdialog ("osascript vill
  // styra Messages") som måste hinna klickas innan anropet släpps igenom.
  return execFileSync("osascript", ["-e", script], { encoding: "utf8", timeout: 120_000 }).trim();
}

async function sendQueued() {
  if (isQuietHours(stockholmHour())) return; // tysta timmar: rör inte ens kön

  const res = await fetch(`${BASE}/api/crm/messages/agent`, { headers: AUTH });
  if (!res.ok) {
    console.error(`${ts()} kunde inte hämta kön: HTTP ${res.status}`);
    return;
  }
  const queue = await res.json();
  if (!Array.isArray(queue) || queue.length === 0) return; // tomt — tyst

  for (const msg of queue) {
    let ok = false;
    let error = null;
    let via = "";
    try {
      via = sendViaMessages(msg.toPhone, msg.body);
      ok = true;
    } catch (e) {
      error = String(e?.message ?? e).slice(0, 400);
    }
    await fetch(`${BASE}/api/crm/messages/agent`, {
      method: "POST",
      headers: { ...AUTH, "content-type": "application/json" },
      body: JSON.stringify({ id: msg.id, ok, error }),
    }).catch((e) => console.error(`${ts()} kunde inte rapportera ${msg.id}: ${e}`));
    console.log(`${ts()} ${msg.id} -> ${msg.toPhone}: ${ok ? `skickat via ${via}` : `FEL: ${error}`}`);
    await new Promise((r) => setTimeout(r, 1500)); // paus mellan utskick — snällt mot Messages
  }
}

// Inläsning först (svaren ska in även om utskicksdelen felar), sedan utskick.
// Båda faserna felskyddade: en nätverkstimeout ska ge EN loggrad, inte en
// ohanterad krasch-trace i launchd-loggen var 30:e sekund.
try {
  await ingestIncoming();
} catch (e) {
  console.error(`${ts()} inbox: oväntat fel: ${e?.message ?? e}`);
}
try {
  await sendQueued();
} catch (e) {
  console.error(`${ts()} utskick: nätverksfel: ${e?.message ?? e}`);
}
process.exit(0);
