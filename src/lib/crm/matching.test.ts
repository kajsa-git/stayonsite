import { describe, expect, it } from "vitest";
import type { Property, Request } from "./schema";
import { matchDetails } from "./matching";

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
