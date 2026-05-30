import { describe, expect, it } from "vitest";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import {
  autoPublicNameForForm,
  ownerPatchToForm,
  previewPublicSlug,
  propertyFormToPayload,
  toPropertyForm,
  type EditForm,
} from "./property-form-state";

// Fullt ifyllt objekt med icke-default-värden i ALLA form-ägda fält.
const fullProperty = {
  id: "p1",
  ownerId: "ow1",
  address: "Storgatan 1",
  postalCode: "123 45",
  city: "Kiruna",
  country: "Norge",
  squareMeters: 75.5,
  bedrooms: 3,
  beds: 4,
  bathrooms: 2,
  washingMachines: 1,
  dryers: 1,
  parkingSpaces: 2,
  skick: "Fint skick",
  rentIn: 12000,
  rentOut: 15000,
  moveInFrom: "2026-06-01",
  availableTo: "2026-12-31",
  ownerType: "foretag",
  ownerArrangement: "formedlare",
  ownerName: "Hyresvärd AB",
  ownerOrgNr: "556677-8899",
  ownerContactPerson: "Anna Andersson",
  ownerPhone: "070-1234567",
  ownerEmail: "anna@hyresvard.se",
  notes: "Intern notis",
  publicName: "3 rum i Kiruna",
  slug: "3-rum-i-kiruna",
  publicDescription: "Beskrivning sv",
  publicDescriptionEn: "Description en",
  publicDescriptionPl: "Opis pl",
  skickEn: "Good condition",
  skickPl: "Dobry stan",
  inclusions: ["Möbler", "Wifi"],
  inclusionsEn: ["Furniture", "Wifi"],
  inclusionsPl: ["Meble", "Wifi"],
  distances: [{ label: "Centrum", address: "Kiruna C", km: 2.5, minutes: 6 }],
  furnished: true,
  kitchen: true,
  garage: true,
  broadband: true,
  egetBoende: true,
  dishwasher: true,
  allIncluded: true,
  excludedNote: "El ingår ej",
  linensIncluded: true,
  heatWaterIncluded: true,
  specialNote: "Trappor till entrén",
} as unknown as PropertyWithOwner;

// Hårdkodad i testet (separat från impl) → tappar man en rad i payloaden fångas det här.
const EXPECTED_PAYLOAD_KEYS = [
  "address", "allIncluded", "availableTo", "bathrooms", "bedrooms", "beds", "broadband",
  "city", "country", "dishwasher", "distances", "dryers", "egetBoende", "excludedNote",
  "furnished", "garage", "heatWaterIncluded", "inclusions", "inclusionsEn", "inclusionsPl",
  "kitchen", "linensIncluded", "moveInFrom", "notes", "ownerArrangement", "ownerContactPerson",
  "ownerEmail", "ownerId", "ownerName", "ownerOrgNr", "ownerPhone", "ownerType", "parkingSpaces",
  "postalCode", "publicDescription", "publicDescriptionEn", "publicDescriptionPl", "publicName",
  "rentIn", "rentOut", "skick", "skickEn", "skickPl", "slug", "specialNote", "squareMeters",
  "washingMachines",
].sort();

describe("propertyFormToPayload — payloadens fältuppsättning", () => {
  it("innehåller exakt de förväntade nycklarna (fångar tappad rad)", () => {
    const payload = propertyFormToPayload(toPropertyForm(fullProperty));
    expect(Object.keys(payload).sort()).toEqual(EXPECTED_PAYLOAD_KEYS);
  });
});

describe("round-trip: property → form → payload bevarar alla fält", () => {
  const payload = propertyFormToPayload(toPropertyForm(fullProperty));

  it("strängfält bevaras", () => {
    expect(payload.address).toBe("Storgatan 1");
    expect(payload.postalCode).toBe("123 45");
    expect(payload.city).toBe("Kiruna");
    expect(payload.country).toBe("Norge");
    expect(payload.skick).toBe("Fint skick");
    expect(payload.moveInFrom).toBe("2026-06-01");
    expect(payload.availableTo).toBe("2026-12-31");
    expect(payload.notes).toBe("Intern notis");
    expect(payload.publicName).toBe("3 rum i Kiruna");
    expect(payload.slug).toBe("3-rum-i-kiruna");
    expect(payload.publicDescription).toBe("Beskrivning sv");
    expect(payload.publicDescriptionEn).toBe("Description en");
    expect(payload.publicDescriptionPl).toBe("Opis pl");
    expect(payload.skickEn).toBe("Good condition");
    expect(payload.skickPl).toBe("Dobry stan");
    expect(payload.excludedNote).toBe("El ingår ej");
    expect(payload.specialNote).toBe("Trappor till entrén");
  });

  it("numeriska fält parsas tillbaka", () => {
    expect(payload.squareMeters).toBe(75.5);
    expect(payload.bedrooms).toBe(3);
    expect(payload.beds).toBe(4);
    expect(payload.bathrooms).toBe(2);
    expect(payload.washingMachines).toBe(1);
    expect(payload.dryers).toBe(1);
    expect(payload.parkingSpaces).toBe(2);
    expect(payload.rentIn).toBe(12000);
    expect(payload.rentOut).toBe(15000);
  });

  it("uthyraridentitet bevaras", () => {
    expect(payload.ownerId).toBe("ow1");
    expect(payload.ownerType).toBe("foretag");
    expect(payload.ownerArrangement).toBe("formedlare");
    expect(payload.ownerName).toBe("Hyresvärd AB");
    expect(payload.ownerOrgNr).toBe("556677-8899");
    expect(payload.ownerContactPerson).toBe("Anna Andersson");
    expect(payload.ownerPhone).toBe("070-1234567");
    expect(payload.ownerEmail).toBe("anna@hyresvard.se");
  });

  it("listor och avstånd bevaras", () => {
    expect(payload.inclusions).toEqual(["Möbler", "Wifi"]);
    expect(payload.inclusionsEn).toEqual(["Furniture", "Wifi"]);
    expect(payload.inclusionsPl).toEqual(["Meble", "Wifi"]);
    expect(payload.distances).toEqual([{ label: "Centrum", address: "Kiruna C", km: 2.5, minutes: 6 }]);
  });

  it("booleans bevaras", () => {
    expect(payload.furnished).toBe(true);
    expect(payload.kitchen).toBe(true);
    expect(payload.garage).toBe(true);
    expect(payload.broadband).toBe(true);
    expect(payload.egetBoende).toBe(true);
    expect(payload.dishwasher).toBe(true);
    expect(payload.allIncluded).toBe(true);
    expect(payload.linensIncluded).toBe(true);
    expect(payload.heatWaterIncluded).toBe(true);
  });
});

describe("tomma/null-fält och defaults", () => {
  const empty = {} as unknown as PropertyWithOwner;
  const payload = propertyFormToPayload(toPropertyForm(empty));

  it("tomma strängfält blir null", () => {
    expect(payload.address).toBeNull();
    expect(payload.skick).toBeNull();
    expect(payload.publicDescription).toBeNull();
  });

  it("tomma sifferfält blir null", () => {
    expect(payload.squareMeters).toBeNull();
    expect(payload.bedrooms).toBeNull();
    expect(payload.rentIn).toBeNull();
  });

  it("land defaultar till Sverige, uthyrartyp/upplägg till defaults", () => {
    expect(payload.country).toBe("Sverige");
    expect(payload.ownerType).toBe("privatperson");
    expect(payload.ownerArrangement).toBe("direkt");
    expect(payload.ownerId).toBeNull();
  });

  it("inclusions trimmas och tomma rader filtreras bort", () => {
    const form: EditForm = { ...toPropertyForm(empty), inclusions: [" Möbler ", "", "  ", "Wifi"] };
    expect(propertyFormToPayload(form).inclusions).toEqual(["Möbler", "Wifi"]);
  });
});

describe("slug/namn-helpers", () => {
  it("autoPublicName speglar serverns default (buildPublicName)", () => {
    const form = { ...toPropertyForm({} as unknown as PropertyWithOwner), city: "Boden", bedrooms: "2" };
    expect(autoPublicNameForForm(form)).toBe("Företagsboende Boden · 2 sovrum");
  });

  it("previewPublicSlug: explicit slug > publikt namn > auto-namn", () => {
    const base = toPropertyForm({} as unknown as PropertyWithOwner);
    expect(previewPublicSlug({ ...base, slug: "Egen Slug" })).toBe("egen-slug");
    expect(previewPublicSlug({ ...base, publicName: "Mitt Namn" })).toBe("mitt-namn");
    expect(previewPublicSlug({ ...base, city: "Boden", bedrooms: "2" })).toBe("foretagsboende-boden-2-sovrum");
  });
});

describe("ownerPatchToForm", () => {
  it("uppdaterar bara medskickade nycklar", () => {
    expect(ownerPatchToForm({ ownerName: "Ny" })).toEqual({ ownerName: "Ny" });
    expect(ownerPatchToForm({ ownerId: "x", ownerPhone: "070" })).toEqual({ ownerId: "x", ownerPhone: "070" });
  });

  it("null → tom sträng, type/arrangement → defaults", () => {
    expect(ownerPatchToForm({ ownerId: undefined })).toEqual({ ownerId: "" });
    expect(ownerPatchToForm({ ownerType: undefined })).toEqual({ ownerType: "privatperson" });
    expect(ownerPatchToForm({ ownerArrangement: undefined })).toEqual({ ownerArrangement: "direkt" });
  });

  it("tom patch ger tom uppdatering", () => {
    expect(ownerPatchToForm({})).toEqual({});
  });
});
