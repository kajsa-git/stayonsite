import { describe, expect, it } from "vitest";
import { normalizeQasaHome, type QasaHome } from "./qasa";

// Riktig data för qasa.com/se/sv/home/1383062 (Luleå), fångad från live-API:t.
const HOME: QasaHome = {
  id: "1383062",
  bedroomCount: 5,
  tenantCount: 5,
  rent: 35000,
  currency: "SEK",
  squareMeters: 160,
  furnishedFlexible: true,
  shared: false,
  description: "Fint boende med all möblering och fullutrustat kök. Hyra ut till företag.",
  title: null,
  location: { route: "Stormvägen", locality: "Luleå", streetNumber: null, postalCode: "976 34", countryCode: "SE" },
  traits: [
    "furniture", "fridge", "patio", "freezer", "oven", "stove", "dish_washer",
    "microwave_oven", "toilet", "shower", "washing_machine", "tumble_dryer", "internet", "television",
  ].map((type) => ({ type })),
  uploads: [
    { url: "https://qasa-static-prod.s3-eu-west-1.amazonaws.com/img/a.jpg", type: "home_picture" },
    { url: "https://qasa-static-prod.s3-eu-west-1.amazonaws.com/img/b.jpg", type: "home_picture" },
    { url: "https://qasa-static-prod.s3-eu-west-1.amazonaws.com/img/floorplan.jpg", type: "floor_plan_picture" },
  ],
  duration: { startOptimal: null, endOptimal: null },
  landlord: { firstName: "Jens Petter Johan", professional: true, companyName: "J Henrikssons Fastigheter AB" },
};

describe("normalizeQasaHome", () => {
  const l = normalizeQasaHome(HOME, "https://qasa.com/se/sv/home/1383062");

  it("mappar plats och storlek", () => {
    expect(l.address).toBe("Stormvägen");
    expect(l.city).toBe("Luleå");
    expect(l.postalCode).toBe("976 34");
    expect(l.country).toBe("Sverige");
    expect(l.squareMeters).toBe(160);
    expect(l.bedrooms).toBe(5);
    expect(l.beds).toBe(5); // tenantCount-proxy
    expect(l.bathrooms).toBeNull();
  });

  it("mappar hyra, möblering och eget boende", () => {
    expect(l.rentIn).toBe(35000);
    expect(l.furnished).toBe(true);
    expect(l.egetBoende).toBe(true); // shared=false
  });

  it("lägger annonstexten i både intern not och extern beskrivning", () => {
    expect(l.notes).toContain("Fint boende");
    expect(l.publicDescription).toContain("Fint boende");
  });

  it("härleder uthyrare från landlord", () => {
    expect(l.ownerName).toBe("J Henrikssons Fastigheter AB");
    expect(l.ownerType).toBe("foretag");
  });

  it("översätter traits till fält + 'vad ingår'", () => {
    expect(l.kitchen).toBe(true); // spis/ugn/kyl etc.
    expect(l.dishwasher).toBe(true);
    expect(l.broadband).toBe(true);
    expect(l.washingMachines).toBe(1);
    expect(l.dryers).toBe(1);
    expect(l.inclusions).toEqual(expect.arrayContaining(["Diskmaskin", "Tvättmaskin", "Torktumlare", "Bredband", "TV", "Uteplats"]));
  });

  it("tar bara med riktiga bostadsfoton", () => {
    expect(l.imageUrls).toHaveLength(2); // floor_plan_picture filtreras bort
    expect(l.imageUrls.every((u) => u.endsWith(".jpg"))).toBe(true);
  });

  it("sätter sourceUrl och källa", () => {
    expect(l.source).toBe("qasa");
    expect(l.sourceUrl).toBe("https://qasa.com/se/sv/home/1383062");
  });
});
