import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildWeeklyReport } from "@/lib/crm/weekly-report-data";
import { WeeklyReportView } from "./WeeklyReportView";

const mocks = vi.hoisted(() => ({ swr: vi.fn(), mutate: vi.fn() }));
vi.mock("swr", () => ({ default: mocks.swr }));

const report = buildWeeklyReport({ now: new Date("2026-10-13T12:00:00Z"), properties: [
  { id: "p1", address: "Testgatan 1", city: "Umeå", createdAt: "2026-10-12 10:00:00" },
  { id: "p2", address: "Testgatan 2", city: "Boden", createdAt: "2026-10-05 10:00:00" },
], requests: [
  { id: "r1", companyName: "Umeåbolaget", requestNumber: 100, city: "Umeå", createdAt: "2026-10-12 10:00:00" },
  { id: "r2", companyName: "Bodenbolaget", requestNumber: 101, city: "Boden", createdAt: "2026-10-12 10:00:00" },
] });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.swr.mockReturnValue({ data: report, isLoading: false, isValidating: false, mutate: mocks.mutate });
});
afterEach(cleanup);

describe("Veckorapport", () => {
  it("filtrerar ort och visar samma underlag som den klickade siffran", () => {
    render(<WeeklyReportView />);
    fireEvent.change(screen.getByLabelText("Ort"), { target: { value: "area:umea" } });
    const metrics = screen.getByRole("region", { name: "Umeå · v. 42, 2026 · pågår" });
    fireEvent.click(within(metrics).getByRole("button", { name: /Nya förfrågningar: 1/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Nya förfrågningar: 1" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /#100 · Umeåbolaget/ })).toHaveAttribute("href", "/crm/matching/r1");
    expect(within(dialog).queryByText(/Bodenbolaget/)).not.toBeInTheDocument();
  });

  it("byter vald vecka från diagrammet och kan begära 12 avslutade veckor", () => {
    render(<WeeklyReportView />);
    fireEvent.click(screen.getByRole("button", { name: "Vecka 41, 2026: 1 boenden och 0 förfrågningar" }));
    expect(screen.getByLabelText("Vecka för ortstabellen")).toHaveValue("2026-10-05");
    const metrics = screen.getByRole("region", { name: "Alla orter · v. 41, 2026" });
    expect(within(metrics).getByRole("button", { name: /Nya förfrågningar: 0/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Ta med pågående vecka" }));
    expect(mocks.swr.mock.calls.at(-1)?.[0]).toBe("/api/crm/weekly-report?includeCurrent=0");
  });

  it("visar hämtningsfel med möjlighet att försöka igen", () => {
    mocks.swr.mockReturnValue({ data: undefined, error: new Error("Databasen svarar inte"), isLoading: false, isValidating: false, mutate: mocks.mutate });
    render(<WeeklyReportView />);
    expect(screen.getByRole("alert")).toHaveTextContent("Databasen svarar inte");
    expect(screen.queryByRole("heading", { name: "Jämför 12 veckor" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Försök igen" }));
    expect(mocks.mutate).toHaveBeenCalledOnce();
  });
});
