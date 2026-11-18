// Självuppdatering: hämtar ny version av Facebook-agenten från GitHub (repots main).
// Bara när något i mac/facebook-agent har ändrats, och bara som fast-forward, så att
// lokala ändringar aldrig skrivs över. Paket installeras om de har ändrats.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const UPDATE_EVERY_MINUTES = 30;
const AGENT_PATH = "mac/facebook-agent";

// launchd startar program med en kort PATH (/usr/bin:/bin:/usr/sbin:/sbin). Git från
// Homebrew och hjälpprogram för inloggning (t.ex. gh) ligger utanför den.
const EXTRA_PATH = ["/opt/homebrew/bin", "/usr/local/bin"];

export function findGit() {
  return ["/opt/homebrew/bin/git", "/usr/local/bin/git", "/usr/bin/git"].find((p) => fs.existsSync(p)) ?? "git";
}

/**
 * Sant om koden byttes ut och agenten ska starta om. Misslyckas uppdateringen anropas
 * onError med orsaken (och false returneras).
 */
export function updateIfNewer({ repoRoot, agentDir, log = console.log, gitBin = findGit(), installPackages = true, onError = () => {} }) {
  const env = {
    ...process.env,
    PATH: [...EXTRA_PATH, process.env.PATH ?? "/usr/bin:/bin"].join(":"),
    GIT_TERMINAL_PROMPT: "0", // fastna aldrig på en lösenordsfråga
  };
  const git = (...args) =>
    execFileSync(gitBin, ["-C", repoRoot, ...args], { encoding: "utf8", timeout: 120_000, stdio: ["ignore", "pipe", "pipe"], env }).trim();
  try {
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    if (branch !== "main") {
      log(`uppdaterar inte: repot står på grenen ${branch}, inte main`);
      onError(`repot står på grenen ${branch}, inte main`);
      return false;
    }
    git("fetch", "--quiet", "origin", "main");
    const changed = git("diff", "--name-only", "HEAD", "origin/main", "--", AGENT_PATH);
    if (!changed) return false;
    git("merge", "--ff-only", "--quiet", "origin/main");
    if (installPackages && /(package\.json|pnpm-lock\.yaml)$/m.test(changed)) {
      const npm = path.join(path.dirname(process.execPath), "npm");
      execFileSync(npm, ["install", "--omit=dev", "--no-audit", "--no-fund"], { cwd: agentDir, stdio: "ignore", timeout: 300_000, env });
    }
    log(`ny version hämtad (${changed.split("\n").length} ändrade filer), startar om`);
    return true;
  } catch (e) {
    const orsak = String(e?.stderr || e?.message || e).trim().slice(0, 300);
    log("kunde inte uppdatera:", orsak);
    onError(orsak);
    return false;
  }
}
