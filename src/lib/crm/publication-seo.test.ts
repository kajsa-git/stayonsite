import { describe, expect, it } from "vitest";
import {
  MIN_PUBLIC_DESCRIPTION_LENGTH,
  publicationSeoProblem,
  shouldValidatePublication,
} from "./publication-seo";

const description = "En saklig och unik extern beskrivning för företagsboendet med tillräckligt många tecken för publicering.";
const candidate = {
  id: "p2",
  published: true,
  status: "available",
  publicName: null,
  slug: "foretagsboende-svanskog-2-sovrum-2",
  publicDescription: description,
  city: "Svanskog",
  postalCode: "662 50",
  squareMeters: 72,
  bedrooms: 2,
  beds: 4,
} satisfies Parameters<typeof publicationSeoProblem>[0];

describe("SEO-spärr vid publicering", () => {
  it("körs när ett objekt blir synligt, men inte vid en orelaterad ändring", () => {
    expect(
      shouldValidatePublication({ published: false, status: "available" }, { published: true }, candidate),
    ).toBe(true);
    expect(
      shouldValidatePublication({ published: true, status: "available" }, { rentIn: 1000 }, candidate),
    ).toBe(false);
    expect(
      shouldValidatePublication({ published: true, status: "reserved" }, { status: "available" }, candidate),
    ).toBe(true);
  });

  it("kräver en meningsfull extern beskrivning", () => {
    const problem = publicationSeoProblem({ ...candidate, publicDescription: "Kort text" }, []);
    expect(problem).toContain(`${MIN_PUBLIC_DESCRIPTION_LENGTH} tecken`);
  });

  it("godkänner två auto-namn när den unika sluggen skiljer rubrikerna", () => {
    const problem = publicationSeoProblem(candidate, [
      {
        id: "p1",
        publicName: null,
        slug: "foretagsboende-svanskog-2-sovrum",
        publicDescription:
          "En annan unik beskrivning för det första publicerade boendet i Svanskog med gott om sakliga detaljer.",
        city: "Svanskog",
        bedrooms: 2,
        beds: 4,
      },
    ]);
    expect(problem).toBeNull();
  });

  it("stoppar identiska manuella namn och identiska beskrivningar", () => {
    const other = {
      id: "p1",
      publicName: "Unikt boende",
      slug: "annan-slug",
      publicDescription: description,
      city: "Svanskog",
      bedrooms: 2,
      beds: 4,
    };
    expect(publicationSeoProblem({ ...candidate, publicName: "Unikt boende" }, [other])).toContain(
      "publika namnet",
    );
    expect(publicationSeoProblem(candidate, [{ ...other, publicName: "Annat namn" }])).toContain(
      "beskrivningen är identisk",
    );
  });
});
