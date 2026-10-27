import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Property } from "@/lib/crm/schema";
import { PropertyHistory } from "./PropertyHistory";

const data = vi.hoisted(() => ({
  notes: [
    { id: "one", channel: "sms", content: "Senaste kontakten. ".repeat(20), createdAt: "2026-10-26T17:00:00Z" },
    { id: "two", channel: "mejl", content: "Andra kontakten", createdAt: "2026-10-25T17:00:00Z" },
    { id: "three", channel: "anteckning", content: "Äldre kontakt", createdAt: "2026-10-24T17:00:00Z" },
  ],
  rounds: [{ id: "round", status: "i_dialog", nextFollowUpDate: "2026-10-27", nextFollowUpReason: "Kolla pris", note: "Väntar på svar", startedAt: "2026-10-01T10:00:00Z" }],
}));
vi.mock("swr", () => ({ default: (key: string) => ({ data: key.endsWith("/notes") ? data.notes : key.endsWith("/outreach") ? data.rounds : [], mutate: vi.fn() }) }));
afterEach(cleanup);

describe("property contact history", () => {
  it("keeps follow-up visible and lets the user expand older and longer notes", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<PropertyHistory property={{ id: "property" } as Property} />);
    expect(screen.getByLabelText("Nästa uppföljning")).toHaveValue("2026-10-27");
    expect(screen.getByLabelText("Anledning")).toHaveValue("Kolla pris");
    expect(screen.queryByText("Äldre kontakt")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Visa hela anteckningen" }));
    expect(screen.getByRole("button", { name: "Visa mindre" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Visa alla 3 loggposter" }));
    expect(screen.getByText("Äldre kontakt")).toBeInTheDocument();
    expect(screen.getByLabelText("Kontaktkanal")).toHaveValue("anteckning");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
