import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  link: { audience: "landlord", ownerId: "owner", matchId: null, createdBy: null },
  standing: { portalAllowed: false },
  imageProperties: [{ id: "p1", address: "Gatan 1", city: "Boden" }],
}));
vi.mock("@/lib/crm/share-links", () => ({ resolveShareLink: vi.fn(async () => state.link), isCurrentLandlordMatchLink: vi.fn() }));
vi.mock("@/lib/crm/deal-projection", () => ({ loadLandlordStanding: vi.fn(async () => state.standing), loadLandlordDeal: vi.fn() }));
vi.mock("@/lib/crm/publish-consent", () => ({ loadPublishConsentState: vi.fn(async () => ({ pending: [], consented: [] })) }));
vi.mock("@/lib/crm/landlord-properties", () => ({
  loadLandlordProperties: vi.fn(async () => []),
  loadConsentedImageProperties: vi.fn(async () => state.imageProperties),
}));
vi.mock("@/components/erbjudande/PublishConsentCard", () => ({ PublishConsentCard: () => null }));
vi.mock("@/components/erbjudande/PublicationWithdrawal", () => ({ PublicationWithdrawal: () => null }));
vi.mock("@/components/erbjudande/AgreementGate", () => ({ AgreementGate: () => null }));
vi.mock("@/components/erbjudande/LandlordPropertyForm", () => ({
  LandlordPropertyForm: ({ property, photosOnly }: { property: { address: string }; photosOnly?: boolean }) =>
    <div data-testid={photosOnly ? "photos-only" : "full-editor"}>{property.address}</div>,
}));
import UthyrarePage from "../../../app/uthyrare/[token]/page";

afterEach(() => cleanup());

it("visar en bilddel för en bostad med registrerat medgivande utan att öppna den fullständiga portalen", async () => {
  render(await UthyrarePage({ params: Promise.resolve({ token: "owner-token" }) }));
  expect(screen.getByRole("heading", { name: "Lägg till bilder" })).toBeInTheDocument();
  expect(screen.getByTestId("photos-only")).toHaveTextContent("Gatan 1");
  expect(screen.queryByTestId("full-editor")).not.toBeInTheDocument();
});
