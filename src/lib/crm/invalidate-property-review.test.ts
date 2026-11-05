import { eq } from "drizzle-orm";
import { expect, it } from "vitest";
import { pendingContentReview } from "./invalidate-property-review";
import { properties } from "./schema";
import { createTestDb } from "./test-db";

it("hides changed HUS content until a new human publication decision", async () => {
  const { db, cleanup } = await createTestDb("invalidate-hus");
  try {
    await db.insert(properties).values([
      { id: "hus", published: true, prospektPublished: true, publishConsentSource: "hus", autoPublishEnabled: true },
      { id: "ordinary", published: true, prospektPublished: true, publishConsentSource: "web", autoPublishEnabled: true },
    ]);
    await db.update(properties).set(pendingContentReview());
    const [hus] = await db.select().from(properties).where(eq(properties.id, "hus"));
    const [ordinary] = await db.select().from(properties).where(eq(properties.id, "ordinary"));
    expect(hus).toMatchObject({ published: false, prospektPublished: false, autoPublishEnabled: false, contentReviewStatus: "pending" });
    expect(ordinary).toMatchObject({ published: true, prospektPublished: true, autoPublishEnabled: true, contentReviewStatus: "pending" });
  } finally { cleanup(); }
}, 20_000);
