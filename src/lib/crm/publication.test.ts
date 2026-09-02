import { describe, expect, it } from "vitest";
import { publicListingPatch } from "./publication";

describe("publicListingPatch", () => {
  it("gör ett publicerat objekt tillgängligt så att detaljlänken fungerar", () => {
    expect(publicListingPatch(true)).toEqual({ published: true, status: "available" });
  });

  it("ändrar inte affärsstatus när objektet avpubliceras", () => {
    expect(publicListingPatch(false)).toEqual({ published: false });
  });
});
