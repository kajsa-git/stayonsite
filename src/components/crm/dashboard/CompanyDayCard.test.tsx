import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompanyDayCard, QueueSection, contactAge, nextStepFor } from "./MyDayView";

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

describe("nästa steg och kontaktålder", () => {
  it("visar återkomstens skäl först, annars förfrågans läge", () => {
    expect(nextStepFor({ ...base, openRequests: [first] }, "followup")).toBe("Väntar på svar");
    expect(nextStepFor({ ...base, followUpReason: null, openRequests: [first] }, "open")).toBe("Kvalificera förfrågan #101");
    expect(nextStepFor({ ...base, followUpReason: null, openRequests: [second] }, "open")).toBe("Hitta boende och skicka förslag #102");
    expect(nextStepFor({ ...base, openRequests: [first, second] }, "open")).toMatch(/Välj vilken av 2/);
    const won = { ...first, status: "won", moveInChecklist: [] };
    expect(nextStepFor({ ...base, openRequests: [won] }, "agreement")).toBe("Skicka avtalet #101");
  });

  it("räknar dagar sedan senaste kontakt och flaggar efter en vecka", () => {
    expect(contactAge(null, "2026-10-28")).toEqual({ text: "Ingen kontakt", stale: true });
    expect(contactAge("2026-10-28T09:00:00", "2026-10-28")).toEqual({ text: "Idag", stale: false });
    expect(contactAge("2026-10-27 18:00:00", "2026-10-28").text).toBe("Igår");
    expect(contactAge("2026-10-24T10:00:00Z", "2026-10-28")).toEqual({ text: "4 d sedan", stale: false });
    expect(contactAge("2026-10-20T10:00:00Z", "2026-10-28").stale).toBe(true);
  });

  it("visar ringknapp när kontakten har telefon", () => {
    render(<CompanyDayCard item={{ ...base, contactName: "Lisa Berg", contactPhone: "070-123 45 67", openRequests: [first] }} today="2026-10-28" variant="followup" onOpen={vi.fn()} onSnooze={vi.fn()} onSchedule={vi.fn()} onMarkLost={vi.fn()} />);
    expect(screen.getByRole("link", { name: /Ring Lisa/ })).toHaveAttribute("href", "tel:+46701234567");
  });
});
