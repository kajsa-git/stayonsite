import { describe, expect, it } from "vitest";
import { hasPropertyPostalCode } from "./property-postal";

describe("hasPropertyPostalCode", () => {
  it.each([undefined, null, "", "   "])("nekar tomt värde: %s", (value) => {
    expect(hasPropertyPostalCode(value)).toBe(false);
  });

  it.each(["572 32", "57232"])("godkänner ifyllt postnummer: %s", (value) => {
    expect(hasPropertyPostalCode(value)).toBe(true);
  });
});
