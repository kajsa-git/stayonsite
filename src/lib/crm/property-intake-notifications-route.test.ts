import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { File as NodeFile } from "node:buffer";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { createTestDb, type TestDB } from "./test-db";
import { propertyIntakeNotifications } from "./schema";
import { HUS_INTAKE_VERSION } from "./hus-publication";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, send: vi.fn(), put: vi.fn() }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("resend", () => ({ Resend: class { emails = { send: state.send }; } }));
vi.mock("./r2", () => ({ r2: { send: state.put }, R2_BUCKET: "test-bucket" }));
vi.mock("./image-variants", () => ({ createImageVariants: vi.fn().mockResolvedValue({ thumbKey: null, displayKey: null }) }));
vi.mock("./image-dedup", () => ({ existingImageHashes: vi.fn().mockResolvedValue(new Set()), imageContentHash: vi.fn().mockReturnValue("hash") }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));
vi.mock("@/lib/meta-conversions", () => ({ sendMetaLeadEvent: vi.fn().mockResolvedValue(undefined) }));
vi.mock("./share-links", async (importOriginal) => {
  const original = await importOriginal<typeof import("./share-links")>();
  return { ...original, ensureShareLink: vi.fn(original.ensureShareLink) };
});

import { POST as submitIntake } from "../../../app/api/crm/property-intake/route";
import { POST as uploadImage, PATCH as finishImages } from "../../../app/api/share/[token]/properties/[id]/images/route";
import { GET as sweep } from "../../../app/api/cron/property-intake-notifications/route";
import { ensureShareLink } from "./share-links";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("intake-notification-route"));
  vi.clearAllMocks();
  vi.stubEnv("RESEND_API_KEY", "test-key");
  vi.stubEnv("RESEND_FROM", "StayOnSite <test@example.test>");
  vi.stubEnv("CONTACT_FORM_TO", "kajsa@example.test");
  vi.stubEnv("CRON_SECRET", "test-cron-secret");
  vi.stubGlobal("File", NodeFile);
  state.send.mockResolvedValue({ data: { id: "mail-id" }, error: null });
  state.put.mockResolvedValue({});
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function submit(expectedImageCount: number, extra: Record<string, unknown> = {}) {
  const body = new FormData();
  body.append("payload", JSON.stringify({
    ownerName: "Anna Exempel", ownerPhone: "0701234567", ownerType: "privatperson",
    address: "Testgatan 1", postalCode: "12345", city: "Boden", country: "Sverige",
    bedrooms: 1, beds: 1, consent: true, expectedImageCount, ...extra,
  }));
  const response = await submitIntake(new NextRequest("https://example.test/api/crm/property-intake", { method: "POST", body }));
  expect(response.status).toBe(201);
  return await response.json() as { propertyId: string; agreement: { token: string } };
}

describe("public property intake notification flow", () => {
  it("sends the notice only after the image upload and counts database rows", async () => {
    const intake = await submit(2);
    expect(state.send).not.toHaveBeenCalled();
    const params = Promise.resolve({ token: intake.agreement.token, id: intake.propertyId });
    for (let index = 0; index < 2; index++) {
      const file = new NodeFile([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, index])], `rum${index}.png`, { type: "image/png" });
      const request = new NextRequest("https://example.test/image", { method: "POST" });
      vi.spyOn(request, "formData").mockResolvedValue({ get: (key: string) => key === "file" ? file : String(index) } as unknown as FormData);
      const response = await uploadImage(request, { params });
      expect(response.status, await response.text()).toBe(201);
    }
    expect(state.send).not.toHaveBeenCalled();
    // The submitted count is deliberately wrong: the server must count images itself.
    const finished = await finishImages(new NextRequest("https://example.test/image", {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ created: 9, failed: 0 }),
    }), { params });
    expect(finished.status).toBe(200);
    expect(state.send).toHaveBeenCalledOnce();
    expect(state.send.mock.calls[0][0].subject).toContain("2 bilder");
  });

  it("sends a zero-image notice without waiting when no images were selected", async () => {
    await submit(0);
    expect(state.send).toHaveBeenCalledOnce();
    expect(state.send.mock.calls[0][0].subject).toContain("0 bilder");
  });

  it("notifies after an interrupted upload and requires the cron secret", async () => {
    const intake = await submit(2);
    await state.db.update(propertyIntakeNotifications).set({ lastActivityAt: "2020-01-01T00:00:00.000Z" })
      .where(eq(propertyIntakeNotifications.propertyId, intake.propertyId));
    const denied = await sweep(new NextRequest("https://example.test/api/cron/property-intake-notifications"));
    expect(denied.status).toBe(401);
    const response = await sweep(new NextRequest("https://example.test/api/cron/property-intake-notifications", {
      headers: { authorization: "Bearer test-cron-secret" },
    }));
    expect(response.status).toBe(200);
    expect(state.send).toHaveBeenCalledOnce();
    expect(state.send.mock.calls[0][0].text).toContain("Uppladdningen har inte bekräftats som klar");
  });

  it("preserves the separate HUS intake notice and does not create a StayOnSite job", async () => {
    await submit(2, { source: "HUS", husPublication: { version: HUS_INTAKE_VERSION, approved: true } });
    expect(state.send).toHaveBeenCalledOnce();
    expect(state.send.mock.calls[0][0].subject).toContain("bilder behandlas");
    expect(await state.db.select().from(propertyIntakeNotifications)).toHaveLength(0);
  });

  it("reports failed images when the upload link cannot be created", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(ensureShareLink).mockRejectedValueOnce(new Error("link unavailable"));
    await submit(2);
    expect(state.send).toHaveBeenCalledOnce();
    expect(state.send.mock.calls[0][0]).toMatchObject({
      subject: expect.stringContaining("0 bilder"), text: expect.stringContaining("0 uppladdade, 2 fel"),
    });
  });
});
