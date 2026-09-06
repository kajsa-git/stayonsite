import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addTracking,
  buildLocalPost,
  resolvePublishingTarget,
  selectPost,
  validateQueue,
  verifyPublicPostResources,
} from "./publish.mjs";
import { buildAuthorizationUrl } from "./authorize.mjs";
import { appendArticleGbpPost, buildArticleGbpPost } from "./article-queue.mjs";

const image = "/images/gbp/gavle-company-housing-kitchen.jpg";

function post(overrides = {}) {
  return {
    id: "campaign-test",
    lane: "campaign",
    publishAfter: "2026-09-01",
    languageCode: "sv-SE",
    summary: "Ett relevant och sakligt inlägg om företagsbostäder.",
    targetPath: "/for-foretag",
    image,
    callToAction: "LEARN_MORE",
    ...overrides,
  };
}

describe("GBP post publisher", () => {
  it("builds a state-protected offline OAuth request", () => {
    const url = new URL(buildAuthorizationUrl({
      clientId: "client-id",
      redirectUri: "http://127.0.0.1:54321/oauth2/callback",
      state: "state-token",
    }));
    assert.equal(url.origin, "https://accounts.google.com");
    assert.equal(url.searchParams.get("scope"), "https://www.googleapis.com/auth/business.manage");
    assert.equal(url.searchParams.get("access_type"), "offline");
    assert.equal(url.searchParams.get("prompt"), "consent");
    assert.equal(url.searchParams.get("include_granted_scopes"), "false");
    assert.equal(url.searchParams.get("state"), "state-token");
  });

  it("adds stable campaign tracking", () => {
    const url = new URL(addTracking("/stad/gavle?ref=city", "campaign-gavle"));
    assert.equal(url.origin, "https://www.stayonsite.se");
    assert.equal(url.searchParams.get("ref"), "city");
    assert.equal(url.searchParams.get("utm_source"), "google");
    assert.equal(url.searchParams.get("utm_medium"), "organic");
    assert.equal(url.searchParams.get("utm_campaign"), "gbp_posts");
    assert.equal(url.searchParams.get("utm_content"), "campaign-gavle");
  });

  it("builds a standard local post with one public image", () => {
    const payload = buildLocalPost(post());
    assert.equal(payload.topicType, "STANDARD");
    assert.equal(payload.callToAction.actionType, "LEARN_MORE");
    assert.deepEqual(payload.media, [
      {
        mediaFormat: "PHOTO",
        sourceUrl: `https://www.stayonsite.se${image}`,
      },
    ]);
  });

  it("does not select a post already present in Google", () => {
    const posts = [post(), post({ id: "campaign-second", publishAfter: "2026-09-02" })];
    const existing = [addTracking("/for-foretag", "campaign-test")];
    assert.equal(selectPost(posts, { today: "2026-09-03", existingUrls: existing })?.id, "campaign-second");
  });

  it("selects only the requested lane", () => {
    const posts = [post(), post({ id: "blog-guide", lane: "article" })];
    assert.equal(selectPost(posts, { lane: "article", today: "2026-09-03" })?.id, "blog-guide");
  });

  it("allows an explicit post to be previewed before its scheduled date", () => {
    const future = post({ id: "campaign-future", publishAfter: "2026-12-01" });
    assert.equal(selectPost([future], { postId: "campaign-future", today: "2026-09-03" })?.id, "campaign-future");
  });

  it("auto-resolves a unique Stay On Site AB publishing target", () => {
    const credentials = {
      clientId: "client-id",
      clientSecret: "client-secret",
      refreshToken: "refresh-token",
      accountId: undefined,
      locationId: undefined,
    };
    const resolved = resolvePublishingTarget([
      {
        account: { name: "accounts/123", accountName: "StayOnSite" },
        locations: [
          { name: "locations/456", title: "Stay On Site AB" },
          { name: "locations/789", title: "Annan profil" },
        ],
      },
    ], credentials);

    assert.equal(resolved.accountId, "accounts/123");
    assert.equal(resolved.locationId, "locations/456");
  });

  it("refuses an ambiguous auto-discovered publishing target", () => {
    const credentials = { accountId: undefined, locationId: undefined };
    assert.throws(
      () => resolvePublishingTarget([
        {
          account: { name: "accounts/123" },
          locations: [
            { name: "locations/456", title: "Stay On Site AB" },
            { name: "locations/789", title: "Stay On Site AB" },
          ],
        },
      ], credentials),
      /Could not uniquely resolve GBP location/,
    );
  });

  it("rejects phone numbers in summaries", () => {
    assert.throws(
      () => validateQueue({ version: 1, posts: [post({ summary: "Ring 076-249 84 86" })] }),
      /Phone numbers are not allowed/,
    );
  });

  it("checks that the landing page and image are publicly deployed", async () => {
    const requests = [];
    const fetchImpl = async (url, options) => {
      requests.push({ url, method: options.method });
      return new Response("", {
        status: 200,
        headers: {
          "content-type": url.endsWith(".jpg") ? "image/jpeg" : "text/html; charset=utf-8",
        },
      });
    };

    await verifyPublicPostResources(post(), fetchImpl);
    assert.deepEqual(requests, [
      {
        url: "https://www.stayonsite.se/for-foretag?utm_source=google&utm_medium=organic&utm_campaign=gbp_posts&utm_content=campaign-test",
        method: "HEAD",
      },
      {
        url: "https://www.stayonsite.se/images/gbp/gavle-company-housing-kitchen.jpg",
        method: "HEAD",
      },
    ]);
  });

  it("refuses to publish when a resource is missing or has the wrong type", async () => {
    await assert.rejects(
      () => verifyPublicPostResources(post(), async () => new Response("", { status: 404 })),
      /Post target page is not public \(404\)/,
    );

    await assert.rejects(
      () => verifyPublicPostResources(post(), async (url) => new Response("", {
        status: 200,
        headers: { "content-type": url.endsWith(".jpg") ? "text/html" : "text/html" },
      })),
      /Post image has unexpected content type/,
    );
  });

  it("builds and validates the GBP entry generated for a new article", () => {
    const articlePost = buildArticleGbpPost({
      slug: "projektboende-ny-guide",
      titleSv: "Projektboende: ny guide",
      descSv: "Saklig vägledning för företag som planerar boende för ett arbetslag.",
      audience: "foretag",
    }, "2026-09-09");

    assert.equal(articlePost.id, "blog-projektboende-ny-guide");
    assert.equal(articlePost.lane, "article");
    assert.equal(articlePost.publishAfter, "2026-09-09");
    assert.equal(articlePost.targetPath, "/blogg/projektboende-ny-guide");
    validateQueue({ version: 1, posts: [articlePost] });
  });

  it("does not add the same generated article post twice", () => {
    const topic = {
      slug: "projektboende-ny-guide",
      titleSv: "Projektboende: ny guide",
      descSv: "Saklig vägledning.",
      audience: "foretag",
    };
    const first = appendArticleGbpPost({ version: 1, posts: [] }, topic, "2026-09-09");
    const second = appendArticleGbpPost(first.queue, topic, "2026-09-09");

    assert.equal(first.added, true);
    assert.equal(second.added, false);
    assert.equal(second.queue.posts.length, 1);
  });
});
