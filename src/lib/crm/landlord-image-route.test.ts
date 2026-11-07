import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { landlordImageCandidates, owners, properties, propertyImages } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, authorized: true }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: async () => state.authorized ? { user: { id: "test" } } : null }));
vi.mock("./r2", () => ({ r2: {}, R2_BUCKET: "test" }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
import { POST } from "../../../app/api/crm/properties/[id]/landlord-images/route";
import { schedulePropertyReview } from "./schedule-property-review";

let cleanup: () => void;
function request(body: object) { return new NextRequest("https://example.test/api/crm/properties/p/landlord-images", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
const params = { params: Promise.resolve({ id: "p" }) };
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-image-route")); state.authorized = true; vi.clearAllMocks();
  await state.db.insert(owners).values({ id: "owner", name: "Anna" });
  await state.db.insert(properties).values({ id: "p", ownerId: "owner" });
  await state.db.insert(landlordImageCandidates).values({ id: "image", propertyId: "p", gmailMessageId: "m", replyRunId: "m", attachmentId: "a", fileName: "rum.jpg", mimeType: "image/jpeg", sizeBytes: 10000, status: "needs_review", objectKey: "properties/p/landlord-candidates/image.jpg", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
});
afterEach(() => cleanup());

describe("manually reviewed landlord image", () => {
  it("requires an approved session and explicit acknowledgement of the publication impact", async () => {
    state.authorized = false;
    expect((await POST(request({ candidateId: "image", acceptedPublicImpact: true }), params)).status).toBe(401);
    state.authorized = true;
    expect((await POST(request({ candidateId: "image" }), params)).status).toBe(400);
    expect(await state.db.select().from(propertyImages)).toHaveLength(0);
  });
  it("adds a private candidate only once and starts a fresh content review", async () => {
    expect((await POST(request({ candidateId: "image", acceptedPublicImpact: true }), params)).status).toBe(200);
    expect((await POST(request({ candidateId: "image", acceptedPublicImpact: true }), params)).status).toBe(409);
    expect((await state.db.select().from(propertyImages))[0]).toMatchObject({ propertyId: "p", isPrimary: true });
    expect((await state.db.select().from(landlordImageCandidates))[0].status).toBe("imported");
    expect(schedulePropertyReview).toHaveBeenCalledWith("p");
  });
});
