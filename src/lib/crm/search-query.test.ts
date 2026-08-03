import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { searchCrm } from "./search-query";
import { searchIndex } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-search"));
  await db.insert(searchIndex).values([
    {
      id: "company:c1",
      entityType: "company",
      entityId: "c1",
      companyId: "c1",
      title: "Acme Bygg AB",
      subtitle: "Boden",
      keywords: "acme bygg ab boden",
      route: "/crm/company/c1",
    },
    {
      id: "note:n1",
      entityType: "note",
      entityId: "n1",
      companyId: "c1",
      title: "Anteckning",
      subtitle: null,
      keywords: "acme samtal anteckning",
      route: "/crm/company/c1",
    },
    {
      id: "property:p1",
      entityType: "property",
      entityId: "p1",
      companyId: null,
      title: "Villa Boden",
      subtitle: "Boden",
      keywords: "villa boden 50 rabatt",
      route: "/crm/properties?id=p1",
    },
  ]);
});

afterEach(() => cleanup());

describe("searchCrm", () => {
  it("hittar på term och prioriterar företag före anteckningar", async () => {
    const hits = await searchCrm("acme", { db });
    expect(hits).toHaveLength(2);
    expect(hits[0].entityType).toBe("company");
    expect(hits[1].entityType).toBe("note");
  });

  it("kräver att alla termer matchar (AND)", async () => {
    expect(await searchCrm("acme boden", { db })).toHaveLength(1);
    expect(await searchCrm("acme villa", { db })).toHaveLength(0);
  });

  it("neutraliserar LIKE-jokrar — '50%' matchar inte allt", async () => {
    const hits = await searchCrm("50%", { db });
    expect(hits).toHaveLength(1);
    expect(hits[0].entityId).toBe("p1");
  });

  it("'%' ensamt blir för kort och ger tom lista", async () => {
    expect(await searchCrm("%", { db })).toHaveLength(0);
    expect(await searchCrm("a", { db })).toHaveLength(0);
  });

  it("respekterar limit", async () => {
    const hits = await searchCrm("acme", { db, limit: 1 });
    expect(hits).toHaveLength(1);
  });
});
