import { describe, expect, it } from "vitest";
import { isFreemailDomain } from "./contact-intake";

// Freemail-spärren: privata mejlleverantörer ska aldrig skrapas som
// företagsnamn — hela mejladressen används som fallback i stället.
describe("isFreemailDomain", () => {
  it("känner igen vanliga privata leverantörer", () => {
    for (const d of ["gmail.com", "hotmail.se", "outlook.com", "icloud.com", "telia.se", "yahoo.com"]) {
      expect(isFreemailDomain(d), d).toBe(true);
    }
  });

  it("är okänslig för skiftläge och whitespace", () => {
    expect(isFreemailDomain(" Gmail.COM ")).toBe(true);
    expect(isFreemailDomain("HOTMAIL.SE")).toBe(true);
  });

  it("släpper igenom företagsdomäner", () => {
    for (const d of ["victorenergy.se", "nordarmering.se", "sonarp-rental.se", "gmail.se.example.com"]) {
      expect(isFreemailDomain(d), d).toBe(false);
    }
  });
});
