import { describe, expect, it } from "vitest";
import { propertyRentalRight, propertyRentalRightLabel } from "./property-rental-right";

const oldSublet = "Uthyrarens uppgift: Hyr ut i andra hand med godkännande från fastighetsägaren eller bostadsrättsföreningen.\nBostadstyp: Hus / villa";
const oldOwned = "Uthyrarens uppgift: Privatpersonen äger bostaden.\nBostadstyp: Lägenhet";

describe("propertyRentalRight", () => {
  it("reads old HUS choices only from their explicit marker", () => {
    expect(propertyRentalRight(null, oldSublet)).toBe("andrahand");
    expect(propertyRentalRight(null, oldOwned)).toBe("ager");
    expect(propertyRentalRight(null, "Fråga om andrahandsuthyrning är möjlig")).toBeNull();
    expect(propertyRentalRight(null, null)).toBeNull();
  });
  it("prefers the saved property value, including an explicit unknown", () => {
    expect(propertyRentalRight("ager", oldSublet)).toBe("ager");
    expect(propertyRentalRight("andrahand", oldOwned)).toBe("andrahand");
    expect(propertyRentalRight("okand", oldSublet)).toBeNull();
    expect(propertyRentalRightLabel("andrahand")).toBe("Andrahandsuthyrning");
  });
});
