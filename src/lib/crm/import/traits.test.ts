import { describe, expect, it } from "vitest";
import { applyAirbnbAmenities, applyQasaTraits } from "./traits";
import { emptyListing, listingToPropertyPatch } from "./types";

describe("applyQasaTraits", () => {
  it("mappar maskin-enums till fält och hoppar över okända", () => {
    const l = emptyListing("qasa", "x");
    applyQasaTraits(l, ["furniture", "dish_washer", "washing_machine", "tumble_dryer", "internet", "garage", "unknown_trait"]);
    expect(l.furnished).toBe(true);
    expect(l.dishwasher).toBe(true);
    expect(l.washingMachines).toBe(1);
    expect(l.dryers).toBe(1);
    expect(l.broadband).toBe(true);
    expect(l.garage).toBe(true);
    expect(l.inclusions).not.toContain("Unknown_trait");
  });
});

describe("applyAirbnbAmenities", () => {
  it("nyckelords-matchar svenska titlar och tar med dem i 'vad ingår'", () => {
    const l = emptyListing("airbnb", "x");
    applyAirbnbAmenities(l, ["Kök", "Wifi", "Gratis tvättmaskin i enheten", "Hårtork"]);
    expect(l.kitchen).toBe(true);
    expect(l.broadband).toBe(true);
    expect(l.washingMachines).toBe(1);
    expect(l.inclusions).toEqual(expect.arrayContaining(["Kök", "Wifi", "Hårtork"]));
  });

  it("dedupar och kapar listan vid 20", () => {
    const l = emptyListing("airbnb", "x");
    const many = Array.from({ length: 30 }, (_, i) => `Pryl ${i}`);
    applyAirbnbAmenities(l, [...many, "Pryl 0"]);
    expect(l.inclusions).toHaveLength(20);
  });
});

describe("listingToPropertyPatch", () => {
  it("tar bara med fält med värde och sätter links från sourceUrl", () => {
    const l = emptyListing("qasa", "https://qasa.com/se/sv/home/1");
    l.city = "Luleå";
    l.bedrooms = 3;
    l.furnished = true;
    const patch = listingToPropertyPatch(l);
    expect(patch.city).toBe("Luleå");
    expect(patch.bedrooms).toBe(3);
    expect(patch.furnished).toBe(true);
    expect(patch.links).toEqual(["https://qasa.com/se/sv/home/1"]);
    // null/orörda fält ska inte finnas i patchen (skriver inte över formuläret)
    expect("address" in patch).toBe(false);
    expect("rentIn" in patch).toBe(false);
  });

  it("inkluderar false-booleans (eget boende = nej ska kunna förifyllas)", () => {
    const l = emptyListing("airbnb", "u");
    l.egetBoende = false;
    const patch = listingToPropertyPatch(l);
    expect(patch.egetBoende).toBe(false);
  });
});
