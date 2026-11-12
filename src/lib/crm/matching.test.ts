import { describe, expect, it } from "vitest";
import type { Property, Request } from "./schema";
import type { PropertyWithOwner } from "./owners";
import { matchDetails, matchesDistanceFilter, matchesPropertyFilters, unknownMatchChips, type MatchSearchFilters } from "./matching";

function request(overrides: Partial<Request> = {}): Request {
  return {
    id: "r1",
    companyId: "c1",
    requestNumber: 1,
    city: "Mönsterås",
    status: "matching",
    ...overrides,
  } as Request;
}

function property(overrides: Partial<Property> = {}): Property {
  return {
    id: "p1",
    address: "Björngatan 7",
    postalCode: "572 32",
    city: "Oskarshamn",
    status: "available",
    ...overrides,
  } as Property;
}

describe("matchDetails — geografiskt sökområde", () => {
  it("räknar en annan ort inom 30 km som rätt sökområde", () => {
    const result = matchDetails(request(), property(), { distanceKm: 28.4, radiusKm: 30 });

    expect(result.chips).toContainEqual({ label: "Inom 30 km (Oskarshamn)", tone: "good" });
    expect(result.chips).not.toContainEqual({ label: "Annan ort (Oskarshamn)", tone: "bad" });
    expect(result.score).toBeGreaterThanOrEqual(35);
  });

  it("markerar en annan ort utanför radien som avvikande", () => {
    const result = matchDetails(request(), property(), { distanceKm: 31, radiusKm: 30 });

    expect(result.chips).toContainEqual({ label: "Annan ort (Oskarshamn)", tone: "bad" });
  });

  it("behåller samma ort som full platsmatch även innan avståndet laddats", () => {
    const result = matchDetails(request(), property({ city: "Monsteras" }));

    expect(result.chips).toContainEqual({ label: "Rätt ort", tone: "good" });
  });
});

describe("matchningsfilter med ofullständiga bostadsuppgifter", () => {
  const req = request({
    city: "Oskarshamn", persons: 1, budgetMax: 10000,
    startDate: "2026-11-14", endDate: "2027-01-31",
    furnishedRequired: true, garageRequired: true,
  });
  const filters: MatchSearchFilters = {
    q: "", city: "Oskarshamn", minBeds: "1", maxRent: "10000", minRating: "4", maxKm: "30",
    nearestFirst: true, availableOnly: true, hideSuggested: false, furnished: true, garage: true,
    availableDates: true, showWeak: false,
  };
  const complete = {
    ...property({ city: "Oskarshamn", beds: 1, rentOut: 9000, furnished: true, garage: true,
      moveInFrom: "2026-11-01", availableTo: "2027-01-31" }),
    rating: 5,
  } as PropertyWithOwner;
  const suggested = new Set<string>();

  it("behåller och markerar bostaden när filteruppgifterna saknas", () => {
    const incomplete = {
      ...complete, city: null, beds: null, rentOut: null, rating: null, status: null,
      furnished: null, garage: null, moveInFrom: null, availableTo: null,
    };

    expect(matchesPropertyFilters(incomplete, req, filters, false, suggested)).toBe(true);
    expect(unknownMatchChips(req, incomplete, filters, null).map((chip) => chip.label)).toEqual([
      "Ort okänd", "Bäddar okänt", "Kundhyra okänd", "Betyg okänt", "Status okänd",
      "Möblering okänd", "Garage okänt", "Tillgänglighet ej bekräftad", "Avstånd okänt",
    ]);
  });

  it.each([
    ["för få bäddar", { beds: 0 }],
    ["känt pris över budget", { rentOut: 10001 }],
    ["känt betyg under gränsen", { rating: 3 }],
    ["annan ort", { city: "Högsby" }],
    ["omöblerat", { furnished: false }],
    ["inget garage", { garage: false }],
    ["känt upptaget", { status: "rented" }],
    ["för sent ledig", { moveInFrom: "2026-11-15" }],
    ["för tidigt slutdatum", { availableTo: "2027-01-30" }],
  ])("sorterar bort %s när uppgiften faktiskt är känd", (_label, override) => {
    expect(matchesPropertyFilters({ ...complete, ...override }, req, filters, false, suggested)).toBe(false);
  });

  it("behåller uthyrd bostad som ska tillgänglighetskontrolleras", () => {
    expect(matchesPropertyFilters({ ...complete, status: "rented" }, req, filters, true, suggested)).toBe(true);
  });

  it("behåller fri textsökning och dölj föreslagna", () => {
    expect(matchesPropertyFilters(complete, req, { ...filters, q: "en annan adress" }, false, suggested)).toBe(false);
    expect(matchesPropertyFilters(complete, req, { ...filters, hideSuggested: true }, false, new Set([complete.id]))).toBe(false);
  });

  it("behåller okänt avstånd men filtrerar ett känt avstånd utanför radien", () => {
    expect(matchesDistanceFilter(30000, true, null)).toBe(true);
    expect(matchesDistanceFilter(30000, true, 30000)).toBe(true);
    expect(matchesDistanceFilter(30000, true, 30001)).toBe(false);
    expect(matchesDistanceFilter(30000, false, 30001)).toBe(true);
  });

  it("behandlar okänd möblering och garage som okänt, inte som nej", () => {
    const result = matchDetails(req, { ...complete, furnished: null, garage: null });
    expect(result.chips).toContainEqual({ label: "Möblering okänd", tone: "warn" });
    expect(result.chips).toContainEqual({ label: "Garage okänt", tone: "warn" });
    expect(result.chips).not.toContainEqual({ label: "Ej möblerat", tone: "bad" });
    expect(result.chips).not.toContainEqual({ label: "Inget garage", tone: "bad" });
  });
});
