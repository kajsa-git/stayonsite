import { describe, expect, it } from "vitest";
import type { Request } from "@/lib/crm/schema";
import { matchDetails } from "@/lib/crm/matching";
import {
  buildQasaSearchRequest,
  normalizeQasaSearchDoc,
  pickQasaSearchResult,
  qasaBudgetRoom,
  qasaLeadNote,
  qasaAreaCandidates,
  qasaCriteriaFromRequest,
  qasaHitAsProperty,
  QasaUnknownAreaError,
  type QasaSearchCriteria,
} from "./qasa-search";

const req = (over: Partial<Request> = {}) =>
  ({
    city: "Gävle",
    persons: 4,
    bedsFrom: null,
    bedroomsFrom: 2,
    startDate: "2026-12-01",
    endDate: "2027-03-31",
    endDateOngoing: false,
    budgetMax: 30000,
    furnishedRequired: true,
    garageRequired: false,
    street: null,
    postalCode: null,
    addressQuery: null,
    bedroomsTo: null,
    bedsTo: null,
    ...over,
  }) as Request;

const TODAY = new Date("2026-10-30T10:00:00Z");

describe("qasaAreaCandidates", () => {
  it("kommunnamn i gemener med se/-prefix", () => {
    expect(qasaAreaCandidates("Gävle")).toEqual(["se/gävle"]);
    expect(qasaAreaCandidates("  Mönsterås kommun ")).toEqual(["se/mönsterås"]);
  });
  it("flerordsnamn provas med både understreck och bindestreck", () => {
    expect(qasaAreaCandidates("Lilla Edet")).toEqual(["se/lilla_edet", "se/lilla-edet"]);
  });
  it("tom ort ger inga kandidater", () => {
    expect(qasaAreaCandidates("  ")).toEqual([]);
  });
});

describe("qasaCriteriaFromRequest", () => {
  it("förifyller från uppdraget", () => {
    expect(qasaCriteriaFromRequest(req(), TODAY)).toEqual({
      city: "Gävle",
      persons: 4,
      minBedrooms: 2,
      moveInLatest: "2026-12-01",
      availableUntil: "2027-03-31",
      maxRent: 30000,
      furnished: true,
      privateOnly: true,
    });
  });
  it("redan startat uppdrag söker det som är ledigt i dag", () => {
    expect(qasaCriteriaFromRequest(req({ startDate: "2026-09-01" }), TODAY).moveInLatest).toBe("2026-10-30");
    expect(qasaCriteriaFromRequest(req({ startDate: null }), TODAY).moveInLatest).toBe("2026-10-30");
  });
  it("löpande uppdrag kräver inget slutdatum; bäddar används när personer saknas", () => {
    const c = qasaCriteriaFromRequest(req({ endDateOngoing: true, persons: null, bedsFrom: 3 }), TODAY);
    expect(c.availableUntil).toBeNull();
    expect(c.persons).toBe(3);
  });
});

describe("buildQasaSearchRequest", () => {
  const c: QasaSearchCriteria = {
    city: "Gävle", persons: 4, minBedrooms: null, moveInLatest: "2026-12-01",
    availableUntil: null, maxRent: 30000, furnished: true, privateOnly: true,
  };
  it("mappar kriterier till Qasas parameternamn och utelämnar tomma", () => {
    const { variables } = buildQasaSearchRequest(c, "se/gävle", 30);
    expect(variables).toEqual({
      offset: 30,
      p: {
        areaIdentifier: ["se/gävle"],
        householdSize: 4,
        moveInLatest: "2026-12-01",
        maxMonthlyCost: 30000,
        furniture: true,
        shared: false,
      },
    });
  });
});

describe("pickQasaSearchResult", () => {
  const page = (totalCount: number, nodes: unknown[] = []) => ({ data: { homeIndexSearch: { documents: { totalCount, nodes } } } }) as never;

  it("väljer första områdesvarianten som Qasa känner igen", () => {
    const r = pickQasaSearchResult([page(24781), page(3, [{ id: "1" }])], page(24781), ["se/lilla-edet", "se/lilla_edet"], "Lilla Edet");
    expect(r.area).toBe("se/lilla_edet");
    expect(r.total).toBe(3);
    expect(r.hits.map((h) => h.qasaId)).toEqual(["1"]);
  });
  it("okänt område (samma antal som kontrollfrågan) ger tydligt fel i stället för hela Sverige", () => {
    expect(() => pickQasaSearchResult([page(500)], page(500), ["se/hittepå"], "Hittepå")).toThrow(QasaUnknownAreaError);
  });
  it("noll träffar i känt område är ett giltigt svar", () => {
    expect(pickQasaSearchResult([page(0)], page(812), ["se/säffle"], "Säffle").total).toBe(0);
  });
  it("GraphQL-fel bubblar upp", () => {
    expect(() => pickQasaSearchResult([{ errors: [{ message: "boom" }] }], page(1), ["se/x"], "X")).toThrow("Qasa-fel: boom");
  });
});

describe("normalizeQasaSearchDoc", () => {
  // Riktig träff från live-indexet (Gävle, 2026-10-30), förkortad.
  const DOC = {
    id: "1493200", rent: 20000, currency: "SEK", squareMeters: 80, roomCount: 5, bedroomCount: 3,
    householdSize: 4, furnished: true, shared: false, homeType: "house",
    startDate: "2026-10-26T00:00:00+00:00", endDate: null, publishedAt: "2026-10-26T19:08:33Z",
    displayStreetNumber: false,
    location: { route: "Yrvädersgatan", streetNumber: "12", locality: "Gävle" },
    uploads: [
      { url: "https://qasa-static-prod.s3-eu-west-1.amazonaws.com/img/plan.jpg", type: "floor_plan_picture" },
      { url: "https://qasa-static-prod.s3-eu-west-1.amazonaws.com/img/a.jpg", type: "home_picture" },
    ],
  };

  it("normaliserar en träff och döljer gatunummer som uthyraren inte visar", () => {
    expect(normalizeQasaSearchDoc(DOC)).toMatchObject({
      qasaId: "1493200",
      url: "https://qasa.com/se/sv/home/1493200",
      street: "Yrvädersgatan",
      startDate: "2026-10-26",
      endDate: null,
      imageUrl: "https://qasa-static-prod.s3-eu-west-1.amazonaws.com/img/a.jpg",
    });
    expect(normalizeQasaSearchDoc({ ...DOC, displayStreetNumber: true })?.street).toBe("Yrvädersgatan 12");
  });

  it("poängsätts med samma matchDetails som egna objekt, utan budgetjämförelse på inhyran", () => {
    const hit = normalizeQasaSearchDoc(DOC)!;
    const { chips } = matchDetails(req(), qasaHitAsProperty(hit, "Gävle"));
    const labels = chips.map((c) => c.label);
    expect(labels).toEqual(expect.arrayContaining(["Rätt ort", "4 bäddar ✓", "3 sovrum ✓", "Ledig i tid", "Möblerat ✓"]));
    expect(labels.some((l) => l.includes("budget"))).toBe(false);
  });
});

describe("qasaLeadNote", () => {
  it("märker importen som uppslag utan avtal, före annonsens beskrivning", () => {
    const note = qasaLeadNote("  Ljus trea nära centrum. ", TODAY);
    expect(note.startsWith("Qasa-uppslag, importerat 2026-10-30 via matchning. Inget avtal med uthyraren ännu")).toBe(true);
    expect(note.endsWith("\n\nLjus trea nära centrum.")).toBe(true);
  });
  it("fungerar utan annonstext", () => {
    expect(qasaLeadNote(null, TODAY)).not.toContain("\n");
  });
});

describe("qasaBudgetRoom", () => {
  it("kundens budget minus Qasa-hyran", () => {
    expect(qasaBudgetRoom({ rent: 18000, currency: "SEK" }, 30000)).toBe(12000);
    expect(qasaBudgetRoom({ rent: 30000, currency: null }, 30000)).toBe(0);
    expect(qasaBudgetRoom({ rent: 34000, currency: "SEK" }, 30000)).toBe(-4000);
  });
  it("null när budget eller hyra saknas, eller hyran inte är i SEK", () => {
    expect(qasaBudgetRoom({ rent: 18000, currency: "SEK" }, null)).toBeNull();
    expect(qasaBudgetRoom({ rent: null, currency: "SEK" }, 30000)).toBeNull();
    expect(qasaBudgetRoom({ rent: 1500, currency: "EUR" }, 30000)).toBeNull();
  });
});
