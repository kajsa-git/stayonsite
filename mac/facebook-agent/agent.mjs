// Facebook-agenten på Kajsas Mac. Läser nya notiser (kommentarer och svar på hennes
// inlägg) och nya Messenger-trådar i ett eget Chrome-fönster där Kajsa är inloggad,
// och skickar texten till Kajsas agent (kajsas-agent.vercel.app) som tar hand om resten.
//
// Den läser notiser och meddelanden. Den postar, kommenterar och skickar inga
// meddelanden. Den enda skrivande handlingen är att gå med i grupper och svara på deras
// medlemsfrågor, och bara på uppdrag som Kajsa har godkänt i Telegram (se grupper.mjs).
// Kontot är Kajsas privata: bara jobbrelaterat (bostadsgrupper, boendeord, personer som
// svarat på hennes bostadsinlägg) skickas vidare. Privata notiser och meddelanden
// stannar på datorn och skickas aldrig (se integritetsfiltret i lib.mjs).
//
// Regler i koden:
//   - körs bara dagtid (08-21) och när datorn har varit orörd i minst 3 minuter
//   - högst var 20:e minut, få sidladdningar per körning, mänskliga pauser
//   - vill Facebook att någon loggar in eller verifierar: pausa och meddela Kajsa,
//     försök aldrig ta sig förbi kontrollen
//
// Lägen:
//   node agent.mjs --login   öppna fönstret så att Kajsa kan logga in på Facebook en gång
//   node agent.mjs --once    en körning nu (struntar i tid och orördhet)
//   node agent.mjs --loop    för launchd (se se.stayonsite.facebook-agent.plist)
//   node agent.mjs --grupp <länk>   visa medlemskap i en grupp (klickar inget, skickar inget)
//   node agent.mjs --sok "<sökord>" sök grupper och visa träffarna (skickar inget)
//
// Uppdateringar: i --loop hämtar agenten själv ny version från GitHub var 30:e minut
// (bara när något i mac/facebook-agent har ändrats), installerar paket om de har ändrats
// och avslutar sig. launchd startar den direkt igen med den nya koden.
//
// Konfiguration (läses ur repots .env.local om den inte finns i miljön):
//   KAJSA_AGENT_URL    https://kajsas-agent.vercel.app
//   MAC_AGENT_SECRET   samma hemlighet som i agentens Vercel-projekt
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_DETAILS_PER_RUN,
  actorName,
  isWorkMessage,
  isWorkNotification,
  rememberNames,
  MIN_IDLE_SECONDS,
  RUN_EVERY_MINUTES,
  TASK_CHECK_MINUTES,
  TASK_RUN_GAP_MINUTES,
  cleanUrl,
  isDaytime,
  isRelevantNotification,
  itemKey,
  jitterMs,
  needsHuman,
  newItems,
  normaliseText,
  parseIdleSeconds,
  rememberSeen,
  tail,
  truncate,
  unreadFromTitle,
} from "./lib.mjs";
import { inspectGroup, runTask, searchGroups } from "./grupper.mjs";
import { UPDATE_EVERY_MINUTES, updateIfNewer } from "./uppdatera.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const envFile = path.join(repoRoot, ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

const AGENT_URL = (process.env.KAJSA_AGENT_URL ?? "https://kajsas-agent.vercel.app").replace(/\/+$/, "");
const SECRET = process.env.MAC_AGENT_SECRET;
// Versionen (git-commit) skickas med i varje anrop, så att det syns i agentens loggar
// vilken version som kör på Kajsas dator.
const VERSION = (() => {
  try {
    return execFileSync("/usr/bin/git", ["-C", repoRoot, "rev-parse", "--short", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "okand";
  }
})();
const USER_AGENT = `stayonsite-facebook-agent/${VERSION}`;
const PROFILE_DIR = path.join(os.homedir(), "Library/Application Support/stayonsite-facebook-agent");
const STATE_FILE = path.join(os.homedir(), ".stayonsite-facebook-agent.json");
const argAfter = (flag) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const mode = process.argv.includes("--login")
  ? "login"
  : process.argv.includes("--once")
    ? "once"
    : process.argv.includes("--grupp")
      ? "grupp"
      : process.argv.includes("--sok")
        ? "sok"
        : "loop";

const ts = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const log = (...a) => console.log(ts(), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { seen: [], workNames: [], lastRunAt: null, pausedUntil: null, initialised: false };
  }
}
function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function idleSeconds() {
  try {
    return parseIdleSeconds(execFileSync("/usr/sbin/ioreg", ["-c", "IOHIDSystem"], { encoding: "utf8" }));
  } catch {
    return null;
  }
}

async function postToAgent(body) {
  const res = await fetch(`${AGENT_URL}/mac/facebook`, {
    method: "POST",
    headers: { authorization: `Bearer ${SECRET}`, "content-type": "application/json", "user-agent": USER_AGENT },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Agenten svarade ${res.status}`);
}

async function fetchTasks() {
  const res = await fetch(`${AGENT_URL}/mac/uppdrag`, {
    headers: { authorization: `Bearer ${SECRET}`, "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Agenten svarade ${res.status}`);
  const body = await res.json();
  return Array.isArray(body.uppdrag) ? body.uppdrag : [];
}

async function openBrowser() {
  const { chromium } = await import("playwright-core");
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  // Kajsas vanliga Chrome, men en egen profil: hennes egna flikar och inloggningar
  // berörs inte, och Facebook ser samma dator och uppkoppling som vanligt.
  return chromium.launchPersistentContext(PROFILE_DIR, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1280, height: 900 },
    locale: "sv-SE",
    timezoneId: "Europe/Stockholm",
    args: ["--window-position=60,60", "--window-size=1280,980"],
  });
}

async function settle(page, min = 2500, max = 5500) {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await sleep(jitterMs(min, max));
}

async function checkHuman(page) {
  const body = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) ?? "").catch(() => "");
  return needsHuman(page.url(), body);
}

/** Notiser i huvudytan: länk och text per notis. */
async function readNotifications(page) {
  await page.goto("https://www.facebook.com/notifications", { waitUntil: "domcontentloaded" });
  await settle(page, 4000, 7000);
  if (await checkHuman(page)) return { human: true, items: [] };
  const raw = await page.evaluate(() => {
    const root = document.querySelector('[role="main"]') ?? document.body;
    const out = [];
    for (const a of root.querySelectorAll("a[href]")) {
      const text = (a.innerText || "").trim();
      if (text.length < 15) continue;
      out.push({ href: a.href, text: text.slice(0, 600) });
      if (out.length >= 40) break;
    }
    return out;
  });
  const items = raw
    .filter((r) => isRelevantNotification(r.text))
    .map((r) => ({
      kind: "notis",
      url: cleanUrl(r.href),
      summary: normaliseText(r.text),
      key: itemKey("notis", r.href, r.text),
      work: isWorkNotification(r.text),
    }));
  return { human: false, items, unread: unreadFromTitle(await page.title()) };
}

/** Messenger-trådar i listan: namn och förhandsvisning per tråd. */
async function readMessengerList(page, workNames) {
  await page.goto("https://www.facebook.com/messages/", { waitUntil: "domcontentloaded" });
  await settle(page, 4000, 7000);
  if (await checkHuman(page)) return { human: true, items: [] };
  const raw = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/messages/t/"], a[href*="/messages/e2ee/t/"]')) {
      const text = (a.innerText || "").trim();
      if (text.length < 3) continue;
      out.push({ href: a.href, text: text.slice(0, 400) });
      if (out.length >= 15) break;
    }
    return out;
  });
  const items = raw.map((r) => ({
    kind: "meddelande",
    url: cleanUrl(r.href),
    summary: normaliseText(r.text),
    key: itemKey("meddelande", r.href, r.text),
    work: isWorkMessage(r.text, workNames),
  }));
  return { human: false, items };
}

/** Öppnar en notis eller tråd och läser texten kring den. */
async function readDetail(page, item) {
  await page.goto(item.url, { waitUntil: "domcontentloaded" });
  await settle(page, 3500, 6500);
  if (await checkHuman(page)) return { human: true };
  const text = await page.evaluate(() => {
    const el = document.querySelector('[role="dialog"]') ?? document.querySelector('[role="main"]') ?? document.body;
    return (el?.innerText ?? "").trim();
  });
  // I en tråd står det senaste längst ner, i ett inlägg står inlägget först.
  return { human: false, detail: item.kind === "meddelande" ? tail(text, 3000) : truncate(text, 3500) };
}

/** Uppdrag från agenten: söka grupper, gå med, svara på medlemsfrågor. */
async function runTasks(state, { force = false } = {}) {
  if (!SECRET) throw new Error("MAC_AGENT_SECRET saknas i .env.local");
  const now = new Date();
  if (state.pausedUntil && new Date(state.pausedUntil) > now && !force) return;
  if (!force && !isDaytime(now)) return;
  const tasks = (await fetchTasks()).filter((t) => !(state.doneTasks ?? []).includes(t.id));
  if (!tasks.length) return;
  if (!force) {
    const idle = idleSeconds();
    if (idle == null || idle < MIN_IDLE_SECONDS) return;
    if (state.lastTaskRunAt && now - new Date(state.lastTaskRunAt) < TASK_RUN_GAP_MINUTES * 60_000) return;
  }
  state.lastTaskRunAt = now.toISOString();
  writeState(state);
  const task = tasks[0];
  log(`uppdrag ${task.id} (${task.typ}) startar`);
  const context = await openBrowser();
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    const r = await runTask(page, task, state, { settle, checkHuman });
    writeState(state);
    if (r.human) return await pauseForHuman(state, "Facebook vill att någon loggar in eller verifierar kontot (grupper)");
    if (!r.resultat) return log(`uppdrag ${task.id}: inget att rapportera ännu`);
    await postToAgent({ resultat: r.resultat });
    if (r.resultat.klar) state.doneTasks = [...(state.doneTasks ?? []), task.id].slice(-200);
    writeState(state);
    log(`uppdrag ${task.id}: rapporterat${r.resultat.klar ? ", klart" : ", fortsätter senare"}`);
  } finally {
    await context.close().catch(() => {});
  }
}

async function runOnce(state, { force = false } = {}) {
  if (!SECRET) throw new Error("MAC_AGENT_SECRET saknas i .env.local");
  const now = new Date();
  if (state.pausedUntil && new Date(state.pausedUntil) > now && !force) return log("pausad till", state.pausedUntil);
  if (!force) {
    if (!isDaytime(now)) return;
    const idle = idleSeconds();
    if (idle == null || idle < MIN_IDLE_SECONDS) return;
    if (state.lastRunAt && now - new Date(state.lastRunAt) < RUN_EVERY_MINUTES * 60_000) return;
  }

  state.lastRunAt = now.toISOString();
  writeState(state);
  log("körning startar");
  const context = await openBrowser();
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    const notiser = await readNotifications(page);
    if (notiser.human) return await pauseForHuman(state, "Facebook vill att någon loggar in eller verifierar kontot");
    // Den som svarar på ett bostadsinlägg räknas som jobbkontakt även i Messenger.
    state.workNames = rememberNames(state.workNames ?? [], notiser.items.filter((i) => i.work).map((i) => actorName(i.summary)));
    await sleep(jitterMs(2000, 5000));
    const tradar = await readMessengerList(page, state.workNames);
    if (tradar.human) return await pauseForHuman(state, "Facebook vill att någon loggar in eller verifierar kontot (Messenger)");

    const all = [...notiser.items, ...tradar.items];
    if (!state.initialised) {
      // Första körningen: allt som redan finns räknas som sett, så Kajsa inte får hela historiken.
      state.seen = rememberSeen(state.seen, all.map((i) => i.key));
      state.initialised = true;
      writeState(state);
      return log(`första körningen: ${all.length} befintliga poster markerade som sedda`);
    }

    const fresh = newItems(all, state.seen);
    if (!fresh.length) return log("inget nytt");
    // Integritetsfiltret: privata notiser och meddelanden lämnar aldrig datorn. De
    // markeras som sedda och loggas bara som antal.
    const work = fresh.filter((i) => i.work);
    const privata = fresh.length - work.length;
    if (!work.length) {
      state.seen = rememberSeen(state.seen, fresh.map((i) => i.key));
      writeState(state);
      return log(`inget jobbrelaterat (${privata} privata poster hoppades över)`);
    }

    const events = [];
    for (const item of work.slice(0, MAX_DETAILS_PER_RUN)) {
      await sleep(jitterMs(2500, 6000));
      const d = await readDetail(page, item);
      if (d.human) return await pauseForHuman(state, "Facebook vill att någon verifierar kontot");
      events.push({ kind: item.kind, key: item.key, url: item.url, summary: item.summary, detail: d.detail });
    }
    // Resten skickas med bara sin sammanfattning; de öppnas inte i den här körningen.
    for (const item of work.slice(MAX_DETAILS_PER_RUN)) events.push(item);

    await postToAgent({ events });
    state.seen = rememberSeen(state.seen, fresh.map((i) => i.key));
    writeState(state);
    log(`skickade ${events.length} jobbrelaterade poster till agenten (${privata} privata hoppades över)`);
  } finally {
    await context.close().catch(() => {});
  }
}

async function pauseForHuman(state, reason) {
  state.pausedUntil = new Date(Date.now() + 2 * 60 * 60_000).toISOString();
  writeState(state);
  log("pausar:", reason);
  await postToAgent({ status: "needs_kajsa", reason }).catch((e) => log("kunde inte meddela agenten:", e.message));
}

async function login() {
  log("öppnar Facebook i agentens fönster. Logga in, och stäng sedan fönstret.");
  const context = await openBrowser();
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto("https://www.facebook.com/");
  await new Promise((resolve) => context.on("close", resolve));
  const state = readState();
  state.pausedUntil = null;
  writeState(state);
  log("klart. Agenten fortsätter vid nästa körning.");
}

async function debug(fn) {
  const context = await openBrowser();
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    console.log(JSON.stringify(await fn(page), null, 2));
  } finally {
    await context.close().catch(() => {});
  }
}

if (mode === "login") {
  await login();
} else if (mode === "once") {
  await runTasks(readState(), { force: true }).catch((e) => log("fel i uppdrag:", e?.message ?? e));
  await runOnce(readState(), { force: true });
} else if (mode === "grupp") {
  await debug((page) => inspectGroup(page, argAfter("--grupp"), { settle, checkHuman }));
} else if (mode === "sok") {
  await debug((page) => searchGroups(page, [argAfter("--sok")], { settle, checkHuman }));
} else {
  log(`Facebook-agenten ${VERSION} startar (läser, och går med i grupper bara på Kajsas uppdrag)`);
  let lastTaskCheck = 0;
  let lastUpdateCheck = Date.now();
  for (;;) {
    if (Date.now() - lastUpdateCheck >= UPDATE_EVERY_MINUTES * 60_000) {
      lastUpdateCheck = Date.now();
      // Avsluta mellan körningar; launchd (KeepAlive) startar om med den nya koden.
      if (updateIfNewer({ repoRoot, agentDir: here, log })) process.exit(0);
    }
    if (Date.now() - lastTaskCheck >= TASK_CHECK_MINUTES * 60_000) {
      lastTaskCheck = Date.now();
      try {
        await runTasks(readState());
      } catch (e) {
        log("fel i uppdrag:", e?.message ?? e);
      }
    }
    try {
      await runOnce(readState());
    } catch (e) {
      log("fel:", e?.message ?? e);
    }
    await sleep(60_000);
  }
}
