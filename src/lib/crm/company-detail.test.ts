import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCompanyDetail } from "./company-detail";
import { companies, contacts, matches, notes, properties, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-companydetail"));
  await db.insert(companies).values([{ id: "c1", name: "Acme Bygg" }, { id: "c2", name: "Annat AB" }]);
  await db.insert(contacts).values([{ id: "k1", companyId: "c1", name: "Kim", phone: "+46701234567" }]);
  await db.insert(properties).values([{ id: "p1", address: "Gatan 1", city: "Boden" }]);
  await db.insert(requests).values([
    { id: "r1", companyId: "c1", status: "matching" },
    { id: "r2", companyId: "c1", status: "incoming" },
    { id: "r-other", companyId: "c2", status: "incoming" },
  ]);
  await db.insert(matches).values([
    { id: "m1", requestId: "r1", propertyId: "p1", status: "suggested" },
    { id: "m2", requestId: "r1", propertyId: "p1", status: "sent" },
  ]);
  await db.insert(notes).values([{ id: "n1", companyId: "c1", channel: "samtal", content: "Ringde" }]);
});

afterEach(() => cleanup());

describe("getCompanyDetail", () => {
  it("returnerar företaget med kontakter, förfrågningar (med förslagsräknare) och anteckningar", async () => {
    const d = await getCompanyDetail("c1", { db });
    expect(d).not.toBeNull();
    expect(d!.name).toBe("Acme Bygg");
    expect(d!.contacts).toHaveLength(1);
    expect(d!.notes).toHaveLength(1);
    const byId = Object.fromEntries(d!.requests.map((r) => [r.id, r.matchCount]));
    expect(byId).toEqual({ r1: 2, r2: 0 });
  });

  it("returnerar null för okänt id", async () => {
    expect(await getCompanyDetail("finns-ej", { db })).toBeNull();
  });
});
