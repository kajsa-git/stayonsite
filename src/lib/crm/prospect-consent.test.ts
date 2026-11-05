import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { createTestDb, type TestDB } from "./test-db";
import { outboxMessages, properties, propertyImages } from "./schema";
import { propertyContentHash } from "./property-content-policy";
import { HUS_PUBLICATION_SMS_SOURCE, husPublicationSmsId } from "./hus-publication";
const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: vi.fn(async () => ({ user: { id: "test" } })) }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}), indexOwner: vi.fn(async () => {}), removeFromIndex: vi.fn(async () => {}) }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
vi.mock("./r2", () => ({ R2_BUCKET: "test", r2: {} }));
import { PATCH } from "../../../app/api/crm/properties/[id]/route";
import { POST } from "../../../app/api/crm/properties/route";
let cleanup: () => void;
beforeEach(async () => {
  const test = await createTestDb("prospect-consent"); state.db = test.db; cleanup = test.cleanup;
  await state.db.insert(properties).values({ id: "p1", city: "Linköping", status: "off_market", published: false, contentReviewStatus: "approved" });
});
afterEach(() => cleanup());
function request(body: object) {
  return new NextRequest("http://localhost/api/crm/properties/p1", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
}
it("activates and deactivates a prospect without consent, preserving website and market status", async () => {
  const result = await PATCH(request({ prospektPublished: true }), { params: Promise.resolve({ id: "p1" }) });
  expect(result.status).toBe(200);
  expect(await result.json()).toMatchObject({ prospektPublished: true, published: false, publishConsentAt: null, status: "off_market" });
  expect((await PATCH(request({ prospektPublished: false }), { params: Promise.resolve({ id: "p1" }) })).status).toBe(200);
  expect((await state.db.select().from(properties).where(eq(properties.id, "p1")))[0].prospektPublished).toBe(false);
});
it("still rejects website publication including combined requests without consent", async () => {
  for (const body of [{ published: true }, { published: true, prospektPublished: true }]) {
    expect((await PATCH(request(body), { params: Promise.resolve({ id: "p1" }) })).status).toBe(422);
  }
});
it("allows a new prospect without consent but rejects a new website listing", async () => {
  const result = await POST(request({ city: "Linköping", postalCode: "582 22", prospektPublished: true }));
  expect(result.status).toBe(201);
  expect(await result.json()).toMatchObject({ prospektPublished: true, published: false, publishConsentAt: null });
  expect((await POST(request({ city: "Linköping", postalCode: "582 22", published: true, prospektPublished: true }))).status).toBe(422);
});
it("pauses an unsent HUS link when the listing is unpublished", async () => {
  await state.db.update(properties).set({ published: true, publishConsentAt: "2026-11-02" }).where(eq(properties.id, "p1"));
  await state.db.insert(outboxMessages).values({
    id: husPublicationSmsId("p1"), toPhone: "+46701234567", body: "En länk",
    source: HUS_PUBLICATION_SMS_SOURCE, status: "queued",
  });
  const result = await PATCH(request({ published: false }), { params: Promise.resolve({ id: "p1" }) });
  expect(result.status).toBe(200);
  expect((await state.db.select().from(outboxMessages))[0]).toMatchObject({ status: "pending_publication" });
});
it("publishes a reviewed HUS property only on a manual action and queues one short SMS", async () => {
  const images = [{ id: "im1", key: "one.jpg" }];
  await state.db.insert(propertyImages).values({ ...images[0], propertyId: "p1" });
  await state.db.update(properties).set({
    publishConsentAt: "2026-11-02", publishConsentSource: "hus", slug: "boende-linkoping", status: "available",
    publicDescription: "En möblerad bostad med eget kök, badrum och flera rum för personal i centrala Linköping.",
  }).where(eq(properties.id, "p1"));
  const [initial] = await state.db.select().from(properties).where(eq(properties.id, "p1"));
  await state.db.update(properties).set({ contentReviewHash: propertyContentHash(initial, images) }).where(eq(properties.id, "p1"));
  await state.db.insert(outboxMessages).values({ id: husPublicationSmsId("p1"), toPhone: "+46701234567", body: "Väntar", source: HUS_PUBLICATION_SMS_SOURCE, status: "pending_publication" });
  const response = await PATCH(request({ published: true }), { params: Promise.resolve({ id: "p1" }) });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ published: true, autoPublishEnabled: false });
  const [message] = await state.db.select().from(outboxMessages);
  expect(message).toMatchObject({ status: "queued" });
  expect(message.body).toContain("www.stayonsite.se/boenden/p1");
  expect(message.body.length).toBeLessThanOrEqual(160);
  expect((await state.db.select().from(outboxMessages))).toHaveLength(1);
  const edited = await PATCH(request({ bedrooms: 5 }), { params: Promise.resolve({ id: "p1" }) });
  expect(edited.status).toBe(200);
  expect(await edited.json()).toMatchObject({ published: false, autoPublishEnabled: false });
  expect((await state.db.select().from(outboxMessages))[0].status).toBe("pending_publication");
});
it("refuses a HUS publication if the current pictures or description have not passed review", async () => {
  await state.db.update(properties).set({ publishConsentAt: "2026-11-02", publishConsentSource: "hus", contentReviewStatus: "needs_review" }).where(eq(properties.id, "p1"));
  const response = await PATCH(request({ published: true }), { params: Promise.resolve({ id: "p1" }) });
  expect(response.status).toBe(422);
  expect((await state.db.select().from(properties).where(eq(properties.id, "p1")))[0].published).toBe(false);
});
