import { describe, expect, it } from "vitest";
import { computeScenario, defaultKalkyl, monthsFromRequest, sanitizeKalkyl, MAX_SCENARIOS } from "./kalkyl";

describe("computeScenario", () => {
  it("vinst, marginal, totalvinst och nollpunkt", () => {
    const r = computeScenario({ label: "Bas", rentIn: 12000, rentOut: 18000, months: 6, extraCosts: 1000 });
    expect(r.profitPerMonth).toBe(5000);
    expect(r.marginPct).toBeCloseTo((5000 / 18000) * 100);
    expect(r.totalProfit).toBe(30000);
    expect(r.breakEven).toBe(13000);
  });

  it("saknad hyra ut → ingen marginal, negativ vinst", () => {
    const r = computeScenario({ label: "", rentIn: 12000, rentOut: null, months: null, extraCosts: null });
    expect(r.profitPerMonth).toBe(-12000);
    expect(r.marginPct).toBeNull();
    expect(r.totalProfit).toBeNull();
    expect(r.breakEven).toBe(12000);
  });

  it("saknade månader → ingen totalvinst", () => {
    const r = computeScenario({ label: "", rentIn: 10000, rentOut: 15000, months: null, extraCosts: null });
    expect(r.totalProfit).toBeNull();
    expect(r.profitPerMonth).toBe(5000);
  });
});

describe("monthsFromRequest", () => {
  it("projekttid vinner över datumspann", () => {
    expect(
      monthsFromRequest({ projectDurationMonths: 8, startDate: "2026-01-01", endDate: "2026-03-01" })
    ).toBe(8);
  });

  it("datumspann avrundas till månader", () => {
    expect(monthsFromRequest({ startDate: "2026-01-01", endDate: "2026-07-01" })).toBe(6);
    // kort spann blir aldrig 0 månader
    expect(monthsFromRequest({ startDate: "2026-01-01", endDate: "2026-01-10" })).toBe(1);
  });

  it("löpande utan slutdatum → null", () => {
    expect(monthsFromRequest({ startDate: "2026-01-01" })).toBeNull();
    expect(monthsFromRequest({})).toBeNull();
  });

  it("bakvänt datumspann → null", () => {
    expect(monthsFromRequest({ startDate: "2026-07-01", endDate: "2026-01-01" })).toBeNull();
  });
});

describe("defaultKalkyl", () => {
  it("förifyller Bas från boende och förfrågan", () => {
    const k = defaultKalkyl({ rentIn: 11000, rentOut: 16000 }, { projectDurationMonths: 4 });
    expect(k).toEqual([{ label: "Bas", rentIn: 11000, rentOut: 16000, months: 4, extraCosts: null }]);
  });

  it("tomma källor ger tomt Bas-scenario", () => {
    expect(defaultKalkyl({}, {})).toEqual([
      { label: "Bas", rentIn: null, rentOut: null, months: null, extraCosts: null },
    ]);
  });
});

describe("sanitizeKalkyl", () => {
  it("koercerar strängar med mellanslag och kommatecken", () => {
    const k = sanitizeKalkyl([{ label: "Bas", rentIn: "12 000", rentOut: "18000,50", months: 6, extraCosts: null }]);
    expect(k).toEqual([{ label: "Bas", rentIn: 12000, rentOut: 18000.5, months: 6, extraCosts: null }]);
  });

  it("skräp blir null-fält, okända fält kastas", () => {
    const k = sanitizeKalkyl([{ label: "X", rentIn: "abc", rentOut: NaN, months: Infinity, extraCosts: 500, hack: 1 }]);
    expect(k).toEqual([{ label: "X", rentIn: null, rentOut: null, months: null, extraCosts: 500 }]);
  });

  it("icke-array, tom lista och helt tomma rader → null", () => {
    expect(sanitizeKalkyl(null)).toBeNull();
    expect(sanitizeKalkyl("kalkyl")).toBeNull();
    expect(sanitizeKalkyl([])).toBeNull();
    expect(sanitizeKalkyl([{ label: "", rentIn: null, rentOut: null, months: null, extraCosts: null }])).toBeNull();
    expect(sanitizeKalkyl([42, "x", null])).toBeNull();
  });

  it("cappar antalet scenarier och trimmar långa namn", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ label: `S${i}`, rentOut: 1000 }));
    expect(sanitizeKalkyl(many)).toHaveLength(MAX_SCENARIOS);
    const [s] = sanitizeKalkyl([{ label: "  " + "a".repeat(60), rentOut: 1 }])!;
    expect(s.label).toHaveLength(40);
  });
});
