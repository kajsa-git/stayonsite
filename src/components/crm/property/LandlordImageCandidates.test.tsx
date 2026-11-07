import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("swr", () => ({ default: () => ({ data: { candidates: [{ id: "image", fileName: "rum.jpg", status: "needs_review", error: "Kontrollera bilden", gmailMessageId: "mail", url: "https://example.test/room.jpg" }] }, mutate: state.mutate }), useSWRConfig: () => ({ mutate: state.mutate }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { LandlordImageCandidates } from "./LandlordImageCandidates";

beforeEach(() => {
  state.mutate.mockReset();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ imageId: "image" }) }));
});

it("shows the public-content impact before a person adds a private image", async () => {
  render(<LandlordImageCandidates propertyId="property" />);
  fireEvent.click(screen.getByRole("button", { name: "Lägg till i galleriet" }));
  expect(screen.getByText(/visningen på hemsidan eller i prospekt tillfälligt påverkas/)).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Lägg till bilden" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/crm/properties/property/landlord-images", expect.objectContaining({ method: "POST", body: JSON.stringify({ candidateId: "image", acceptedPublicImpact: true }) })));
});
