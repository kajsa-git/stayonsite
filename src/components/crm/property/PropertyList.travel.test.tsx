import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PropertyList } from "./PropertyList";

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("./PropertyView", () => ({ PropertyView: () => null }));
vi.mock("./OwnerPicker", () => ({ OwnerPicker: () => null }));
vi.mock("./PropertyIntakeSharePanel", () => ({ PropertyIntakeSharePanel: () => null }));
vi.mock("swr", () => ({ default: (url: string) => ({
  data: url.includes("q=Stockholm") ? [] : [
    { id: "near", address: "Dånviksvägen 30", city: "Rönninge", status: "available" },
    { id: "far", address: "För långt bort", city: "Uppsala", status: "available" },
    { id: "rented", address: "Redan uthyrd", city: "Stockholm", status: "rented" },
    { id: "unknown", address: "Saknar restid", city: "Valbo", status: "available" },
  ], mutate: vi.fn(), isLoading: false,
}) }));
vi.mock("@/hooks/use-travel-distances", () => ({ useTravelDistances: () => ({
  status: "ready", results: {
    near: { durationSeconds: 1800, durationText: "30 min" },
    far: { durationSeconds: 1801, durationText: "30 min" },
    rented: { durationSeconds: 60, durationText: "1 min" },
  },
}) }));

describe("inventory travel search", () => {
  it("finds available housing in other cities, excluding long, rented and unknown routes", () => {
    render(<PropertyList />);
    fireEvent.change(screen.getByPlaceholderText("Sök bostäder…"), { target: { value: "Stockholm" } });
    expect(screen.queryByText("Dånviksvägen 30")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tillgängliga inom 30 min med bil" }));
    expect(screen.getByText("Dånviksvägen 30")).toBeInTheDocument();
    expect(screen.queryByText("För långt bort")).not.toBeInTheDocument();
    expect(screen.queryByText("Redan uthyrd")).not.toBeInTheDocument();
    expect(screen.queryByText("Saknar restid")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("saknar restid");
    fireEvent.change(screen.getByPlaceholderText("Sök bostäder…"), { target: { value: "Gävle" } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
