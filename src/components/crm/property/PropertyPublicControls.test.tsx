import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { PropertyPublicControls } from "./PropertyPublicControls";

afterEach(cleanup);

it("shows the HUS consent for this property and blocks a prospect link when consent is absent", () => {
  const property = { id: "p1", notes: "HUS webbpublicering (2026-11-02.1): inte godkänd.", contentReviewStatus: "approved" } as PropertyWithOwner;
  const { rerender } = render(<PropertyPublicControls property={property} onUpdate={vi.fn()} />);
  expect(screen.getByText("Publicering av den här bostaden är inte godkänd.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Publicera på hemsidan" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Aktivera prospekt-länk" })).toBeDisabled();
  rerender(<PropertyPublicControls property={{ ...property, publishConsentAt: "2026-11-05", publishConsentSource: "hus" }} onUpdate={vi.fn()} />);
  expect(screen.getByText("Publicering av den här bostaden är godkänd via HyrUtSmart.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Publicera på hemsidan" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Aktivera prospekt-länk" })).toBeEnabled();
});
