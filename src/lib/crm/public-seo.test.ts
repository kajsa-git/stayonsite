import { describe, expect, it } from "vitest";
import { publicPropertyDescription, truncateSeoDescription } from "./public-seo";

const base = {
  city: "Svanskog",
  postalCode: "662 50",
  squareMeters: 72,
  bedrooms: 2,
  beds: 4,
};

describe("publik SEO-text", () => {
  it("behåller en redaktionell beskrivning", () => {
    expect(publicPropertyDescription("  Egen granskad text.  ", { ...base, name: "Boende" })).toBe(
      "Egen granskad text.",
    );
  });

  it("ger kolliderande auto-objekt olika fallbacktext", () => {
    const first = publicPropertyDescription(null, {
      ...base,
      name: "Företagsboende Svanskog · 2 sovrum",
      slug: "foretagsboende-svanskog-2-sovrum",
    });
    const second = publicPropertyDescription(null, {
      ...base,
      name: "Företagsboende Svanskog · 2 sovrum · bostad 2",
      slug: "foretagsboende-svanskog-2-sovrum-2",
    });

    expect(first).not.toBe(second);
    expect(first).toContain("72 m²");
    expect(second).toContain("bostad 2");
  });

  it("kapar metabeskrivningar vid en ordgräns", () => {
    const result = truncateSeoDescription("ord ".repeat(60), 80);
    expect(result.length).toBeLessThanOrEqual(80);
    expect(result.endsWith("…")).toBe(true);
  });
});
