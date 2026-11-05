import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, schedule: vi.fn() }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}) }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: state.schedule }));
vi.mock("./r2", () => ({ R2_BUCKET: "test", r2: { send: vi.fn() } }));
import { PATCH } from "../../../app/api/share/[token]/properties/[id]/images/route";
import { HUS_PUBLICATION_SMS_SOURCE, husPublicationSmsId } from "./hus-publication";
import { outboxMessages, owners, properties, shareLinks } from "./schema";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("hus-finalize"));
  state.schedule.mockReset();
  await state.db.insert(owners).values({ id: "o1", name: "Anna" });
  await state.db.insert(properties).values({ id: "p1", ownerId: "o1", city: "Boden", autoPublishEnabled: false });
  await state.db.insert(shareLinks).values({ id: "l1", token: "token", ownerId: "o1", audience: "landlord" });
  await state.db.insert(outboxMessages).values({ id: husPublicationSmsId("p1"), ownerId: "o1", toPhone: "+46701234567", body: "Väntar", source: HUS_PUBLICATION_SMS_SOURCE, status: "pending_publication" });
});
afterEach(() => cleanup());

function finish(token: string, failed: number) {
  const req = new NextRequest("http://localhost/api", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ created: 0, failed, finalizeHusIntake: true }) });
  return PATCH(req, { params: Promise.resolve({ token, id: "p1" }) });
}

describe("finish HUS intake", () => {
  it("schedules the complete upload set for review but keeps publication manual", async () => {
    expect((await finish("token", 0)).status).toBe(200);
    const [p] = await state.db.select().from(properties).where(eq(properties.id, "p1"));
    expect(p).toMatchObject({ autoPublishEnabled: false, published: false, contentReviewStatus: "pending" });
    expect(state.schedule).toHaveBeenCalledWith("p1");
  });
  it("pauses automatic publication after a failed upload", async () => {
    expect((await finish("token", 1)).status).toBe(200);
    const [p] = await state.db.select().from(properties).where(eq(properties.id, "p1"));
    expect(p.autoPublishEnabled).toBe(false);
  });
  it("does not permit finalization with the wrong token", async () => {
    expect((await finish("wrong", 0)).status).toBe(404);
    expect(state.schedule).not.toHaveBeenCalled();
  });
});
