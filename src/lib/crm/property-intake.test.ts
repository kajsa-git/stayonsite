import { describe, expect, it } from "vitest";
import {
  PROPERTY_INTAKE_MARKER,
  buildPropertyIntakeNotes,
  propertyIntakeInclusions,
  propertyIntakeSchema,
  propertyIntakeToPropertyBody,
  type PropertyIntakeInput,
} from "./property-intake";

const sampleInput: PropertyIntakeInput = {
  ownerType: "privatperson",
  ownerArrangement: "direkt",
  ownerName: "Kajsa Test",
  ownerOrgNr: null,
  ownerContactPerson: null,
  ownerPhone: "070-123 45 67",
  ownerEmail: "kajsa@example.com",
  address: "Adriansnas gard 2",
  postalCode: "57295",
  city: "Figeholm",
  country: "Sverige",
  squareMeters: 95,
  bedrooms: 2,
  beds: 4,
  bathrooms: 1,
  washingMachines: 1,
  dryers: null,
  parkingSpaces: 2,
  parkingType: null,
  furnished: true,
  kitchen: true,
  dishwasher: true,
  garage: false,
  broadband: true,
  egetBoende: true,
  equipmentNote: null,
  skick: "Lantligt men hemtrevligt",
  desiredRent: 15000,
  moveInFrom: "2026-08-01",
  availableTo: null,
  availableUntilFurtherNotice: true,
  availabilityNote: "Kan vara ledigt langre",
  allIncluded: true,
  linensIncluded: true,
  heatWaterIncluded: true,
  excludedNote: "Tradgardsskotsel ingar inte",
  specialNote: "Trappa till overvaning",
  page: "/registrera-bostad",
  source: "property-intake",
  startedAt: 1,
  website: null,
  utmParams: { utm_source: "sms" },
  consent: true,
};

describe("property intake mapping", () => {
  it("accepts the public intake shape and normalizes empty optional strings", () => {
    const parsed = propertyIntakeSchema.parse({
      ...sampleInput,
      ownerEmail: "",
      ownerOrgNr: "",
      specialNote: "",
    });

    expect(parsed.ownerEmail).toBeNull();
    expect(parsed.ownerOrgNr).toBeNull();
    expect(parsed.specialNote).toBeNull();
  });

  it("does not allow private persons to register as intermediaries", () => {
    expect(() => propertyIntakeSchema.parse({
      ...sampleInput,
      ownerType: "privatperson",
      ownerArrangement: "formedlare",
    })).toThrow(/Privatperson kan inte vara förmedlare/);
  });

  it("maps homeowner fields to a safe CRM property draft", () => {
    const body = propertyIntakeToPropertyBody(sampleInput);

    expect(body).toMatchObject({
      address: "Adriansnas gard 2",
      postalCode: "57295",
      city: "Figeholm",
      country: "Sverige",
      bedrooms: 2,
      beds: 4,
      bathrooms: 1,
      washingMachines: 1,
      parkingSpaces: 2,
      furnished: true,
      kitchen: true,
      dishwasher: true,
      broadband: true,
      egetBoende: true,
      rentIn: 15000,
      status: "off_market",
      published: false,
      prospektPublished: false,
    });

    expect(body).not.toHaveProperty("rentOut");
    expect(body.notes).toContain(PROPERTY_INTAKE_MARKER);
    expect(String(body.notes).replace(/\u00a0/g, " ")).toContain("Önskad hyra: 15 000 kr/mån");
  });

  it("builds inclusions for CRM/prospekt from discrete public choices", () => {
    expect(propertyIntakeInclusions(sampleInput)).toEqual([
      "Exakt allt ingår",
      "Sängkläder och handduk",
      "Värme och varmvatten",
      "Bredband",
      "Parkering",
    ]);
  });

  it("keeps a searchable review note for CRM workflow", () => {
    const notes = buildPropertyIntakeNotes(sampleInput);

    expect(notes).toContain(PROPERTY_INTAKE_MARKER);
    expect(notes).toContain("Sida: /registrera-bostad");
    expect(notes).toContain("UTM: utm_source=sms");
    expect(notes).toContain("Tillgänglig till: tills vidare/osäkert");
    expect(notes).toContain("Om något inte ingår: Tradgardsskotsel ingar inte");
  });
});
