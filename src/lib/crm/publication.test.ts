import { describe, expect, it } from "vitest";
import { hasCurrentPublicAvailability, hasWebsitePropertyStatus, publicListingPatch } from "./publication";

describe("publicListingPatch", () => {
  it("publicerar utan att ändra objektets uthyrningsstatus", () => {
    expect(publicListingPatch(true)).toEqual({ published: true });
  });

  it("ändrar inte affärsstatus när objektet avpubliceras", () => {
    expect(publicListingPatch(false)).toEqual({ published: false });
  });

  it("tillåter publicering oavsett objektets uthyrningsstatus", () => {
    for (const status of ["available", "rented", "off_market"]) expect(hasWebsitePropertyStatus(status)).toBe(true);
    expect(hasWebsitePropertyStatus("reserved", "2026-09-01")).toBe(true);
    for (const status of ["reserved", null, "unknown"]) expect(hasWebsitePropertyStatus(status)).toBe(false);
    for (const status of ["reserved", null, "unknown"]) expect(hasWebsitePropertyStatus(status, "2026-09-01")).toBe(true);
    expect(hasWebsitePropertyStatus("reserved", "  ")).toBe(false);
  });

  it("visar bara aktuella tillgänglighetsdatum på hemsidan", () => {
    expect(hasCurrentPublicAvailability("available", "2026-10-31", "2026-11-01")).toBe(false);
    expect(hasCurrentPublicAvailability("available", "2026-11-01", "2026-11-01")).toBe(true);
    expect(hasCurrentPublicAvailability("available", null, "2026-11-01")).toBe(true);
    expect(hasCurrentPublicAvailability("rented", "2026-12-31", "2026-11-01")).toBe(false);
  });
});
