import { describe, expect, it } from "vitest";
import { formatRequestSearchAreas } from "./request-search-areas";

describe("formatRequestSearchAreas", () => {
  it("visar flera områden från ortsfältet", () => {
    expect(formatRequestSearchAreas({
      city: "Sollentuna, upplands väsby märsta solna",
      postalCode: null,
      addressQuery: null,
    })).toBe("Sollentuna, upplands väsby märsta solna");
  });

  it("slår ihop ort, postnummer och adressökning utan dubletter", () => {
    expect(formatRequestSearchAreas({
      city: "Sölvesborg",
      postalCode: "294 34",
      addressQuery: "Sölvesborg",
    })).toBe("Sölvesborg · 294 34");
  });

  it("returnerar null när förfrågan saknar sökområde", () => {
    expect(formatRequestSearchAreas({
      city: null,
      postalCode: null,
      addressQuery: "   ",
    })).toBeNull();
  });
});
