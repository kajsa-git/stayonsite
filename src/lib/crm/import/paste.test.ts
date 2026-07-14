import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseBooliText, parseHemnetText } from "./paste";

// Fixtures = riktig sidtext (body.innerText) från annonserna, fångad 2026-07-14.
// Ändrar sajterna sin struktur ska felet synas här — inte hos Kajsa mitt i ett intag.
const fx = (name: string) => fs.readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");

describe("parseHemnetText", () => {
  const listing = parseHemnetText(fx("hemnet-page.txt"), "https://www.hemnet.se/bostad/lagenhet-2rum-arsta-21755129");

  it("plockar adress, stad och land", () => {
    expect(listing.address).toBe("Malgomajvägen 19");
    expect(listing.city).toBe("Stockholm");
    expect(listing.country).toBe("Sverige");
  });

  it("plockar yta och sovrum (rum − 1)", () => {
    expect(listing.squareMeters).toBe(57);
    expect(listing.bedrooms).toBe(1); // "2 rum" → 1 sovrum
  });

  it("sätter ALDRIG hyra från en säljannons — ekonomin hamnar i anteckningarna", () => {
    expect(listing.rentIn).toBeNull();
    expect(listing.notes).toContain("Utgångspris 3 195 000 kr");
    expect(listing.notes).toContain("Avgift 4 457 kr/mån");
    expect(listing.notes).toContain("Import från Hemnet");
  });

  it("tar med annonsens beskrivning i anteckningarna", () => {
    expect(listing.notes).toContain("ljus och trivsam lägenhet");
  });
});

describe("parseBooliText", () => {
  const listing = parseBooliText(fx("booli-page.txt"), "https://www.booli.se/bostad/4393931");

  it("plockar adress och stad", () => {
    expect(listing.address).toBe("Olles gata 2");
    expect(listing.city).toBe("Kungälv");
  });

  it("plockar yta och sovrum", () => {
    expect(listing.squareMeters).toBe(66);
    expect(listing.bedrooms).toBe(2); // "3 rum" → 2 sovrum
  });

  it("ekonomi och fakta i anteckningarna, ingen hyra", () => {
    expect(listing.rentIn).toBeNull();
    expect(listing.notes).toContain("Utropspris 2 795 000 kr");
    expect(listing.notes).toContain("Avgift 6 054 kr/mån");
    expect(listing.notes).toContain("Byggår 2023");
    expect(listing.notes).toContain("Hiss");
  });
});
