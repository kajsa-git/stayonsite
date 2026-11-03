import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { UTHYRNINGSUPPDRAG } from "./avtal";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ db: null as unknown as LibSQLDatabase<typeof schema> }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}) }));
import { authorizeLandlordProperty, loadLandlordProperties } from "./landlord-properties";
import { PATCH } from "../../../app/api/share/[token]/properties/[id]/route";
import { GET as imagesGET } from "../../../app/api/share/[token]/properties/[id]/images/route";
import { landlordPropertyInput } from "./landlord-property-input";
import { createTestDb } from "./test-db";
import { addDaysYmd, todayStockholm } from "./date";
let cleanup: () => void;

beforeEach(async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ publicDescriptionEn: "New description", publicDescriptionPl: "Nowy opis", skickEn: "", skickPl: "", inclusionsEn: [], inclusionsPl: [] }) }] })));
  const testDb = await createTestDb("landlord-properties");
  state.db = testDb.db;
  cleanup = testDb.cleanup;
  await state.db.insert(schema.owners).values([{ id: "o1", name: "Anna" }, { id: "o2", name: "Bo" }]);
  await state.db.insert(schema.properties).values([
    { id: "p1", ownerId: "o1", address: "Gatan 1", rentIn: 5000, rentOut: 9000, notes: "secret", publicDescription: "Original" },
    { id: "p2", ownerId: "o2", address: "Gatan 2" },
    { id: "p3", ownerId: "o1", address: "Gatan 3" },
  ]);
  await state.db.insert(schema.agreementAcceptances).values({ id: "a1", ownerId: "o1", agreementType: UTHYRNINGSUPPDRAG.type,
    version: UTHYRNINGSUPPDRAG.version, acceptedName: "Anna", acceptedAt: new Date().toISOString() });
  await state.db.insert(schema.shareLinks).values([
    { id: "l1", token: "owner-token", audience: "landlord", ownerId: "o1" },
    { id: "l2", token: "unsigned-token", audience: "landlord", ownerId: "o2" },
    { id: "l3", token: "revoked-token", audience: "landlord", ownerId: "o1", revokedAt: new Date().toISOString() },
    { id: "l4", token: "expired-token", audience: "landlord", ownerId: "o1", expiresAt: "2000-01-01T00:00:00Z" },
    { id: "l5", token: "tenant-token", audience: "tenant", ownerId: "o1" },
  ]);
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

async function patch(body: unknown, token = "owner-token", id = "p1") {
  return PATCH(new NextRequest("http://localhost/api/share/test", {
    method: "PATCH", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
  }), { params: Promise.resolve({ token, id }) });
}

describe("uthyrarens bostäder", () => {
  it.each(["2026-07-13.7", "2026-07-16.8"])("låter en uthyrare med giltig tidigare version %s fortsätta uppdatera sin bostad", async (version) => {
    await state.db.update(schema.agreementAcceptances).set({ version }).where(eq(schema.agreementAcceptances.id, "a1"));
    expect((await patch({ beds: 5 })).status).toBe(200);
    const [acceptance] = await state.db.select().from(schema.agreementAcceptances).where(eq(schema.agreementAcceptances.id, "a1"));
    expect(acceptance.version).toBe(version);
  });

  it("läser enbart egna bostäder utan interna fält", async () => {
    const [link] = await state.db.select().from(schema.shareLinks).where(eq(schema.shareLinks.id, "l1"));
    const rows = await loadLandlordProperties(link);
    expect(rows.map((r) => r.id)).toEqual(["p1", "p3"]);
    expect(JSON.stringify(rows)).not.toMatch(/rentOut|notes|secret|ownerId/);
  });
  it("sparar på befintlig bostad och bevarar interna fält", async () => {
    expect((await patch({ rentIn: 6000, beds: 4, publicDescription: "Ny text" })).status).toBe(200);
    const rows = await state.db.select().from(schema.properties);
    expect(rows).toHaveLength(3);
    expect(rows.find((r) => r.id === "p1")).toMatchObject({ rentIn: 6000, rentOut: 9000, notes: "secret", publicDescription: "Ny text", publicDescriptionEn: "New description", publicDescriptionPl: "Nowy opis" });
  });
  it("uppdaterar kontrollen när uthyraren anger ett nytt ledigdatum för en uthyrd bostad", async () => {
    const today = todayStockholm();
    const date = addDaysYmd(today, 120);
    await state.db.update(schema.properties).set({ status: "rented" }).where(eq(schema.properties.id, "p1"));
    await state.db.insert(schema.rentalReviews).values({ propertyId: "p1", rentedSince: today, checkOn: addDaysYmd(today, 60), source: "two_months" });
    expect((await patch({ moveInFrom: date })).status).toBe(200);
    expect((await state.db.select().from(schema.rentalReviews))[0]).toMatchObject({ checkOn: date, source: "specified" });
    expect((await state.db.select().from(schema.properties).where(eq(schema.properties.id, "p1")))[0].status).toBe("rented");
  });
  it.each(["unknown", "revoked-token", "expired-token", "tenant-token", "unsigned-token"])("avvisar %s", async (token) => {
    expect((await patch({ beds: 3 }, token)).status).toBe(404);
  });
  it("avvisar en annan ägares bostad även för bildläsning", async () => {
    expect((await patch({ beds: 3 }, "owner-token", "p2")).status).toBe(404);
    const response = await imagesGET(new NextRequest("http://localhost/test"), { params: Promise.resolve({ token: "owner-token", id: "p2" }) });
    expect(response.status).toBe(404);
  });
  it("tillåter fortfarande registreringens bilduppladdning före signering", async () => {
    expect(await authorizeLandlordProperty("unsigned-token", "p2", false)).not.toBeNull();
    expect(await authorizeLandlordProperty("unsigned-token", "p2")).toBeNull();
  });
  it.each([{ rentOut: 1 }, { ownerId: "o2" }, { published: true }, { notes: "x" }, { beds: -1 }, { beds: 2.5 }, { moveInFrom: "2026-02-30" }])("avvisar otillåtna uppgifter %j", async (body) => {
    expect((await patch(body)).status).toBe(400);
  });
  it("validerar datum även mot befintliga uppgifter vid partiell uppdatering", async () => {
    await state.db.update(schema.properties).set({ moveInFrom: "2026-10-10" }).where(eq(schema.properties.id, "p1"));
    expect((await patch({ availableTo: "2026-10-01" })).status).toBe(400);
    expect((await patch({ availableTo: "2026-11-01" })).status).toBe(200);
  });
  it("begränsar affärslänk till en bostad och stänger avslutade ärenden", async () => {
    await state.db.insert(schema.companies).values({ id: "c1", name: "Company" });
    await state.db.insert(schema.requests).values({ id: "r1", companyId: "c1", status: "matching" });
    await state.db.insert(schema.matches).values({ id: "m1", requestId: "r1", propertyId: "p1", promisedRentIn: 4500 });
    await state.db.insert(schema.shareLinks).values({ id: "lm", token: "match-token", audience: "landlord", requestId: "r1", matchId: "m1" });
    expect((await patch({ rentIn: 7000 }, "match-token")).status).toBe(200);
    expect((await patch({ beds: 3 }, "match-token", "p3")).status).toBe(404);
    const [match] = await state.db.select().from(schema.matches);
    expect(match.promisedRentIn).toBe(4500);
    await state.db.update(schema.requests).set({ status: "archived" }).where(eq(schema.requests.id, "r1"));
    expect((await patch({ beds: 3 }, "match-token")).status).toBe(404);
  });
  it("tomma fält kan rensas men ogiltiga typer avvisas", () => {
    expect(landlordPropertyInput.safeParse({ rentIn: null, moveInFrom: null }).success).toBe(true);
    expect(landlordPropertyInput.safeParse({ rentIn: "" }).success).toBe(false);
  });
});
