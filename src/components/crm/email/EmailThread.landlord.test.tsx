import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ dialogs: [] as unknown[], mutate: vi.fn() }));
vi.mock("swr", () => ({ default: (key: string | null) => ({
  data: key?.includes("/landlord-dialogs") ? { dialogs: state.dialogs } : key ? [{
    id: "mail", ownerId: "owner", direction: "in", subject: "Huset", body: "Hej", fromEmail: "anna@example.com",
    toEmail: "kajsa@example.com", sentAt: "2026-11-06T12:00:00Z", gmailThreadId: "thread-1", isRead: true,
  }] : undefined,
  mutate: state.mutate,
}) }));
vi.mock("./EmailComposeModal", () => ({ EmailComposeModal: () => null }));
vi.mock("./EmailLogModal", () => ({ EmailLogModal: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { EmailThread } from "./EmailThread";

beforeEach(() => {
  state.dialogs = [];
  state.mutate.mockReset();
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({}) })));
});

describe("automatiska svar per bostadstråd", () => {
  it("enrols only the thread and property the user selected", async () => {
    render(<EmailThread ownerId="owner" propertyId="property" />);
    fireEvent.click(screen.getByText("Huset"));
    fireEvent.click(screen.getByRole("button", { name: "Slå på" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/crm/landlord-dialogs", expect.objectContaining({
      method: "POST", body: JSON.stringify({ propertyId: "property", gmailThreadId: "thread-1" }),
    })));
  });

  it("shows a review requirement and resolves it only on explicit action", async () => {
    state.dialogs = [{ id: "dialog", gmailThreadId: "thread-1", active: true,
      recentRuns: [{ gmailMessageId: "in-1", status: "send_uncertain", requiresReview: true }] }];
    render(<EmailThread ownerId="owner" propertyId="property" />);
    fireEvent.click(screen.getByText("Huset"));
    expect(screen.getByText(/Kontrollera i Gmail/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Jag har kontrollerat" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/crm/landlord-dialogs", expect.objectContaining({
      method: "PUT", body: JSON.stringify({ gmailMessageId: "in-1", checked: true }),
    })));
  });
  it("asks for image handling even after a successful reply", async () => {
    state.dialogs = [{ id: "dialog", gmailThreadId: "thread-1", active: true,
      recentRuns: [{ gmailMessageId: "in-1", status: "sent", attachmentsNeedReview: true, requiresReview: true }] }];
    render(<EmailThread ownerId="owner" propertyId="property" />);
    fireEvent.click(screen.getByText("Huset"));
    expect(screen.getByText(/bilder i mejlet/)).toBeInTheDocument();
    expect(screen.queryByText(/Kontrollera i Gmail om ett svar/)).not.toBeInTheDocument();
    await waitFor(() => expect(state.mutate).toHaveBeenCalled());
  });
});
