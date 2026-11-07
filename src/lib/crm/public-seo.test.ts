import { describe, expect, it } from "vitest";
import { publicPropertyDescription, publicPropertyTitle, truncateSeoDescription } from "./public-seo";
import { getCityForLocality } from "@/data/cities";

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

describe("objektsidans titel", () => {
  it("lägger till sovrum och bäddar när namnet saknar dem", () => {
    expect(publicPropertyTitle({ name: "Personalanläggning i Oskarshamn", city: "Oskarshamn", bedrooms: 11, beds: 20 }))
      .toBe("Personalanläggning i Oskarshamn – 11 sovrum, 20 bäddar");
  });

  it("behåller namn som redan anger storleken", () => {
    expect(publicPropertyTitle({ name: "Brämhult – 144 m², 6 sovrum, 10 bäddar", city: "Brämhult", bedrooms: 6, beds: 10 }))
      .toBe("Brämhult – 144 m², 6 sovrum, 10 bäddar");
  });

  it("lägger till orten när namnet saknar den", () => {
    expect(publicPropertyTitle({ name: "Tegelhus", city: "Blomstermåla", bedrooms: 7, beds: 1 }))
      .toBe("Tegelhus, Blomstermåla – 7 sovrum, 1 bädd");
    expect(publicPropertyTitle({ name: "Villa i Figeholm", city: "Figeholm", bedrooms: null, beds: null }))
      .toBe("Villa i Figeholm");
  });
});

describe("stadssida för en ort", () => {
  it("hittar staden själv och dess listade orter", () => {
    expect(getCityForLocality("Oskarshamn")?.slug).toBe("oskarshamn");
    expect(getCityForLocality("Figeholm")?.slug).toBe("oskarshamn");
    expect(getCityForLocality(" paskallavik ")?.slug).toBe("oskarshamn");
    expect(getCityForLocality("Blomstermåla")?.slug).toBe("monsteras");
    expect(getCityForLocality("Okänd ort")).toBeUndefined();
    expect(getCityForLocality(null)).toBeUndefined();
  });
});
