import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { companies, notes, properties, propertyNotes, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";
import { computeToday } from "./today";

let db: TestDB;
let cleanup: () => void;

// 10:00 UTC = 12:00 svensk sommartid → "idag" = 2026-07-15.
const NOW = new Date("2026-07-15T10:00:00Z");

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-today"));
  await db.insert(companies).values([
    { id: "c1", name: "Bolaget", createdAt: "2026-07-15 08:00:00" },
    { id: "c2", name: "Gårdagsbolaget", createdAt: "2026-07-14 08:00:00" },
  ]);
  await db.insert(notes).values([
    { id: "n1", companyId: "c1", channel: "samtal", content: "Ringde", createdAt: "2026-07-15 09:00:00" },
    { id: "n2", companyId: "c1", channel: "mail", content: "Mailade", createdAt: "2026-07-15 09:30:00" },
    { id: "n3", companyId: "c2", channel: "samtal", content: "Igår", createdAt: "2026-07-14 23:00:00" },
  ]);
  await db.insert(properties).values([
    { id: "p1", address: "Gatan 1", city: "Boden" },
    { id: "p2", address: "Gatan 2", city: "Boden" },
  ]);
  await db.insert(propertyNotes).values([
    { id: "pn1", propertyId: "p1", channel: "samtal", content: "Uthyrare 1", createdAt: "2026-07-15 08:15:00" },
    { id: "pn2", propertyId: "p1", channel: "sms", content: "Uthyrare 1 igen", createdAt: "2026-07-15 08:45:00" },
    { id: "pn3", propertyId: "p2", channel: "samtal", content: "Igår", createdAt: "2026-07-14 08:00:00" },
  ]);
  await db.insert(requests).values([
    { id: "r1", companyId: "c1", status: "incoming", createdAt: "2026-07-15 09:00:00" },
    {
      id: "r2",
      companyId: "c2",
      status: "won",
      statusChangedAt: "2026-07-15 10:00:00",
      createdAt: "2026-07-10 09:00:00",
    },
    {
      id: "r3",
      companyId: "c2",
      status: "lost",
      statusChangedAt: "2026-07-14 10:00:00",
      createdAt: "2026-07-10 09:00:00",
    },
  ]);
});

afterEach(() => cleanup());

describe("computeToday", () => {
  it("räknar bara dagens aktivitet (svensk kalenderdag)", async () => {
    const t = await computeToday({ db, now: NOW });
    expect(t).toEqual({
      date: "2026-07-15",
      notes: 2,
      calls: 1,
      owners: 1, // distinkta objekt med uthyrarkontakt idag (p1)
      ownerLogs: 2,
      ownerCalls: 1,
      newCompanies: 1,
      newRequests: 1,
      won: 1,
      lost: 0,
    });
  });
});
