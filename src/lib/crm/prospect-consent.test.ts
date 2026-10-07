import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { createTestDb, type TestDB } from "./test-db";
import { properties } from "./schema";
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
  const result = await POST(request({ city: "Linköping", prospektPublished: true }));
  expect(result.status).toBe(201);
  expect(await result.json()).toMatchObject({ prospektPublished: true, published: false, publishConsentAt: null });
  expect((await POST(request({ city: "Linköping", published: true, prospektPublished: true }))).status).toBe(422);
});
