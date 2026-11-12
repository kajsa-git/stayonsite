import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PUBLICATION_CONSENT_VERSION } from "@/lib/crm/publication-consent-text";
import { PublishConsentCard } from "./PublishConsentCard";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("asks only for publication and sends approval for the homes explicitly selected", async () => {
  const send = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ ok: true }), { status: 201 }));
  vi.stubGlobal("fetch", send);
  render(<PublishConsentCard token="token" properties={[
    { id: "p1", address: "Gatan 1", city: "Boden" },
    { id: "p2", address: "Gatan 2", city: "Boden" },
  ]} />);
  expect(screen.queryByText(/vite|förmedlingsskydd/i)).not.toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: "Gatan 1, Boden" })).not.toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Gatan 2, Boden" })).not.toBeChecked();
  fireEvent.change(screen.getByLabelText("Ditt namn"), { target: { value: "Anna Andersson" } });
  fireEvent.click(screen.getByRole("checkbox", { name: "Gatan 1, Boden" }));
  fireEvent.click(screen.getByRole("button", { name: "Godkänn publicering" }));
  await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
  const [url, options] = send.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("/api/share/token/publish-consent");
  expect(JSON.parse(String(options.body))).toMatchObject({ name: "Anna Andersson", propertyIds: ["p1"], version: PUBLICATION_CONSENT_VERSION });
  await waitFor(() => expect(screen.getByText("Gatan 2, Boden")).toBeInTheDocument());
});
