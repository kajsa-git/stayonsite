// Startdelen av Facebook-agenten på Kajsas Mac. launchd kör den här filen (se
// se.stayonsite.facebook-agent.plist), och den startar huvuddelen (huvud.mjs).
//
// Den hålls liten och stabil, med bara Node:s inbyggda moduler och uppdatera.mjs, så att
// den fungerar även när en ny version av huvuddelen är trasig:
//   - hämtar ny version från GitHub vid start och var 30:e minut (var 5:e när
//     huvuddelen kraschar), och startar då om allt med den nya koden
//   - installerar paket som saknas innan huvuddelen startas
//   - startar om huvuddelen när den avslutas, med längre väntan om den kraschar direkt
//   - kraschar huvuddelen tre gånger i rad säger den till agenten, som säger till Kajsa
//
// Andra lägen (--login, --once, --grupp, --sok) körs direkt i huvuddelen.
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UPDATE_EVERY_MINUTES, updateIfNewer } from "./uppdatera.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const HUVUD = path.join(here, "huvud.mjs");
const args = process.argv.slice(2);

const ts = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const log = (...a) => console.log(ts(), "[start]", ...a);

if (args.length && !args.includes("--loop")) {
  const r = spawnSync(process.execPath, [HUVUD, ...args], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

// Testknappar (används bara av test/start.test.mjs).
const RESTART_BASE_MS = Number(process.env.FB_AGENT_RESTART_BASE_MS) || 60_000;
const QUICK_MS = Number(process.env.FB_AGENT_QUICK_MS) || 2 * 60_000;
const TICK_MS = Number(process.env.FB_AGENT_TICK_MS) || 60_000;
const CHECK_OK_MS = UPDATE_EVERY_MINUTES * 60_000;
const CHECK_CRASH_MS = 5 * 60_000;

function readEnv() {
  const env = { ...process.env };
  const file = path.join(repoRoot, ".env.local");
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function version() {
  try {
    return execFileSync("/usr/bin/git", ["-C", repoRoot, "rev-parse", "--short", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "okand";
  }
}

function ensurePackages() {
  const pkg = JSON.parse(fs.readFileSync(path.join(here, "package.json"), "utf8"));
  const missing = Object.keys(pkg.dependencies ?? {}).filter((d) => !fs.existsSync(path.join(here, "node_modules", d, "package.json")));
  if (!missing.length) return;
  log("installerar saknade paket:", missing.join(", "));
  execFileSync(path.join(path.dirname(process.execPath), "npm"), ["install", "--omit=dev", "--no-audit", "--no-fund"], {
    cwd: here,
    stdio: "ignore",
    timeout: 300_000,
  });
}

async function report(status, reason) {
  const env = readEnv();
  const url = (env.KAJSA_AGENT_URL ?? "https://kajsas-agent.vercel.app").replace(/\/+$/, "");
  if (!env.MAC_AGENT_SECRET) return;
  await fetch(`${url}/mac/facebook`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.MAC_AGENT_SECRET}`, "content-type": "application/json", "user-agent": `stayonsite-facebook-agent/${version()}` },
    body: JSON.stringify({ status, version: version(), reason: reason.slice(-1500) }),
    signal: AbortSignal.timeout(20_000),
  });
}

// Uppdateringsfel syns bara i agentens loggar (inte för Kajsa), högst en gång per dag.
let lastUpdateErrorReport = "";
function updateError(orsak) {
  const idag = new Date().toISOString().slice(0, 10);
  if (lastUpdateErrorReport === idag) return;
  lastUpdateErrorReport = idag;
  report("uppdateringsfel", orsak).catch(() => {});
}
const update = () => updateIfNewer({ repoRoot, agentDir: here, log, onError: updateError });

let child = null;
let startedAt = 0;
let crashes = 0;
let reported = false;
let stopping = false;
let tail = "";

function startChild() {
  try {
    ensurePackages();
  } catch (e) {
    log("kunde inte installera paket:", e?.message ?? e);
  }
  startedAt = Date.now();
  tail = "";
  child = spawn(process.execPath, [HUVUD, "--loop"], { stdio: ["ignore", "pipe", "pipe"] });
  const keep = (stream) => (buf) => {
    stream.write(buf);
    tail = (tail + buf.toString()).slice(-1500);
  };
  child.stdout.on("data", keep(process.stdout));
  child.stderr.on("data", keep(process.stderr));
  child.on("exit", (code, signal) => {
    child = null;
    if (stopping) return;
    const quick = Date.now() - startedAt < QUICK_MS;
    crashes = quick ? crashes + 1 : 0;
    const wait = quick ? Math.min(30, 2 ** (crashes - 1)) * RESTART_BASE_MS : RESTART_BASE_MS;
    log(`huvuddelen avslutades (${code ?? signal}); startar om om ${Math.round(wait / 1000)} s`);
    if (crashes >= 3 && !reported) {
      reported = true;
      report("krasch", tail).catch((e) => log("kunde inte meddela agenten:", e?.message ?? e));
    }
    setTimeout(() => {
      if (!stopping) startChild();
    }, wait);
  });
}

function stopAndExit() {
  if (stopping) return;
  stopping = true;
  if (!child) process.exit(0);
  child.once("exit", () => process.exit(0));
  child.kill("SIGTERM");
  // Huvuddelen avslutar efter pågående körning; vänta högst tio minuter.
  setTimeout(() => {
    child?.kill("SIGKILL");
    process.exit(0);
  }, 10 * 60_000).unref();
}

process.on("SIGTERM", stopAndExit);
process.on("SIGINT", stopAndExit);

log(`startar version ${version()}`);
if (update()) process.exit(0); // launchd startar om med ny kod
startChild();

let lastCheck = Date.now();
setInterval(() => {
  if (stopping || Date.now() - lastCheck < (crashes > 0 ? CHECK_CRASH_MS : CHECK_OK_MS)) return;
  lastCheck = Date.now();
  if (update()) {
    log("ny version hämtad, startar om");
    stopAndExit();
  }
}, TICK_MS);
