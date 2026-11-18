import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { updateIfNewer } from "../uppdatera.mjs";

const run = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fb-uppdatera-"));
  const origin = path.join(dir, "origin.git");
  run(dir, "init", "--quiet", "--bare", "-b", "main", origin);
  const dev = path.join(dir, "dev");
  run(dir, "clone", "--quiet", origin, dev);
  for (const c of [["user.name", "test"], ["user.email", "test@example.com"]]) run(dev, "config", ...c);
  fs.mkdirSync(path.join(dev, "mac/facebook-agent"), { recursive: true });
  fs.writeFileSync(path.join(dev, "mac/facebook-agent/agent.mjs"), "// v1\n");
  fs.writeFileSync(path.join(dev, "README.md"), "x\n");
  run(dev, "add", ".");
  run(dev, "commit", "--quiet", "-m", "v1");
  run(dev, "push", "--quiet", "origin", "main");
  const kajsa = path.join(dir, "kajsa");
  run(dir, "clone", "--quiet", origin, kajsa);
  return { dev, kajsa };
}

const tyst = () => {};
const git = "git";

describe("självuppdatering", () => {
  it("gör inget när agentens mapp är oförändrad", () => {
    const { dev, kajsa } = setup();
    fs.writeFileSync(path.join(dev, "README.md"), "y\n");
    run(dev, "commit", "--quiet", "-am", "annat");
    run(dev, "push", "--quiet", "origin", "main");
    assert.equal(updateIfNewer({ repoRoot: kajsa, agentDir: kajsa, log: tyst, gitBin: git, installPackages: false }), false);
  });
  it("hämtar ny version när agenten har ändrats", () => {
    const { dev, kajsa } = setup();
    fs.writeFileSync(path.join(dev, "mac/facebook-agent/agent.mjs"), "// v2\n");
    run(dev, "commit", "--quiet", "-am", "v2");
    run(dev, "push", "--quiet", "origin", "main");
    assert.equal(updateIfNewer({ repoRoot: kajsa, agentDir: kajsa, log: tyst, gitBin: git, installPackages: false }), true);
    assert.equal(fs.readFileSync(path.join(kajsa, "mac/facebook-agent/agent.mjs"), "utf8"), "// v2\n");
    assert.equal(updateIfNewer({ repoRoot: kajsa, agentDir: kajsa, log: tyst, gitBin: git, installPackages: false }), false);
  });
  it("skriver aldrig över lokala ändringar", () => {
    const { dev, kajsa } = setup();
    fs.writeFileSync(path.join(kajsa, "mac/facebook-agent/agent.mjs"), "// lokalt\n");
    fs.writeFileSync(path.join(dev, "mac/facebook-agent/agent.mjs"), "// v2\n");
    run(dev, "commit", "--quiet", "-am", "v2");
    run(dev, "push", "--quiet", "origin", "main");
    assert.equal(updateIfNewer({ repoRoot: kajsa, agentDir: kajsa, log: tyst, gitBin: git, installPackages: false }), false);
    assert.equal(fs.readFileSync(path.join(kajsa, "mac/facebook-agent/agent.mjs"), "utf8"), "// lokalt\n");
  });
});
