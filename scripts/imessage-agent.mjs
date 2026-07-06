// Mac-agent för CRM:ts meddelandeutkorg. Körs av launchd var 30:e sekund
// (se se.stayonsite.imessage-agent.plist): hämtar köade meddelanden från CRM:t,
// skickar via Messages.app (iMessage, fallback SMS) och rapporterar status.
//
// Konfiguration (env, sätts i plisten eller läses ur .env.local):
//   CRM_AGENT_TOKEN  — bearer-token, samma som i Vercel
//   CRM_BASE_URL     — default https://www.stayonsite.se
import { execFileSync } from "node:child_process";
import fs from "node:fs";
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

function ts() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

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
  return execFileSync("osascript", ["-e", script], { encoding: "utf8", timeout: 30_000 }).trim();
}

const res = await fetch(`${BASE}/api/crm/messages/agent`, { headers: AUTH });
if (!res.ok) {
  console.error(`${ts()} kunde inte hämta kön: HTTP ${res.status}`);
  process.exit(1);
}
const queue = await res.json();
if (!Array.isArray(queue) || queue.length === 0) process.exit(0); // tomt — tyst exit

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
process.exit(0);
