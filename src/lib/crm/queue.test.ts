import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fetchQueueItems } from "./queue";
import { companies, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-queue"));
  await db.insert(companies).values([{ id: "c1", name: "Acme Bygg" }]);
  await db.insert(requests).values([
    { id: "r-agreement", requestNumber: 101, companyId: "c1", status: "won" },
    { id: "r-invoice", requestNumber: 102, companyId: "c1", status: "won", moveInChecklist: ["contract"] },
  ]);
});

afterEach(() => cleanup());

describe("fetchQueueItems", () => {
  it("delar vunna affärer mellan Avtal och Att fakturera", async () => {
    const agreements = await fetchQueueItems("agreement", { db });
    const toInvoice = await fetchQueueItems("won", { db });

    expect(agreements.map((i) => i.requestId)).toEqual(["r-agreement"]);
    expect(toInvoice.map((i) => i.requestId)).toEqual(["r-invoice"]);
  });
});
