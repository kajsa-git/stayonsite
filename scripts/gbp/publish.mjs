#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "../..");
const DEFAULT_QUEUE_PATH = resolve(ROOT, "content/gbp/posts.json");
const DEFAULT_OAUTH_CLIENT_PATH = resolve(homedir(), ".config/stayonsite/gbp-oauth-client.json");
const DEFAULT_OAUTH_TOKEN_PATH = resolve(homedir(), ".config/stayonsite/gbp-oauth-token.json");
const SITE_URL = "https://www.stayonsite.se";
const API_ORIGIN = "https://mybusiness.googleapis.com";

const VALID_LANES = new Set(["campaign", "article"]);
const VALID_CTAS = new Set(["BOOK", "ORDER", "SHOP", "LEARN_MORE", "SIGN_UP", "CALL"]);

function fail(message) {
  throw new Error(message);
}

export function parseArgs(argv) {
  const args = { dryRun: false, discover: false, validate: false, lane: null, postId: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") continue;
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--discover") args.discover = true;
    else if (arg === "--validate") args.validate = true;
    else if (arg === "--lane") args.lane = argv[++i] ?? fail("--lane requires a value");
    else if (arg === "--post-id") args.postId = argv[++i] ?? fail("--post-id requires a value");
    else fail(`Unknown argument: ${arg}`);
  }
  if (args.lane && !VALID_LANES.has(args.lane)) fail(`Unknown lane: ${args.lane}`);
  return args;
}

export function readQueue(queuePath = DEFAULT_QUEUE_PATH) {
  const queue = JSON.parse(readFileSync(queuePath, "utf8"));
  if (queue.version !== 1 || !Array.isArray(queue.posts)) fail("Invalid GBP queue format");
  return queue;
}

export function addTracking(targetPath, postId) {
  const target = new URL(targetPath, SITE_URL);
  if (target.origin !== SITE_URL) fail(`GBP target must stay on ${SITE_URL}`);
  target.searchParams.set("utm_source", "google");
  target.searchParams.set("utm_medium", "organic");
  target.searchParams.set("utm_campaign", "gbp_posts");
  target.searchParams.set("utm_content", postId);
  return target.toString();
}

export function validatePost(post) {
  const required = ["id", "lane", "publishAfter", "languageCode", "summary", "targetPath", "image", "callToAction"];
  for (const key of required) {
    if (typeof post[key] !== "string" || !post[key].trim()) fail(`Post is missing ${key}`);
  }
  if (!/^[a-z0-9-]+$/.test(post.id)) fail(`Invalid post id: ${post.id}`);
  if (!VALID_LANES.has(post.lane)) fail(`Invalid lane for ${post.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishAfter)) fail(`Invalid publishAfter for ${post.id}`);
  if (post.summary.length > 1500) fail(`Summary exceeds 1500 characters for ${post.id}`);
  if (/\b(?:\+?46|0)\s?\d(?:[\s-]?\d){6,}\b/.test(post.summary)) {
    fail(`Phone numbers are not allowed in GBP post summaries (${post.id})`);
  }
  if (!VALID_CTAS.has(post.callToAction)) fail(`Invalid callToAction for ${post.id}`);
  if (!post.targetPath.startsWith("/")) fail(`targetPath must be relative for ${post.id}`);
  if (!post.image.startsWith("/images/gbp/") || !post.image.endsWith(".jpg")) {
    fail(`Image must be a curated GBP JPG for ${post.id}`);
  }
  const localImage = resolve(ROOT, `public${post.image}`);
  if (!existsSync(localImage)) fail(`Missing image for ${post.id}: ${post.image}`);
  return post;
}

export function validateQueue(queue) {
  const ids = new Set();
  for (const post of queue.posts) {
    validatePost(post);
    if (ids.has(post.id)) fail(`Duplicate post id: ${post.id}`);
    ids.add(post.id);
  }
  return queue;
}

export function buildPostUrl(post) {
  return addTracking(post.targetPath, post.id);
}

export function buildLocalPost(post) {
  validatePost(post);
  return {
    languageCode: post.languageCode,
    summary: post.summary,
    topicType: "STANDARD",
    callToAction: {
      actionType: post.callToAction,
      url: buildPostUrl(post),
    },
    media: [
      {
        mediaFormat: "PHOTO",
        sourceUrl: new URL(post.image, SITE_URL).toString(),
      },
    ],
  };
}

async function assertPublicResource(url, { label, contentTypePrefix, fetchImpl = fetch }) {
  let response = await fetchImpl(url, { method: "HEAD", redirect: "follow" });
  if (response.status === 405 || response.status === 501) {
    response = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      headers: { range: "bytes=0-0" },
    });
  }
  if (!response.ok) fail(`${label} is not public (${response.status}): ${url}`);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith(contentTypePrefix)) {
    fail(`${label} has unexpected content type (${contentType || "missing"}): ${url}`);
  }
}

export async function verifyPublicPostResources(post, fetchImpl = fetch) {
  const payload = buildLocalPost(post);
  await assertPublicResource(payload.callToAction.url, {
    label: "Post target page",
    contentTypePrefix: "text/html",
    fetchImpl,
  });
  await assertPublicResource(payload.media[0].sourceUrl, {
    label: "Post image",
    contentTypePrefix: "image/jpeg",
    fetchImpl,
  });
  return payload;
}

export function selectPost(posts, { lane = null, postId = null, today, existingUrls = [] }) {
  const publishedIds = new Set();
  for (const value of existingUrls) {
    try {
      const id = new URL(value).searchParams.get("utm_content");
      if (id) publishedIds.add(id);
    } catch {
      // Ignore malformed historic URLs returned by Google.
    }
  }

  return [...posts]
    .filter((post) => (!postId || post.id === postId))
    .filter((post) => (!lane || post.lane === lane))
    .filter((post) => Boolean(postId) || post.publishAfter <= today)
    .filter((post) => !publishedIds.has(post.id))
    .sort((a, b) => a.publishAfter.localeCompare(b.publishAfter) || a.id.localeCompare(b.id))[0] ?? null;
}

function credentialsFromEnv() {
  const clientPath = process.env.GBP_OAUTH_CLIENT_FILE || DEFAULT_OAUTH_CLIENT_PATH;
  const tokenPath = process.env.GBP_OAUTH_TOKEN_FILE || DEFAULT_OAUTH_TOKEN_PATH;
  const clientDocument = existsSync(clientPath) ? JSON.parse(readFileSync(clientPath, "utf8")) : {};
  const localClient = clientDocument.installed ?? clientDocument.web ?? {};
  const localToken = existsSync(tokenPath) ? JSON.parse(readFileSync(tokenPath, "utf8")) : {};
  const credentials = {
    clientId: process.env.GBP_CLIENT_ID || localClient.client_id,
    clientSecret: process.env.GBP_CLIENT_SECRET || localClient.client_secret,
    refreshToken: process.env.GBP_REFRESH_TOKEN || localToken.refresh_token,
    accountId: process.env.GBP_ACCOUNT_ID,
    locationId: process.env.GBP_LOCATION_ID,
  };
  for (const [key, value] of Object.entries(credentials)) {
    if (!value && key !== "accountId" && key !== "locationId") fail(`Missing GBP credential: ${key}`);
  }
  return credentials;
}

async function responseJson(response, label) {
  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw: raw.slice(0, 500) };
  }
  if (!response.ok) {
    const detail = data?.error?.message ?? data?.error_description ?? data?.raw ?? response.statusText;
    fail(`${label} failed (${response.status}): ${String(detail).slice(0, 500)}`);
  }
  return data;
}

export async function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await responseJson(response, "OAuth refresh");
  if (!data.access_token) fail("OAuth refresh returned no access token");
  return data.access_token;
}

async function authedGet(url, accessToken, label) {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      "x-goog-api-format-version": "2",
    },
  });
  return responseJson(response, label);
}

export async function discoverLocations(accessToken) {
  const accountData = await authedGet(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    accessToken,
    "Account discovery",
  );
  const result = [];
  for (const account of accountData.accounts ?? []) {
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`);
    url.searchParams.set("readMask", "name,title,storeCode,websiteUri,metadata");
    url.searchParams.set("pageSize", "100");
    const locations = await authedGet(url, accessToken, `Location discovery for ${account.name}`);
    result.push({ account: { name: account.name, accountName: account.accountName }, locations: locations.locations ?? [] });
  }
  return result;
}

function normalizeResourceId(value, prefixPattern) {
  return value ? value.replace(prefixPattern, "") : null;
}

export function resolvePublishingTarget(discovery, credentials, expectedTitle = "Stay On Site AB") {
  if (credentials.accountId && credentials.locationId) return credentials;

  const expected = expectedTitle.trim().toLocaleLowerCase("sv-SE");
  const configuredAccount = normalizeResourceId(credentials.accountId, /^accounts\//);
  const configuredLocation = normalizeResourceId(
    credentials.locationId,
    /^(?:accounts\/[^/]+\/)?locations\//,
  );

  const matches = discovery.flatMap(({ account, locations }) => locations.map((location) => ({ account, location })))
    .filter(({ account }) => {
      const discoveredAccount = normalizeResourceId(account.name, /^accounts\//);
      return !configuredAccount || configuredAccount === discoveredAccount;
    })
    .filter(({ location }) => {
      const discoveredLocation = normalizeResourceId(
        location.name,
        /^(?:accounts\/[^/]+\/)?locations\//,
      );
      return !configuredLocation || configuredLocation === discoveredLocation;
    })
    .filter(({ location }) => location.title?.trim().toLocaleLowerCase("sv-SE") === expected);

  if (matches.length !== 1) {
    const available = discovery.flatMap(({ account, locations }) => locations.map((location) => (
      `${location.title ?? "Namnlös profil"} (${account.name}/${location.name})`
    )));
    fail(
      `Could not uniquely resolve GBP location titled "${expectedTitle}". `
      + `Found ${matches.length} matches. Available: ${available.join(", ") || "none"}. `
      + "Set GBP_ACCOUNT_ID and GBP_LOCATION_ID explicitly if needed.",
    );
  }

  return {
    ...credentials,
    accountId: matches[0].account.name,
    locationId: matches[0].location.name,
  };
}

async function ensurePublishingTarget(accessToken, credentials) {
  if (credentials.accountId && credentials.locationId) return credentials;
  const discovery = await discoverLocations(accessToken);
  return resolvePublishingTarget(
    discovery,
    credentials,
    process.env.GBP_LOCATION_TITLE || "Stay On Site AB",
  );
}

function locationParent({ accountId, locationId }) {
  if (!accountId) fail("Missing GBP_ACCOUNT_ID");
  if (!locationId) fail("Missing GBP_LOCATION_ID");
  const account = accountId.replace(/^accounts\//, "");
  const location = locationId.replace(/^accounts\/[^/]+\/locations\//, "").replace(/^locations\//, "");
  return `accounts/${account}/locations/${location}`;
}

export async function listLocalPostUrls(accessToken, credentials) {
  const parent = locationParent(credentials);
  const urls = [];
  let pageToken = "";
  do {
    const url = new URL(`${API_ORIGIN}/v4/${parent}/localPosts`);
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const data = await authedGet(url, accessToken, "List GBP posts");
    for (const post of data.localPosts ?? []) {
      if (post.callToAction?.url) urls.push(post.callToAction.url);
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return urls;
}

export async function createLocalPost(accessToken, credentials, post) {
  const parent = locationParent(credentials);
  // A GitHub workflow can start before a fresh Vercel deployment is globally
  // available. Never send Google a post whose landing page or photo is still a
  // 404 (or served with the wrong content type).
  const payload = await verifyPublicPostResources(post);

  const response = await fetch(`${API_ORIGIN}/v4/${parent}/localPosts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "x-goog-api-format-version": "2",
    },
    body: JSON.stringify(payload),
  });
  return responseJson(response, `Publish ${post.id}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const queue = validateQueue(readQueue());

  if (args.validate) {
    console.log(`[gbp] Validated ${queue.posts.length} posts and their local images.`);
    return;
  }

  if (args.discover) {
    const credentials = credentialsFromEnv();
    const accessToken = await refreshAccessToken(credentials);
    const locations = await discoverLocations(accessToken);
    console.log(JSON.stringify(locations, null, 2));
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  let existingUrls = [];
  let credentials = null;
  let accessToken = null;

  if (!args.dryRun) {
    if (process.env.GBP_PUBLISH_ENABLED !== "true") {
      fail("Live publishing is disabled. Set GBP_PUBLISH_ENABLED=true after API access and a successful dry run.");
    }
    credentials = credentialsFromEnv();
    accessToken = await refreshAccessToken(credentials);
    credentials = await ensurePublishingTarget(accessToken, credentials);
    existingUrls = await listLocalPostUrls(accessToken, credentials);
  }

  const post = selectPost(queue.posts, {
    lane: args.lane,
    postId: args.postId,
    today,
    existingUrls,
  });

  if (!post) {
    console.log(`[gbp] No unpublished due post${args.lane ? ` in lane ${args.lane}` : ""}.`);
    return;
  }

  const payload = args.dryRun
    ? await verifyPublicPostResources(post)
    : buildLocalPost(post);
  if (args.dryRun) {
    console.log(JSON.stringify({ mode: "dry-run", postId: post.id, payload }, null, 2));
    return;
  }

  const created = await createLocalPost(accessToken, credentials, post);
  console.log(JSON.stringify({
    mode: "published",
    postId: post.id,
    name: created.name,
    state: created.state,
    searchUrl: created.searchUrl,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[gbp] ${error.message}`);
    process.exitCode = 1;
  });
}
