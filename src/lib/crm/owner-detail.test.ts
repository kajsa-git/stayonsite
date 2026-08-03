import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getOwnerDetail } from "./owner-detail";
import { owners, properties } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-ownerdetail"));
  await db.insert(owners).values([
    { id: "o1", name: "Anna Andersson", phone: "+46701234567" },
    { id: "o2", name: "Berit Berg" },
  ]);
  await db.insert(properties).values([
    { id: "p1", ownerId: "o1", address: "Gatan 1", city: "Boden", rentIn: 12000, rentOut: 18000 },
    { id: "p2", ownerId: "o1", address: "Gatan 2", city: "Luleå" },
    { id: "p-other", ownerId: "o2", address: "Annan väg 3", city: "Gävle" },
  ]);
});

afterEach(() => cleanup());

describe("getOwnerDetail", () => {
  it("returnerar uthyraren med kompakt objektlista (bara egna objekt)", async () => {
    const d = await getOwnerDetail("o1", { db });
    expect(d).not.toBeNull();
    expect(d!.name).toBe("Anna Andersson");
    expect(d!.properties.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
    const p1 = d!.properties.find((p) => p.id === "p1")!;
    expect(p1.rentIn).toBe(12000);
    expect(p1.rentOut).toBe(18000);
  });

  it("returnerar null för okänt id", async () => {
    expect(await getOwnerDetail("finns-ej", { db })).toBeNull();
  });
});
