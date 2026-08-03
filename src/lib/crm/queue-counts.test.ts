import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { computeQueueCounts } from "./queue-counts";
import { companies, inboxMessages, outboxMessages, ownerOutreach, owners, properties, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

const TODAY = "2026-07-15"; // injicerad svensk kalenderdag; horisont = 2026-07-22

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-qcounts"));
  await db.insert(companies).values([
    { id: "cA", name: "A", followUpDate: "2026-07-15" }, // förfaller idag → followUps
    { id: "cB", name: "B" }, // followUpDate null
  ]);
  await db.insert(requests).values([
    // cB: öppen utan återkomst → openWithoutFollowUp
    { id: "r-open", companyId: "cB", status: "incoming" },
    // cB: won → toInvoice + inflytt 2026-07-16 inom horisonten → moveSchedule
    { id: "r-won", companyId: "cB", status: "won", startDate: "2026-07-16" },
    // cB: invoiced med slutdatum i förlängningsfönstret → renewals + avflytt inom horisonten → moveSchedule
    { id: "r-inv", companyId: "cB", status: "invoiced", startDate: "2026-06-01", endDate: "2026-07-20", moveInDoneAt: "2026-06-01 10:00:00" },
  ]);
  await db.insert(owners).values([{ id: "o1", name: "Uthyraren" }]);
  await db.insert(properties).values([{ id: "p1", ownerId: "o1", address: "Gatan 1", city: "Boden" }]);
  await db.insert(ownerOutreach).values([
    { id: "or1", propertyId: "p1", ownerId: "o1", status: "kontaktad", nextFollowUpDate: "2026-07-14" },
  ]);
  await db.insert(inboxMessages).values([
    { id: "in1", guid: "g1", fromPhone: "+46701111111", body: "Hej", direction: "in", sentAt: "2026-07-15T08:00:00Z", isRead: false },
  ]);
  await db.insert(outboxMessages).values([
    { id: "out1", toPhone: "+46702222222", body: "Utkast", status: "draft" },
  ]);
});

afterEach(() => cleanup());

describe("computeQueueCounts", () => {
  it("räknar alla köer från injicerad kalenderdag", async () => {
    const c = await computeQueueCounts({ db, today: TODAY });
    expect(c).toEqual({
      followUps: 1,
      openWithoutFollowUp: 1,
      toInvoice: 1,
      chaseLandlords: 1,
      moveSchedule: 2, // r-won inflytt 07-16 + r-inv avflytt 07-20, båda ≤ 2026-07-22
      replies: 1,
      drafts: 1,
      renewals: 1,
    });
  });

  it("räknar inte förlängning när kortet avfärdats", async () => {
    await db.update(requests).set({ renewalDismissedAt: "2026-07-14 10:00:00" }).where(eq(requests.id, "r-inv"));
    const c = await computeQueueCounts({ db, today: TODAY });
    expect(c.renewals).toBe(0);
  });
});
