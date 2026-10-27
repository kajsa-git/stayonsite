import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { PropertyView } from "./PropertyView";

vi.mock("swr", () => ({ default: () => ({ data: [] }) }));
vi.mock("@/components/crm/ProfitCalculatorDialog", () => ({ ProfitCalculatorDialog: () => null }));
vi.mock("./MatchToRequestModal", () => ({ MatchToRequestModal: () => null }));
vi.mock("./PropertyContentReview", () => ({ PropertyContentReview: () => null }));
vi.mock("./PropertyPublicControls", () => ({ PropertyPublicControls: () => null }));
vi.mock("./PropertyImages", () => ({ PropertyImages: () => null }));
vi.mock("./PropertyHistory", () => ({ PropertyHistory: () => null }));
vi.mock("./PropertyEditForm", () => ({ PropertyEditForm: () => null }));
vi.mock("@/components/crm/AgreementStatusPanel", () => ({ AgreementStatusPanel: () => null }));
vi.mock("@/components/crm/email/EmailThread", () => ({ EmailThread: () => null }));
vi.mock("@/components/crm/PhoneActions", () => ({ PhoneActions: () => null }));
vi.mock("../RatingControl", () => ({ RatingControl: () => null }));
vi.mock("@/components/crm/ReviewRequestSnippet", () => ({ ReviewRequestSnippet: () => null }));
afterEach(cleanup);

describe("property status", () => {
  it("does not show an unspecified status as available or save it without a selection", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<PropertyView property={{ id: "test", address: "Exempelvägen", status: null } as PropertyWithOwner} onUpdate={onUpdate} />);
    const status = screen.getByLabelText("Status");
    expect(status).toHaveValue("");
    expect(screen.getByRole("option", { name: "Ej angiven" })).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
    fireEvent.change(status, { target: { value: "reserved" } });
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith({ status: "reserved" }));
  });
});
