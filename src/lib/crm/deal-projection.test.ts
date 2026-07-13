import { describe, expect, it } from "vitest";
import { projectTenant, type DealTruth } from "./deal-projection";
import type { PublicProperty } from "./public-property";
import type { Match } from "./schema";

// Fältläckage-testerna är kärnan: kundens projektion får ALDRIG innehålla
// inpris, marginal, kalkyl, matchpoäng, interna anteckningar, adress eller
// owner-fält. Vi serialiserar hela projektionen och letar efter förbjudna
// nycklar — dyker en ny känslig kolumn upp i projektionen fallerar testet.

function makeMatch(over: Partial<Match>): Match {
  return {
    id: "m1",
    requestId: "r1",
    propertyId: "p1",
    status: "sent",
    matchScore: 87.5,
    sentAt: "2026-07-10T10:00:00Z",
    followUpDate: null,
    followUpReason: null,
    kalkyl: [{ label: "Bas", rentIn: 15000, rentOut: 24500, months: 6, extraCosts: 500 }],
    offerRentOut: 24500,
    offerStartDate: "2026-08-01",
    offerEndDate: "2027-01-31",
    offerOngoing: false,
    offerNote: "Städ varannan vecka ingår",
    promisedRentIn: 15000,
    promisedStartDate: "2026-08-01",
    promisedEndDate: "2027-01-31",
    promisedConditions: "1 mån uppsägning",
    promisedAt: "2026-07-11T09:00:00Z",
    notes: "internt: pressa priset",
    createdAt: "2026-07-09T08:00:00Z",
    ...over,
  };
}

function makePublicProperty(): PublicProperty {
  return {
    row: {
      id: "p1",
      published: false,
      prospektPublished: false,
      status: "available",
      publicName: "Ljus villa nära industriområdet",
      slug: "ljus-villa",
      postalCode: "961 42",
      city: "Boden",
      country: "Sverige",
      squareMeters: 120,
      bedrooms: 4,
      beds: 6,
      bathrooms: 2,
      washingMachines: 1,
      dryers: 1,
      dishwasher: true,
      parkingSpaces: 2,
      furnished: true,
      egetBoende: false,
      skick: "Gott skick",
      skickEn: null,
      skickPl: null,
      publicDescription: "Rymlig villa med sex bäddar.",
      publicDescriptionEn: null,
      publicDescriptionPl: null,
      inclusions: ["El", "Bredband"],
      inclusionsEn: null,
      inclusionsPl: null,
      distances: [],
      moveInFrom: "2026-08-01",
      availableTo: null,
    },
    images: ["https://r2.example/signed.jpg"],
    mapCoords: { lat: 65.82, lng: 21.69 },
    mapArea: "961 42 Boden",
  };
}

function makeTruth(over: Partial<DealTruth> = {}): DealTruth {
  return {
    request: {
      id: "r1",
      requestNumber: 42,
      status: "matching",
      city: "Boden",
      persons: 4,
      startDate: "2026-08-01",
      endDate: "2027-01-31",
      endDateOngoing: false,
    },
    companyName: "Bygg AB",
    matches: [makeMatch({})],
    acceptance: {
      id: "a1",
      agreementType: "uppdragsbekraftelse",
      version: "2026-07-12",
      requestId: "r1",
      ownerId: null,
      propertyId: null,
      shareLinkId: "sl1",
      acceptedName: "Anna Andersson",
      acceptedAt: "2026-07-12T08:00:00Z",
      userAgent: "test",
      createdAt: "2026-07-12T08:00:00Z",
    },
    ...over,
  };
}

describe("projectTenant — fältläckage", () => {
  it("innehåller aldrig inpris, kalkyl, matchpoäng, anteckningar, adress eller owner-fält", () => {
    const view = projectTenant(makeTruth(), new Map([["p1", makePublicProperty()]]));
    const json = JSON.stringify(view);

    // Förbjudna nycklar (fältnamn) — får inte finnas någonstans i projektionen.
    for (const key of [
      "rentIn", "promisedRentIn", "promisedConditions", "promisedAt", "promised",
      "kalkyl", "matchScore", "notes", "address", "owner", "budgetMax", "monthlyValue",
    ]) {
      expect(json, `nyckeln "${key}" läckte`).not.toContain(`"${key}`);
    }
    // Förbjudna värden — det interna och uthyrarsidans siffror.
    expect(json).not.toContain("pressa priset");
    expect(json).not.toContain("1 mån uppsägning");
    expect(json).not.toContain("15000");
  });

  it("visar det stämplade kundpriset — inte objektets levande listpris", () => {
    const view = projectTenant(makeTruth(), new Map([["p1", makePublicProperty()]]));
    expect(view.offers).toHaveLength(1);
    expect(view.offers[0].offerRentOut).toBe(24500);
  });
});

describe("LandlordDealView — fältläckage (typnivå)", () => {
  it("uthyrarens vy saknar utpris, kalkyl, matchpoäng och kundens identitet", async () => {
    // Vyn byggs fält-för-fält i loadLandlordDeal — här låser vi kontraktet:
    // typen får inte växa med känsliga fält utan att detta test uppdateras medvetet.
    const { loadLandlordDeal } = await import("./deal-projection");
    void loadLandlordDeal; // typkontrollen nedan är själva testet
    const allowedKeys: Record<keyof import("./deal-projection").LandlordDealView, true> = {
      ownerName: true,
      propertyAddress: true,
      propertyCity: true,
      persons: true,
      promisedRentIn: true,
      promisedStartDate: true,
      promisedEndDate: true,
      promisedConditions: true,
      promisedAt: true,
      status: true,
      agreementAccepted: true,
      acceptedName: true,
      acceptedAt: true,
    };
    const forbidden = ["offerRentOut", "companyName", "kalkyl", "matchScore", "notes", "rentOut", "budgetMax"];
    for (const key of forbidden) {
      expect(key in allowedKeys, `känsligt fält "${key}" i LandlordDealView`).toBe(false);
    }
  });
});

describe("projectTenant — vad kunden ser", () => {
  it("tar bara med skickade erbjudanden", () => {
    const truth = makeTruth({
      matches: [
        makeMatch({ id: "m1", sentAt: "2026-07-10T10:00:00Z" }),
        makeMatch({ id: "m2", status: "suggested", sentAt: null }), // ej skickad → osynlig
      ],
    });
    const view = projectTenant(truth, new Map([["p1", makePublicProperty()]]));
    expect(view.offers.map((o) => o.matchId)).toEqual(["m1"]);
  });

  it("avvisad efter skick blir 'unavailable' — kortet försvinner aldrig", () => {
    const truth = makeTruth({
      matches: [makeMatch({ status: "rejected", notes: "Objektet togs av annan kund" })],
    });
    const view = projectTenant(truth, new Map([["p1", makePublicProperty()]]));
    expect(view.offers).toHaveLength(1);
    expect(view.offers[0].status).toBe("unavailable");
  });

  it("accepterad match visas som accepterad", () => {
    const truth = makeTruth({ matches: [makeMatch({ status: "accepted" })] });
    const view = projectTenant(truth, new Map([["p1", makePublicProperty()]]));
    expect(view.offers[0].status).toBe("accepted");
  });

  it("speglar uppdragsbekräftelsens status", () => {
    const accepted = projectTenant(makeTruth(), new Map());
    expect(accepted.agreementAccepted).toBe(true);
    expect(accepted.acceptedName).toBe("Anna Andersson");

    const gated = projectTenant(makeTruth({ acceptance: null }), new Map());
    expect(gated.agreementAccepted).toBe(false);
  });
});
