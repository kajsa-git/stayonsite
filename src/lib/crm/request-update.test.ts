import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyRequestUpdate } from "./request-update";
import { companies, matches, properties, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

// Stubbar för sidoeffekterna (sökindex/share-links går mot produktions-db annars).
const noopEffects = {
  indexRequest: async () => {},
  indexProperty: async () => {},
  revokeLinksForRequest: async () => {},
};

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-requpdate"));
  await db.insert(companies).values([{ id: "c1", name: "Acme Bygg" }]);
  await db.insert(properties).values([{ id: "p1", address: "Gatan 1", city: "Boden", status: "available" }]);
  await db.insert(requests).values([
    { id: "r1", companyId: "c1", status: "matching", wonPropertyId: "p1" },
    { id: "r2", companyId: "c1", status: "matching" },
  ]);
  await db.insert(matches).values([
    { id: "m1", requestId: "r1", propertyId: "p1", status: "sent" },
    { id: "m2", requestId: "r2", propertyId: "p1", status: "suggested" }, // annan förfrågan, samma objekt
  ]);
});

afterEach(() => cleanup());

describe("applyRequestUpdate", () => {
  it("nekar ogiltig status", async () => {
    const r = await applyRequestUpdate("r1", { status: "påhittad" }, { db, ...noopEffects });
    expect(r).toEqual({ ok: false, status: 400, body: { error: "Invalid status" } });
  });

  it("404 för okänd förfrågan", async () => {
    const r = await applyRequestUpdate("finns-ej", { status: "won" }, { db, ...noopEffects });
    expect(r).toEqual({ ok: false, status: 404, body: { error: "Not found" } });
  });

  it("fakturering kräver datum (missing_dates)", async () => {
    const r = await applyRequestUpdate("r1", { status: "invoiced" }, { db, ...noopEffects });
    expect(r.ok).toBe(false);
    if (r.ok === false) expect(r.body.error).toBe("missing_dates");
  });

  it("fakturering kräver signerat avtal", async () => {
    const r = await applyRequestUpdate(
      "r1",
      { status: "invoiced", startDate: "2026-07-01", endDate: "2026-07-31" },
      { db, ...noopEffects },
    );
    expect(r.ok).toBe(false);
    if (r.ok === false) expect(r.body.error).toBe("missing_contract");
  });

  it("fakturering går igenom med datum och signerat avtal", async () => {
    const r = await applyRequestUpdate(
      "r1",
      { status: "invoiced", startDate: "2026-07-01", endDate: "2026-07-31", moveInChecklist: ["contract"] },
      { db, ...noopEffects },
    );
    expect(r.ok).toBe(true);
    if (r.ok === true) expect(r.row.status).toBe("invoiced");
  });

  it("inflytt kan inte klarmarkeras med ofullständig checklista", async () => {
    const r = await applyRequestUpdate("r1", { moveInDoneAt: "2026-07-15T10:00:00Z" }, { db, ...noopEffects });
    expect(r.ok).toBe(false);
    if (r.ok === false) expect(r.body.error).toBe("checklist_incomplete");
  });

  it("won: stämplar statusChangedAt, reserverar objektet och stänger andras öppna förslag", async () => {
    const r = await applyRequestUpdate("r1", { status: "won" }, { db, ...noopEffects });
    expect(r.ok).toBe(true);
    if (r.ok === true) {
      expect(r.row.status).toBe("won");
      expect(r.row.statusChangedAt).toBeTruthy();
    }
    const [p1] = await db.select().from(properties).where(eq(properties.id, "p1"));
    expect(p1.status).toBe("reserved");
    const [m2] = await db.select().from(matches).where(eq(matches.id, "m2"));
    expect(m2.status).toBe("rejected");
    // Egna matchen röras inte av dubbelboknings-spärren
    const [m1] = await db.select().from(matches).where(eq(matches.id, "m1"));
    expect(m1.status).toBe("sent");
  });

  it("lost återkallar externa länkar", async () => {
    let revokedFor: string | null = null;
    const r = await applyRequestUpdate(
      "r2",
      { status: "lost" },
      { db, ...noopEffects, revokeLinksForRequest: async (id: string) => (revokedFor = id) },
    );
    expect(r.ok).toBe(true);
    expect(revokedFor).toBe("r2");
  });

  it("whitelistar fält — server-ägda kolumner skrivs aldrig över", async () => {
    const r = await applyRequestUpdate("r2", { requestNumber: 999999, city: "Gävle" }, { db, ...noopEffects });
    expect(r.ok).toBe(true);
    if (r.ok === true) {
      expect(r.row.city).toBe("Gävle");
      expect(r.row.requestNumber).not.toBe(999999);
    }
  });
});
