import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

function setup(huvud, url) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fb-start-"));
  const dir = path.join(root, "mac/facebook-agent");
  fs.mkdirSync(dir, { recursive: true });
  for (const f of ["agent.mjs", "uppdatera.mjs"]) fs.copyFileSync(path.join(here, "..", f), path.join(dir, f));
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ type: "module", dependencies: {} }));
  fs.writeFileSync(path.join(dir, "huvud.mjs"), huvud);
  fs.writeFileSync(path.join(root, ".env.local"), `KAJSA_AGENT_URL=${url}\nMAC_AGENT_SECRET=hemlis\n`);
  return dir;
}

function server() {
  const posts = [];
  const s = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      posts.push({ path: req.url, auth: req.headers.authorization, body: JSON.parse(body || "{}") });
      res.end("{}");
    });
  });
  return new Promise((r) => s.listen(0, "127.0.0.1", () => r({ s, posts, url: `http://127.0.0.1:${s.address().port}` })));
}

const env = { ...process.env, FB_AGENT_RESTART_BASE_MS: "100", FB_AGENT_QUICK_MS: "5000", FB_AGENT_TICK_MS: "100" };
const until = async (fn, ms = 8000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
};

describe("startdelen", () => {
  it("startar om en huvuddel som kraschar och säger till agenten efter tre krascher", async () => {
    const { s, posts, url } = await server();
    const dir = setup('console.log("huvud startar"); throw new Error("trasig version");', url);
    const p = spawn(process.execPath, [path.join(dir, "agent.mjs")], { env, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (b) => (out += b));
    p.stderr.on("data", (b) => (out += b));
    assert.ok(await until(() => posts.length > 0), `ingen kraschrapport. Utdata:\n${out}`);
    assert.equal(posts[0].path, "/mac/facebook");
    assert.equal(posts[0].auth, "Bearer hemlis");
    assert.equal(posts[0].body.status, "krasch");
    assert.match(posts[0].body.reason, /trasig version/);
    assert.ok((out.match(/huvud startar/g) ?? []).length >= 3);
    p.kill("SIGTERM");
    const code = await new Promise((r) => p.on("exit", r));
    assert.equal(code, 0);
    s.close();
  });

  it("låter huvuddelen avsluta i lugn och ro vid SIGTERM", async () => {
    const { s, url } = await server();
    const dir = setup(
      'console.log("igång"); process.on("SIGTERM", () => { console.log("stoppad"); process.exit(0); }); setInterval(() => {}, 1000);',
      url,
    );
    const p = spawn(process.execPath, [path.join(dir, "agent.mjs")], { env, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (b) => (out += b));
    assert.ok(await until(() => out.includes("igång")));
    p.kill("SIGTERM");
    const code = await new Promise((r) => p.on("exit", r));
    assert.equal(code, 0);
    assert.match(out, /stoppad/);
    s.close();
  });
});
