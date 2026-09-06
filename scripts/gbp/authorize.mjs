#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const DEFAULT_CLIENT_PATH = resolve(homedir(), ".config/stayonsite/gbp-oauth-client.json");
const DEFAULT_TOKEN_PATH = resolve(homedir(), ".config/stayonsite/gbp-oauth-token.json");
const AUTH_TIMEOUT_MS = 10 * 60 * 1000;

function fail(message) {
  throw new Error(message);
}

export function readOAuthClient(path = process.env.GBP_OAUTH_CLIENT_FILE || DEFAULT_CLIENT_PATH) {
  if (!existsSync(path)) fail(`OAuth client file not found: ${path}`);
  const document = JSON.parse(readFileSync(path, "utf8"));
  const client = document.installed ?? document.web;
  if (!client?.client_id || !client?.client_secret) fail(`Invalid OAuth client file: ${path}`);
  return { clientId: client.client_id, clientSecret: client.client_secret };
}

export function buildAuthorizationUrl({ clientId, redirectUri, state }) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    // This Cloud project already has unrelated Ads/Search Console grants.
    // Keep the GBP refresh token least-privileged instead of merging those
    // previously granted scopes into this authorization.
    include_granted_scopes: "false",
    login_hint: "kajsa@stayonsite.se",
    state,
  }).toString();
  return url.toString();
}

async function exchangeCode({ code, clientId, clientSecret, redirectUri }) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = await response.json();
  if (!response.ok) fail(`OAuth token exchange failed (${response.status}): ${data.error_description ?? data.error}`);
  if (!data.refresh_token) fail("Google returned no refresh token. Run authorization again and approve consent.");
  return data;
}

async function main() {
  const client = readOAuthClient();
  const tokenPath = process.env.GBP_OAUTH_TOKEN_FILE || DEFAULT_TOKEN_PATH;
  const state = randomBytes(24).toString("hex");
  let redirectUri = "";
  let finish;

  const completed = new Promise((resolvePromise, rejectPromise) => {
    finish = { resolve: resolvePromise, reject: rejectPromise };
  });

  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
    if (requestUrl.pathname !== "/oauth2/callback") {
      response.writeHead(404).end("Not found");
      return;
    }

    try {
      if (requestUrl.searchParams.get("state") !== state) fail("OAuth state did not match");
      const oauthError = requestUrl.searchParams.get("error");
      if (oauthError) fail(`Google authorization failed: ${oauthError}`);
      const code = requestUrl.searchParams.get("code");
      if (!code) fail("Google returned no authorization code");

      const token = await exchangeCode({ code, ...client, redirectUri });
      mkdirSync(dirname(tokenPath), { recursive: true });
      writeFileSync(tokenPath, `${JSON.stringify({
        refresh_token: token.refresh_token,
        scope: token.scope ?? SCOPE,
        created_at: new Date().toISOString(),
      }, null, 2)}\n`, { mode: 0o600 });
      chmodSync(tokenPath, 0o600);

      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end("<h1>StayOnSite GBP är auktoriserad</h1><p>Du kan stänga den här fliken.</p>");
      console.log(`[gbp] Refresh token saved securely to ${tokenPath}`);
      finish.resolve();
    } catch (error) {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end("Auktoriseringen misslyckades. Gå tillbaka till Codex.");
      finish.reject(error);
    }
  });

  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    if (!address || typeof address === "string") {
      finish.reject(new Error("Could not start the local OAuth callback"));
      return;
    }
    redirectUri = `http://127.0.0.1:${address.port}/oauth2/callback`;
    console.log("[gbp] Open this authorization URL:");
    console.log(buildAuthorizationUrl({ clientId: client.clientId, redirectUri, state }));
  });

  const timeout = setTimeout(() => finish.reject(new Error("OAuth authorization timed out after 10 minutes")), AUTH_TIMEOUT_MS);
  try {
    await completed;
  } finally {
    clearTimeout(timeout);
    server.closeAllConnections();
    server.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[gbp] ${error.message}`);
    process.exitCode = 1;
  });
}
