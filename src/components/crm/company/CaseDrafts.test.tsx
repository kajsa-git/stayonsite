import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({ send: vi.fn(async (_url: string, _options?: unknown) => ({})), mutate: vi.fn(async () => undefined) }));
vi.mock("swr", () => ({ default: () => ({ data: [
  { id: "ours", contactId: "contact", toPhone: "+46701111111", body: "Hej Anna!" },
  { id: "other", contactId: "someone-else", toPhone: "+46702222222", body: "Fel mottagare" },
], mutate: mocked.mutate }) }));
vi.mock("@/lib/crm/fetcher", () => ({ crmFetchJson: mocked.send, crmErrorMessage: () => "fel", swrFetcher: vi.fn() }));
vi.mock("@/components/ui/use-toast", () => ({ toast: vi.fn() }));
import { CaseDrafts } from "./CaseDrafts";

describe("utkast i ärendevyn", () => {
  it("visar bara rätt kontakts utkast och köar först efter godkännande", async () => {
    render(<CaseDrafts contacts={[{ id: "contact", name: "Anna" }]} />);
    fireEvent.click(screen.getByText("SMS-utkast (1)"));
    expect(screen.queryByText("Fel mottagare")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Till Anna/), { target: { value: "Hej Anna, tack!" } });
    expect(mocked.send).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Godkänn och köa" }));
    await waitFor(() => expect(mocked.send).toHaveBeenCalledTimes(2));
    expect(mocked.send.mock.calls[0][0]).toBe("/api/crm/messages/ours");
    expect(mocked.send.mock.calls[1][1]).toMatchObject({ body: JSON.stringify({ action: "approve" }) });
  });
});
