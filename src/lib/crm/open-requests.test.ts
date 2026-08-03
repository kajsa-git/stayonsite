import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listOpenRequests } from "./open-requests";
import { companies, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-openreq"));
  await db.insert(companies).values([
    { id: "c1", name: "Acme Bygg" },
    { id: "c2", name: "Nordisk Montage" },
  ]);
  await db.insert(requests).values([
    { id: "r1", companyId: "c1", status: "incoming", city: "Boden", persons: 4, budgetMax: 30000, createdAt: "2026-07-15 09:00:00" },
    { id: "r2", companyId: "c2", status: "matching", city: "Gävle", persons: 2, createdAt: "2026-07-14 09:00:00" },
    { id: "r3", companyId: "c2", status: "won", city: "Luleå", createdAt: "2026-07-13 09:00:00" },
  ]);
});

afterEach(() => cleanup());

describe("listOpenRequests", () => {
  it("listar bara öppna förfrågningar (incoming/matching), senaste först", async () => {
    const rows = await listOpenRequests({ db });
    expect(rows.map((r) => r.id)).toEqual(["r1", "r2"]);
    expect(rows[0].companyName).toBe("Acme Bygg");
  });

  it("filtrerar på företagsnamn eller stad", async () => {
    expect((await listOpenRequests({ q: "gävle", db })).map((r) => r.id)).toEqual(["r2"]);
    expect((await listOpenRequests({ q: "acme", db })).map((r) => r.id)).toEqual(["r1"]);
  });

  it("respekterar limit", async () => {
    expect(await listOpenRequests({ limit: 1, db })).toHaveLength(1);
  });
});
