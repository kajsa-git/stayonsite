import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { PublicProperty } from "@/lib/crm/public-property";
import { localizedPropertyDescription } from "@/lib/property-description";

const state = vi.hoisted(() => ({ language: "sv" as "sv" | "en" | "pl" }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => state }));
vi.mock("./ProspektGallery", () => ({ ProspektGallery: () => null }));
vi.mock("./ProspektMap", () => ({ ProspektMap: () => null }));
import { WebsitePropertyShowcase } from "./WebsitePropertyShowcase";
import { PropertyShowcase } from "./PropertyShowcase";

const row = { id: "p1", city: "Boden", publicDescription: "Möblerad lägenhet.", publicDescriptionEn: "Furnished apartment.", publicDescriptionPl: "Umeblowane mieszkanie.", inclusions: [], distances: [] } as PublicProperty["row"];
const data: PublicProperty = { row, images: [], mapArea: "Boden", mapCoords: null };
afterEach(() => { cleanup(); state.language = "sv"; });

describe("customer language for property descriptions", () => {
  it("follows the website language without letting the Swedish SEO override win", () => {
    const { rerender } = render(<WebsitePropertyShowcase data={data} title="Boende" description="Svensk SEO-text." />);
    expect(screen.getByText("Svensk SEO-text.")).toBeInTheDocument();
    state.language = "en";
    rerender(<WebsitePropertyShowcase data={data} title="Boende" description="Svensk SEO-text." />);
    expect(screen.getByText(row.publicDescriptionEn!)).toBeInTheDocument();
    expect(screen.queryByText("Svensk SEO-text.")).not.toBeInTheDocument();
    state.language = "pl";
    rerender(<WebsitePropertyShowcase data={data} title="Boende" description="Svensk SEO-text." />);
    expect(screen.getByText(row.publicDescriptionPl!)).toBeInTheDocument();
  });
  it.each(["sv", "en", "pl"] as const)("renders the selected prospect/offer language: %s", (lang) => {
    render(<PropertyShowcase data={data} title="Boende" lang={lang} />);
    expect(screen.getByText(localizedPropertyDescription(row, lang)!)).toBeInTheDocument();
  });
  it("does not fall back to Swedish if a selected translation is unavailable", () => {
    render(<PropertyShowcase data={{ ...data, row: { ...row, publicDescriptionEn: " " } }} title="Boende" lang="en" />);
    expect(screen.queryByText(row.publicDescription!)).not.toBeInTheDocument();
  });
});
