import { describe, expect, it } from "vitest";
import { qualificationExtractionSchema, qualificationIsComplete, stripQuotedReply } from "./corporate-qualification-workflow";

function parsed(overrides: Record<string, unknown> = {}) {
  return qualificationExtractionSchema.parse({
    startDate: "2026-09-15",
    startDateText: null,
    endDate: "2027-03-15",
    durationMonths: 6,
    durationText: "sex månader",
    location: "Solna",
    accommodationType: "lägenhet",
    persons: 3,
    bedrooms: 2,
    beds: 3,
    parkingRequired: true,
    kitchenRequired: true,
    laundryRequired: false,
    budgetMonthly: 30000,
    budgetText: null,
    startAnswered: true,
    durationAnswered: true,
    locationAnswered: true,
    accommodationTypeAnswered: true,
    capacityAnswered: true,
    requirementsAnswered: true,
    budgetAnswered: true,
    declined: false,
    summary: "Komplett behov.",
    relevantQuote: null,
    confidence: 0.95,
    ...overrides,
  });
}

describe("corporate qualification workflow", () => {
  it("kräver att alla sju frågeområden är besvarade", () => {
    expect(qualificationIsComplete(parsed())).toBe(true);
    expect(qualificationIsComplete(parsed({ budgetAnswered: false, budgetMonthly: null }))).toBe(false);
    expect(qualificationIsComplete(parsed({ requirementsAnswered: false }))).toBe(false);
  });

  it("flyttar aldrig avböjanden eller osäkra svar till matching", () => {
    expect(qualificationIsComplete(parsed({ declined: true }))).toBe(false);
    expect(qualificationIsComplete(parsed({ confidence: 0.79 }))).toBe(false);
  });

  it("räknar befintligt personantal när kunden inte upprepar det", () => {
    expect(qualificationIsComplete(parsed({ persons: null }), 3)).toBe(true);
  });

  it("tar bort citerad tidigare tråd före AI-tolkning", () => {
    expect(stripQuotedReply("Start 15 september\nBudget 30 000 kr\n\nOn Mon, Kajsa wrote:\n> Från vilket datum?")).toBe("Start 15 september\nBudget 30 000 kr");
  });
});
