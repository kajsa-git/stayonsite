import { afterEach, describe, expect, it } from "vitest";
import { companies, properties, requests } from "./schema";
import { createTestDb } from "./test-db";
import { computeWeeklyReport } from "./weekly-report";
import { buildWeeklyReport, normalizeReportAreas, registeredDayStockholm, reportWeeks } from "./weekly-report-data";

const NOW = new Date("2026-10-13T12:00:00Z");
let cleanup: (() => void) | undefined;
afterEach(() => { cleanup?.(); cleanup = undefined; });

describe("veckogränser och tidszon", () => {
  it("visar exakt 12 veckor inklusive den pågående, med tomma veckor kvar", () => {
    const report = buildWeeklyReport({ now: NOW, properties: [], requests: [] });
    expect(report.weeks).toHaveLength(12);
    expect(report.weeks[0]).toMatchObject({ startDate: "2026-07-27", endDate: "2026-08-02", weekNumber: 31, year: 2026, isCurrent: false });
    expect(report.weeks[11]).toMatchObject({ startDate: "2026-10-12", endDate: "2026-10-18", weekNumber: 42, isCurrent: true });
    expect(report.weeks.every((week) => week.properties === 0 && week.requests === 0)).toBe(true);
  });

  it("byter till 12 hela veckor när pågående vecka utelämnas", () => {
    const weeks = reportWeeks(NOW, false);
    expect(weeks).toHaveLength(12);
    expect(weeks[0].startDate).toBe("2026-07-20");
    expect(weeks[11].endDate).toBe("2026-10-11");
    expect(weeks.some((week) => week.isCurrent)).toBe(false);
  });

  it("hanterar ISO-veckoåret runt nyår", () => {
    const weeks = reportWeeks(new Date("2027-01-01T10:00:00Z"));
    expect(weeks[11]).toMatchObject({ startDate: "2026-12-28", endDate: "2027-01-03", weekNumber: 53, year: 2026 });
    expect(reportWeeks(new Date("2027-01-04T10:00:00Z"))[11]).toMatchObject({ weekNumber: 1, year: 2027 });
  });

  it("lägger UTC-söndag efter svensk midnatt i måndagens vecka", () => {
    expect(registeredDayStockholm("2026-10-11 21:59:59")).toBe("2026-10-11");
    expect(registeredDayStockholm("2026-10-11 22:00:00")).toBe("2026-10-12");
    expect(registeredDayStockholm("2026-10-12T00:00:00+02:00")).toBe("2026-10-12");
  });

  it("hanterar vintertid efter omställningen och sommartidens början", () => {
    expect(registeredDayStockholm("2026-10-25 22:59:59")).toBe("2026-10-25");
    expect(registeredDayStockholm("2026-10-25 23:00:00")).toBe("2026-10-26");
    expect(registeredDayStockholm("2026-03-29T22:00:00Z")).toBe("2026-03-30");
  });

  it("ignorerar ogiltiga datum och bevarar rena kalenderdatum", () => {
    expect(registeredDayStockholm(null)).toBeNull();
    expect(registeredDayStockholm("okänt")).toBeNull();
    expect(registeredDayStockholm("2026-02-30 10:00:00")).toBeNull();
    expect(registeredDayStockholm("2026-10-12")).toBe("2026-10-12");
  });
});

describe("orter", () => {
  it("samlar namnvarianter och upprepade orter", () => {
    expect(normalizeReportAreas(" ÖVIK / Örnsköldsvik, ornskoldsvik ")).toEqual([{ id: "area:ornskoldsvik", name: "Örnsköldsvik" }]);
    expect(normalizeReportAreas("GÖTEBORG")).toEqual(normalizeReportAreas("Gothenburg"));
    expect(normalizeReportAreas("ANGERED")).toEqual(normalizeReportAreas("Angered"));
  });

  it("delar flera orter utan att göra län eller områdesbeskrivningar till extra orter", () => {
    expect(normalizeReportAreas("Haparanda och Övertorneå").map((area) => area.name)).toEqual(["Haparanda", "Övertorneå"]);
    expect(normalizeReportAreas("Kista, Stockholms Län")).toEqual([{ id: "area:kista", name: "Kista" }]);
    expect(normalizeReportAreas("Göteborg/near by").map((area) => area.name)).toEqual(["Göteborg"]);
    expect(normalizeReportAreas("Eskilstuna centralt").map((area) => area.name)).toEqual(["Eskilstuna"]);
    expect(normalizeReportAreas("Lund\nMalmö").map((area) => area.name)).toEqual(["Lund", "Malmö"]);
    expect(normalizeReportAreas("Kalmar län").map((area) => area.name)).toEqual(["Kalmar län"]);
  });

  it("redovisar saknad ort som egen rad", () => {
    for (const value of [null, "", "  ", "okänd", "N/A", "—"]) {
      expect(normalizeReportAreas(value)).toEqual([{ id: "unknown", name: "Saknar område" }]);
    }
  });
});

describe("summering och underlag", () => {
  it("räknar varje post en gång totalt och en gång per berörd ort", () => {
    const request = { id: "r1", createdAt: "2026-10-12 10:00:00", city: "Övik; Umeå; Örnsköldsvik", requestNumber: 123, companyName: "Test AB" };
    const report = buildWeeklyReport({ now: NOW, properties: [], requests: [request, request] });
    expect(report.totals.requests).toBe(1);
    expect(report.weeks[11].requests).toBe(1);
    expect(report.areas.map((area) => area.totals.requests)).toEqual([1, 1]);
    expect(report.multiAreaRequests).toBe(1);
    expect(report.records).toHaveLength(1);
    expect(report.records[0]).toMatchObject({ weekId: "2026-10-12", title: "#123 · Test AB", href: "/crm/matching/r1" });
  });

  it("skiljer boenden med adress från intresseanmälningar och utelämnar framtida/äldre poster", () => {
    const report = buildWeeklyReport({ now: NOW, requests: [], properties: [
      { id: "p1", createdAt: "2026-10-11 22:01:00", city: "Boden", address: " Storgatan 1 " },
      { id: "p2", createdAt: "2026-10-12 10:00:00", city: null, address: "   ", ownerName: "Uthyrare" },
      { id: "old", createdAt: "2026-07-26 21:59:59", city: "Boden", address: "Gammal 1" },
      { id: "future", createdAt: "2026-10-13 15:00:00", city: "Boden", address: "Framtid 1" },
      { id: "later-week", createdAt: "2026-10-19 10:00:00", city: "Boden", address: "Framtid 2" },
    ] });
    expect(report.totals).toEqual({ properties: 1, requests: 0, landlordLeads: 1 });
    expect(report.records.map((record) => record.id)).toEqual(["p1", "p2"]);
    expect(report.records[0].href).toBe("/crm/properties?id=p1");
    expect(report.areas.find((area) => area.id === "unknown")?.weeks[11].landlordLeads).toBe(1);
  });

  it("summerar direkt ur databasen, även avslutade förfrågningar, med svensk veckogräns", async () => {
    const harness = await createTestDb("weekly-report");
    cleanup = harness.cleanup;
    await harness.db.insert(companies).values({ id: "c1", name: "Rapportbolaget" });
    await harness.db.insert(properties).values([
      { id: "p-first", city: "Angered", address: "Gatan 1", createdAt: "2026-07-26 22:00:00" },
      { id: "p-before", city: "Angered", address: "Gatan 2", createdAt: "2026-07-26 21:59:59" },
      { id: "p-current", city: "ANGERED", address: "Gatan 3", createdAt: "2026-10-12 10:00:00" },
      { id: "p-lead", city: null, address: null, createdAt: "2026-10-12 10:00:00" },
    ]);
    await harness.db.insert(requests).values([
      { id: "r-lost", companyId: "c1", status: "lost", city: "Angered", createdAt: "2026-10-11 22:00:00", statusChangedAt: "2026-10-13 08:00:00" },
      { id: "r-old", companyId: "c1", status: "matching", city: "Angered", createdAt: "2026-07-01 10:00:00", updatedAt: "2026-10-13 08:00:00" },
    ]);
    const report = await computeWeeklyReport({ db: harness.db, now: NOW });
    expect(report.totals).toEqual({ properties: 2, requests: 1, landlordLeads: 1 });
    expect(report.weeks[0].properties).toBe(1);
    expect(report.weeks[11]).toMatchObject({ properties: 1, requests: 1, landlordLeads: 1 });
    expect(report.areas.find((area) => area.id === "area:angered")?.totals).toEqual({ properties: 2, requests: 1, landlordLeads: 0 });
    const completed = await computeWeeklyReport({ db: harness.db, now: NOW, includeCurrent: false });
    expect(completed.totals).toEqual({ properties: 2, requests: 0, landlordLeads: 0 });
    expect(completed.records.map((record) => record.id).sort()).toEqual(["p-before", "p-first"]);
  });
});
