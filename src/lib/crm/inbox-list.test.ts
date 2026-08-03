import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listInbox } from "./inbox-list";
import { companies, contacts, inboxMessages, outboxMessages, owners } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-inboxlist"));
  await db.insert(owners).values([{ id: "o1", name: "Anna Andersson", phone: "+46701111111" }]);
  await db.insert(companies).values([{ id: "c1", name: "Acme Bygg" }]);
  await db.insert(contacts).values([{ id: "k1", companyId: "c1", name: "Kim", phone: "+46702222222" }]);
  await db.insert(outboxMessages).values([
    { id: "ut1", toPhone: "+46701111111", body: "Första utskicket", status: "sent", sentAt: "2026-07-14T08:00:00Z" },
    { id: "ut2", toPhone: "+46701111111", body: "Senaste utskicket", status: "sent", sentAt: "2026-07-15T08:00:00Z" },
  ]);
  await db.insert(inboxMessages).values([
    {
      id: "in1",
      guid: "g1",
      fromPhone: "+46701111111",
      body: "Ja, det låter bra",
      direction: "in",
      sentAt: "2026-07-15T09:00:00Z",
      isRead: false,
      ownerId: "o1",
    },
    {
      id: "in2",
      guid: "g2",
      fromPhone: "+46702222222",
      body: "Vi återkommer",
      direction: "in",
      sentAt: "2026-07-15T10:00:00Z",
      isRead: true,
      contactId: "k1",
      companyId: "c1",
    },
    {
      id: "in3",
      guid: "g3",
      fromPhone: "+46701111111",
      body: "Eget svar",
      direction: "out",
      sentAt: "2026-07-15T11:00:00Z",
      isRead: true,
    },
  ]);
});

afterEach(() => cleanup());

describe("listInbox", () => {
  it("berikar med namn och senaste skickade meddelandet per nummer", async () => {
    const rows = await listInbox({ db });
    expect(rows).toHaveLength(3);
    const in1 = rows.find((r) => r.id === "in1")!;
    expect(in1.ownerName).toBe("Anna Andersson");
    expect(in1.repliedTo?.body).toBe("Senaste utskicket");
    const in2 = rows.find((r) => r.id === "in2")!;
    expect(in2.contactName).toBe("Kim");
    expect(in2.companyName).toBe("Acme Bygg");
    expect(in2.repliedTo).toBeNull();
  });

  it("unreadOnly ger bara olästa inkommande", async () => {
    const rows = await listInbox({ unreadOnly: true, db });
    expect(rows.map((r) => r.id)).toEqual(["in1"]);
  });

  it("respekterar limit (senaste först)", async () => {
    const rows = await listInbox({ limit: 1, db });
    expect(rows.map((r) => r.id)).toEqual(["in3"]);
  });
});
