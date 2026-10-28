import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Request } from "@/lib/crm/schema";
import { RequestStatusActions } from "./RequestStatusActions";
import { RequestsList } from "./RequestsList";

vi.mock("./RequestCard", () => ({
  RequestCard: ({ request }: { request: Request }) => <div>Detaljer för #{request.requestNumber}</div>,
}));

const first = { id: "first", companyId: "company", requestNumber: 101, city: "Boden", status: "incoming", createdAt: "2026-10-27" } as Request;
const second = { id: "second", companyId: "company", requestNumber: 102, city: "Luleå", status: "matching", createdAt: "2026-10-28", wonPropertyId: "property" } as Request;

describe("val av enskild förfrågan", () => {
  it("visar en kompakt väljare innan detaljerna öppnas", () => {
    const select = vi.fn();
    const { rerender } = render(<RequestsList requests={[first, second]} companyId="company" focusOnly onNewRequest={vi.fn()} onSelectRequest={select} />);
    expect(screen.queryByText("Detaljer för #101")).not.toBeInTheDocument();
    expect(screen.queryByText("Detaljer för #102")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /#102.*Luleå/ }));
    expect(select).toHaveBeenCalledWith("second");

    rerender(<RequestsList requests={[first, second]} companyId="company" focusOnly activeRequestId="second" onNewRequest={vi.fn()} onSelectRequest={select} />);
    expect(screen.getByText("Detaljer för #102")).toBeInTheDocument();
    expect(screen.getByText("Visa övriga förfrågningar (1)").closest("details")).not.toHaveAttribute("open");
  });

  it("bekräftar exakt vilken förfrågan som flyttas till avtal", async () => {
    const statusChange = vi.fn().mockResolvedValue(undefined);
    render(<RequestStatusActions request={second} onStatusChange={statusChange} onMatch={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Till avtal" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/förfrågan #102/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Luleå.*reserveras/)).toBeInTheDocument();
    expect(statusChange).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Till avtal" }));
    await waitFor(() => expect(statusChange).toHaveBeenCalledWith("second", "won", undefined));
  });
});
