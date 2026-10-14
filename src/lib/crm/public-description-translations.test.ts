import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("./property-translations", () => ({ translatePropertyText: vi.fn() }));
import { translatePropertyText } from "./property-translations";
import { completePublicDescription } from "./public-description-translations";

afterEach(() => vi.restoreAllMocks());
describe("older public property translations", () => {
  it("completes old descriptions without changing their source or publication flags", async () => {
    vi.mocked(translatePropertyText).mockResolvedValue({ publicDescriptionEn: "Apartment", publicDescriptionPl: "Mieszkanie", skickEn: "", skickPl: "", inclusionsEn: [], inclusionsPl: [] });
    const original = { publicDescription: "Lägenhet", publicDescriptionEn: "Reviewed English", publicDescriptionPl: null, published: true, contentReviewStatus: "approved" };
    expect(await completePublicDescription(original)).toEqual({ ...original, publicDescriptionPl: "Mieszkanie" });
    expect(original.publicDescriptionPl).toBeNull();
  });
  it("rejects unsafe translated text and keeps the source usable during an outage", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const original = { publicDescription: "Lägenhet" };
    vi.mocked(translatePropertyText).mockResolvedValue({ publicDescriptionEn: "Rent: 9000 SEK", publicDescriptionPl: "Mieszkanie", skickEn: "", skickPl: "", inclusionsEn: [], inclusionsPl: [] });
    expect(await completePublicDescription(original)).toBe(original);
    vi.mocked(translatePropertyText).mockRejectedValue(new Error("unavailable"));
    expect(await completePublicDescription(original)).toBe(original);
  });
});
