import { describe, expect, it } from "vitest";
import { withinTravelTime } from "./travel-time";

describe("30 minute driving boundary", () => {
  it("includes the boundary without rounding longer routes down", () => {
    expect(withinTravelTime(0)).toBe(true);
    expect(withinTravelTime(1800)).toBe(true);
    expect(withinTravelTime(1801)).toBe(false);
  });
  it("excludes routes whose travel time is unknown or invalid", () => {
    for (const value of [undefined, null, NaN, Infinity, -1]) expect(withinTravelTime(value)).toBe(false);
  });
});
