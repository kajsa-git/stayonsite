import { describe, expect, it } from "vitest";
import { hasWebsitePropertyStatus, publicListingPatch } from "./publication";

describe("publicListingPatch", () => {
  it("publicerar utan att ändra objektets uthyrningsstatus", () => {
    expect(publicListingPatch(true)).toEqual({ published: true });
  });

  it("ändrar inte affärsstatus när objektet avpubliceras", () => {
    expect(publicListingPatch(false)).toEqual({ published: false });
  });

  it("tillåter publicerade tillgängliga, uthyrda och objekt av marknaden", () => {
    for (const status of ["available", "rented", "off_market"]) expect(hasWebsitePropertyStatus(status)).toBe(true);
    for (const status of ["reserved", null, "unknown"]) expect(hasWebsitePropertyStatus(status)).toBe(false);
  });
});
