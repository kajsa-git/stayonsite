import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { computeOverview } from "./overview";
import { companies, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

// Onsdag 15 juli 2026, 12:00 UTC → vecka börjar måndag 2026-07-13, månad 2026-07-01.
const NOW = new Date("2026-07-15T12:00:00Z");

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-overview"));
  await db.insert(companies).values([
    { id: "c-week", name: "Veckobolaget", createdAt: "2026-07-14 08:00:00" },
    { id: "c-month", name: "Månadsbolaget", createdAt: "2026-07-02 08:00:00" },
  ]);
  await db.insert(requests).values([
    // Öppna: budget × längd = 20000×3 + 10000×2 (från datumspann) = 80000
    {
      id: "r-open1",
      companyId: "c-week",
      status: "incoming",
      budgetMax: 20000,
      projectDurationMonths: 3,
      createdAt: "2026-07-15 09:00:00",
    },
    {
      id: "r-open2",
      companyId: "c-week",
      status: "matching",
      budgetMax: 10000,
      startDate: "2026-07-01",
      endDate: "2026-09-01",
      createdAt: "2026-07-14 09:00:00",
    },
    // Vunnen i veckan
    {
      id: "r-won",
      companyId: "c-month",
      status: "won",
      monthlyValue: 15000,
      statusChangedAt: "2026-07-14 10:00:00",
      createdAt: "2026-07-10 09:00:00",
    },
    // Förlorad tidigare i månaden (inte i veckan)
    {
      id: "r-lost",
      companyId: "c-month",
      status: "lost",
      statusChangedAt: "2026-07-02 10:00:00",
      createdAt: "2026-07-02 09:00:00",
    },
  ]);
});

afterEach(() => cleanup());

describe("computeOverview", () => {
  it("räknar pågående affärer och uppskattat ordervärde", async () => {
    const o = await computeOverview({ db, now: NOW });
    expect(o.ongoing.count).toBe(2);
    expect(o.ongoing.estimatedValue).toBe(20000 * 3 + 10000 * 2);
  });

  it("skiljer vecko- och månadsperioder (svensk tid)", async () => {
    const o = await computeOverview({ db, now: NOW });
    expect(o.periods.week).toEqual({ won: 1, wonValue: 15000, lost: 0, newCompanies: 1, newRequests: 2 });
    expect(o.periods.month).toEqual({ won: 1, wonValue: 15000, lost: 1, newCompanies: 2, newRequests: 4 });
  });

  it("stämplar generatedAt från injicerad klocka", async () => {
    const o = await computeOverview({ db, now: NOW });
    expect(o.generatedAt).toBe(NOW.toISOString());
  });
});
