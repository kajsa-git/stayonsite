import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { properties, propertyImages, propertyIntakeNotifications } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, send: vi.fn() }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("resend", () => ({ Resend: class { emails = { send: state.send }; } }));

import { deliverPropertyIntakeNotice, finishPropertyIntakeUpload, runPropertyIntakeNotificationSweep, touchPropertyIntakeUpload } from "./property-intake-notifications";

const started = new Date("2026-11-11T10:00:00.000Z");
const later = (minutes: number) => new Date(started.getTime() + minutes * 60_000);
let cleanup: () => void;
async function addImage(id: string) {
  await state.db.insert(propertyImages).values({ id, propertyId: "p1", key: `test/${id}` });
}

beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("intake-notification"));
  vi.clearAllMocks();
  vi.stubEnv("RESEND_API_KEY", "test-key");
  vi.stubEnv("RESEND_FROM", "StayOnSite <test@example.test>");
  vi.stubEnv("CONTACT_FORM_TO", "kajsa@example.test");
  state.send.mockResolvedValue({ data: { id: "mail-id" }, error: null });
  await state.db.insert(properties).values({ id: "p1", address: "Gatan 1", city: "Boden" });
  await state.db.insert(propertyIntakeNotifications).values({
    propertyId: "p1", ownerName: "Anna", ownerPhone: "+46701234567", ownerEmail: "anna@example.test",
    ownerType: "privatperson", address: "Gatan 1", city: "Boden",
    createdAt: started.toISOString(), lastActivityAt: started.toISOString(),
  });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("property intake notifications", () => {
  it("waits for completion and reports the actual saved images and failures once", async () => {
    await addImage("one"); await addImage("two");
    expect(await runPropertyIntakeNotificationSweep(later(2))).toMatchObject({ sent: 0 });
    expect(state.send).not.toHaveBeenCalled();
    await finishPropertyIntakeUpload("p1", 1, later(3));
    expect(state.send).toHaveBeenCalledOnce();
    expect(state.send).toHaveBeenCalledWith(expect.objectContaining({
      subject: "Nytt bostadsintag: Gatan 1, Boden — 2 bilder",
      text: expect.stringContaining("2 uppladdade, 1 fel"),
    }), { idempotencyKey: "property-intake/p1/completed" });
    await finishPropertyIntakeUpload("p1", 1, later(4));
    await runPropertyIntakeNotificationSweep(later(25));
    expect(state.send).toHaveBeenCalledOnce();
  });

  it("reports zero promptly when the upload finishes without selected images", async () => {
    await finishPropertyIntakeUpload("p1", 0, started);
    expect(state.send).toHaveBeenCalledWith(expect.objectContaining({
      subject: "Nytt bostadsintag: Gatan 1, Boden — 0 bilder",
      text: expect.stringContaining("0 uppladdade"),
    }), expect.anything());
  });

  it("waits for inactivity, sends the count so far, and updates it if the upload later finishes", async () => {
    await addImage("one");
    await touchPropertyIntakeUpload("p1", later(10));
    await runPropertyIntakeNotificationSweep(later(20));
    expect(state.send).not.toHaveBeenCalled();
    await runPropertyIntakeNotificationSweep(later(25));
    expect(state.send).toHaveBeenCalledTimes(1);
    expect(state.send.mock.calls[0][0]).toMatchObject({
      subject: expect.stringContaining("1 bild hittills"),
      text: expect.stringContaining("Uppladdningen har inte bekräftats som klar"),
    });
    await runPropertyIntakeNotificationSweep(later(26));
    expect(state.send).toHaveBeenCalledTimes(1);
    await addImage("two");
    await finishPropertyIntakeUpload("p1", 0, later(27));
    expect(state.send).toHaveBeenCalledTimes(2);
    expect(state.send.mock.calls[1][0]).toMatchObject({
      subject: expect.stringContaining("2 bilder – uppdatering"),
      text: expect.stringContaining("2 uppladdade"),
    });
  });

  it("retries a failed send with the original content and idempotency key", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await addImage("one");
    state.send.mockRejectedValueOnce(new Error("provider unavailable"));
    expect(await finishPropertyIntakeUpload("p1", 0, later(1))).toBe("error");
    await addImage("two");
    expect(await runPropertyIntakeNotificationSweep(later(5))).toMatchObject({ sent: 0 });
    expect(await runPropertyIntakeNotificationSweep(later(6))).toMatchObject({ sent: 1 });
    expect(state.send).toHaveBeenCalledTimes(2);
    expect(state.send.mock.calls[1]).toEqual(state.send.mock.calls[0]);
    expect(state.send.mock.calls[1][0].subject).toContain("1 bild");
  });

  it("sends a final update when completion races with the fallback", async () => {
    await addImage("one");
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    state.send.mockImplementationOnce(async () => { await gate; return { data: { id: "fallback" }, error: null }; });
    const fallback = deliverPropertyIntakeNotice("p1", later(16));
    await vi.waitFor(() => expect(state.send).toHaveBeenCalledTimes(1));
    await addImage("two");
    expect(await finishPropertyIntakeUpload("p1", 0, later(16))).toBe("ignored");
    release();
    await fallback;
    expect(state.send).toHaveBeenCalledTimes(2);
    expect(state.send.mock.calls[1][0].subject).toContain("2 bilder – uppdatering");
  });

  it("does not send duplicate messages when two completions arrive together", async () => {
    await addImage("one");
    await Promise.all([finishPropertyIntakeUpload("p1", 0, later(1)), finishPropertyIntakeUpload("p1", 0, later(1))]);
    expect(state.send).toHaveBeenCalledOnce();
  });
});
