import { describe, expect, it } from "vitest";
import { buildAreaGeocodeQueries } from "./public-property";

describe("buildAreaGeocodeQueries", () => {
  it("prioritizes the Swedish postal area over an ambiguous city name", () => {
    expect(buildAreaGeocodeQueries("610 31", "Vikbolandet", "Sverige")).toEqual([
      "postalcode=610%2031&country=Sweden",
      "postalcode=610%2031&city=Vikbolandet&country=Sweden",
      "city=Vikbolandet&country=Sweden",
    ]);
  });

  it("normalizes Swedish postal codes without spaces", () => {
    expect(buildAreaGeocodeQueries("61031", null, "SE")).toEqual([
      "postalcode=610%2031&country=Sweden",
    ]);
  });

  it("falls back to city when a postal code is missing", () => {
    expect(buildAreaGeocodeQueries(null, "Norrköping", "Sverige")).toEqual([
      "city=Norrk%C3%B6ping&country=Sweden",
    ]);
  });
});
