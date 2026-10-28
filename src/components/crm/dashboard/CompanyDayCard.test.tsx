import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompanyDayCard, QueueSection } from "./MyDayView";

const base = { id: "company", name: "Testbolaget", followUpDate: "2026-10-28", followUpReason: "Väntar på svar" };
const first = { id: "one", companyId: "company", requestNumber: 101, city: "Boden", status: "incoming" };
const second = { id: "two", companyId: "company", requestNumber: 102, city: "Luleå", status: "matching" };

describe("beslut på företagets dagskort", () => {
  it("kräver val av förfrågan när flera är öppna", () => {
    const open = vi.fn();
    const won = vi.fn();
    render(<CompanyDayCard item={{ ...base, openRequests: [first, second] }} today="2026-10-28" variant="followup" onOpen={open} onSnooze={vi.fn()} onSchedule={vi.fn()} onMarkWon={won} onMarkLost={vi.fn()} />);
    expect(screen.getByText(/#101/)).toBeInTheDocument();
    expect(screen.getByText(/#102/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Till avtal/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Nej/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Välj förfrågan" }));
    expect(open).toHaveBeenCalledOnce();
    expect(won).not.toHaveBeenCalled();
  });

  it("behåller snabbvalet när det bara finns ett ärende", async () => {
    const won = vi.fn();
    render(<CompanyDayCard item={{ ...base, openRequests: [first] }} today="2026-10-28" variant="followup" onOpen={vi.fn()} onSnooze={vi.fn()} onSchedule={vi.fn()} onMarkWon={won} onMarkLost={vi.fn()} />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Till avtal/ })); });
    expect(won).toHaveBeenCalledOnce();
  });
});

it("visar ett begränsat antal uthyraråterkomster tills användaren öppnar resten", () => {
  render(<QueueSection title="Följ upp uthyrare" emoji="" items={[1, 2, 3, 4, 5, 6, 7]} initialLimit={5} emptyText="Tomt" renderItem={(item) => <span key={item}>Ärende {item}</span>} />);
  expect(screen.getByText("Ärende 5")).toBeInTheDocument();
  expect(screen.queryByText("Ärende 6")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Visa 2 till" }));
  expect(screen.getByText("Ärende 6")).toBeInTheDocument();
  expect(screen.getByText("Ärende 7")).toBeInTheDocument();
});
