import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LandlordPropertyForm } from "./LandlordPropertyForm";
import type { LandlordProperty } from "@/lib/crm/landlord-property-input";
vi.mock("@/lib/image-compress", () => ({ compressImage: async (file: File) => file }));
const property: LandlordProperty = {
  id: "p1", address: "Testgatan 1", city: "Teststad", publicDescription: "Ljust hus",
  rentIn: 9000, bedrooms: 3, beds: 4, squareMeters: 100,
  availability: null, moveInFrom: null, availableTo: null,
};
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("förifyller, sparar rätt bostad och visar bekräftelse", async () => {
  const fetcher = vi.fn(async (_url: string, options?: RequestInit) =>
    new Response(JSON.stringify(options?.method === "PATCH" ? { ok: true } : [])));
  vi.stubGlobal("fetch", fetcher);
  render(<LandlordPropertyForm token="test" property={property} />);
  expect(screen.getByLabelText("Önskad hyra (kr/månad)")).toHaveValue(9000);
  fireEvent.change(screen.getByLabelText("Antal bäddar"), { target: { value: "6" } });
  fireEvent.click(screen.getByRole("button", { name: "Spara uppgifter" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Dina uppgifter är sparade");
  const save = fetcher.mock.calls.find((call) => call[1]?.method === "PATCH")!;
  expect(save[0]).toBe("/api/share/test/properties/p1");
  expect(JSON.parse(save[1]!.body as string)).toMatchObject({ beds: 6, rentIn: 9000, moveInFrom: null });
});
it("behåller inmatning efter ett serverfel", async () => {
  vi.stubGlobal("fetch", vi.fn(async (_url: string, options?: RequestInit) => options?.method === "PATCH"
    ? new Response(JSON.stringify({ error: "Försök igen" }), { status: 500 })
    : new Response("[]")));
  render(<LandlordPropertyForm token="test" property={property} />);
  fireEvent.change(screen.getByLabelText("Antal bäddar"), { target: { value: "7" } });
  fireEvent.click(screen.getByRole("button", { name: "Spara uppgifter" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Försök igen");
  expect(screen.getByLabelText("Antal bäddar")).toHaveValue(7);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it("försöker bara om misslyckade bilder efter en delvis lyckad uppladdning", async () => {
  let attempts = 0;
  const fetcher = vi.fn(async (_url: string, options?: RequestInit) => {
    if (options?.method !== "POST") return new Response("[]");
    attempts++;
    return attempts === 2 ? new Response(JSON.stringify({ error: "Tillfälligt fel" }), { status: 500 })
      : new Response(JSON.stringify({ id: `img-${attempts}` }), { status: 201 });
  });
  vi.stubGlobal("fetch", fetcher);
  render(<LandlordPropertyForm token="test" property={property} />);
  const first = new File(["one"], "one.jpg", { type: "image/jpeg" });
  const second = new File(["two"], "two.jpg", { type: "image/jpeg" });
  fireEvent.change(screen.getByLabelText("Lägg till bilder (upp till 10 åt gången)"), { target: { files: [first, second] } });
  fireEvent.click(screen.getByRole("button", { name: "Ladda upp bilder" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("two.jpg: Tillfälligt fel");
  fireEvent.click(screen.getByRole("button", { name: "Ladda upp bilder" }));
  await waitFor(() => expect(attempts).toBe(3));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  const uploads = fetcher.mock.calls.filter((call) => call[1]?.method === "POST");
  expect(((uploads[2][1]!.body as FormData).get("file") as File).name).toBe("two.jpg");
});
