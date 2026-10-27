import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { describeReviewReason, PropertyContentReview } from "./PropertyContentReview";

vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: vi.fn() }) }));
afterEach(cleanup);

describe("property review messages", () => {
  const validationError = JSON.stringify([
    { code: "too_small", path: ["publicName"], message: "String must contain at least 1 character(s)" },
    { code: "too_small", path: ["publicDescriptionEn"], message: "String must contain at least 1 character(s)" },
  ]);

  it("explains a validation error as a problem with the review response, retaining its details", () => {
    const result = describeReviewReason(validationError);
    expect(result.message).toContain("Kontrollen fick ett svar som inte kunde användas");
    expect(result.message).toContain("namn för visning, engelsk beskrivning");
    expect(result.message).not.toContain("saknas");
    expect(result.technical).toBe(validationError);
  });

  it("keeps ordinary reasons intact and makes technical details available", () => {
    expect(describeReviewReason("Bilder saknas. Lägg till bilder av boendet.").message).toBe("Bilder saknas. Lägg till bilder av boendet.");
    const property = { id: "test", contentReviewStatus: "retry", contentReviewReport: { reasons: [validationError], images: [], version: 1 } } as PropertyWithOwner;
    render(<PropertyContentReview property={property} />);
    expect(screen.getByText(/Kontrollen fick ett svar som inte kunde användas/)).toBeInTheDocument();
    expect(screen.getByText("Visa teknisk information")).toBeInTheDocument();
    expect(screen.getByText(validationError)).toBeInTheDocument();
  });

  it("keeps unfamiliar structured errors out of the main view without discarding them", () => {
    const error = '{"unexpected":"detail"}';
    expect(describeReviewReason(error)).toEqual({
      message: "Kontrollen kunde inte slutföras. Försök köra kontrollen igen.",
      technical: error,
    });
  });
});
