import { describe, expect, it } from "vitest";
import { buildPublicName, publicDisplayName, slugify } from "./slug";

describe("publik namngivning", () => {
  const facts = { city: "Svanskog", bedrooms: 2, beds: 4 };

  it("bygger det vanliga SEO-namnet", () => {
    expect(buildPublicName(facts)).toBe("Företagsboende Svanskog · 2 sovrum");
  });

  it("gör auto-namnet unikt när sluggen har en kollisionssuffix", () => {
    expect(
      publicDisplayName(null, facts, "foretagsboende-svanskog-2-sovrum-2"),
    ).toBe("Företagsboende Svanskog · 2 sovrum · bostad 2");
  });

  it("ändrar inte den första eller en manuellt frikopplad slug", () => {
    expect(publicDisplayName(null, facts, "foretagsboende-svanskog-2-sovrum")).toBe(
      "Företagsboende Svanskog · 2 sovrum",
    );
    expect(publicDisplayName("Boende nära centrum", facts, "egen-stabil-slug-2")).toBe(
      "Boende nära centrum",
    );
    expect(publicDisplayName("Hus", facts, "foo-2")).toBe("Hus");
  });

  it("normaliserar svenska tecken i sluggar", () => {
    expect(slugify("Företagsboende Luleå · 4 sovrum")).toBe("foretagsboende-lulea-4-sovrum");
  });
});
