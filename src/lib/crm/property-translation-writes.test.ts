import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { createTestDb, type TestDB } from "./test-db";
import { owners, properties } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: vi.fn(async () => ({ user: { email: "test@example.com" } })) }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}), indexOwner: vi.fn(async () => {}) }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
import { POST } from "../../../app/api/crm/properties/route";
import { PATCH } from "../../../app/api/crm/properties/[id]/route";

let cleanup: () => void;
beforeEach(async () => {
  const created = await createTestDb("property-translations"); state.db = created.db; cleanup = created.cleanup;
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ publicDescriptionEn: "New English", publicDescriptionPl: "Nowy polski", skickEn: "", skickPl: "", inclusionsEn: [], inclusionsPl: [] }) }] })));
  await state.db.insert(owners).values({ id: "o1", name: "Original owner" });
  await state.db.insert(properties).values({ id: "p1", ownerId: "o1", address: "Gatan 1", publicDescription: "Gammal text", publicDescriptionEn: "Old English", publicDescriptionPl: "Stary polski" });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const request = (body: unknown, method = "PATCH") => new NextRequest("http://localhost/api/crm/properties", { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
const patch = (body: unknown) => PATCH(request(body), { params: Promise.resolve({ id: "p1" }) });

describe("property translation writes", () => {
  it("persists all languages on creation without publishing or requiring photos", async () => {
    const response = await POST(request({ address: "Gatan 2", postalCode: "123 45", publicDescription: "Möblerad etta" }, "POST"));
    expect(response.status).toBe(201);
    const created = await response.json();
    expect(created).toMatchObject({ publicDescription: "Möblerad etta", publicDescriptionEn: "New English", publicDescriptionPl: "Nowy polski", published: false, prospektPublished: false });
    expect(await state.db.select().from(properties).where(eq(properties.id, created.id))).toHaveLength(1);
  });
  it("replaces both old translations in a full-form update", async () => {
    expect((await patch({ publicDescription: "Ny text", publicDescriptionEn: "Old English", publicDescriptionPl: "Stary polski" })).status).toBe(200);
    const [saved] = await state.db.select().from(properties).where(eq(properties.id, "p1"));
    expect(saved).toMatchObject({ publicDescription: "Ny text", publicDescriptionEn: "New English", publicDescriptionPl: "Nowy polski", published: false, contentReviewStatus: "pending" });
  });
  it("keeps property and owner data intact when translation fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    const response = await patch({ publicDescription: "Ny text", ownerId: "o1", ownerName: "Changed owner" });
    expect(response.status).toBe(502);
    expect(await response.json()).toHaveProperty("error");
    const [saved] = await state.db.select().from(properties).where(eq(properties.id, "p1"));
    expect(saved).toMatchObject({ publicDescription: "Gammal text", publicDescriptionEn: "Old English", publicDescriptionPl: "Stary polski" });
    expect((await state.db.select().from(owners))[0].name).toBe("Original owner");
  });
  it("does not create a partial property on translation failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    expect((await POST(request({ address: "Gatan 2", postalCode: "123 45", publicDescription: "Ny text" }, "POST"))).status).toBe(502);
    expect(await state.db.select().from(properties)).toHaveLength(1);
  });
  it("clears all languages together", async () => {
    expect((await patch({ publicDescription: null })).status).toBe(200);
    expect((await state.db.select().from(properties))[0]).toMatchObject({ publicDescription: null, publicDescriptionEn: null, publicDescriptionPl: null });
    expect(fetch).not.toHaveBeenCalled();
  });
});
