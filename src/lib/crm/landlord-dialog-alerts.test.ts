import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { landlordAgentHealth } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, send: vi.fn() }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("resend", () => ({ Resend: class { emails = { send: state.send }; } }));
import { recordLandlordSweepFailure, recordLandlordSweepSuccess, sendLandlordReviewNotice } from "./landlord-dialog-alerts";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-alerts"));
  vi.stubEnv("RESEND_API_KEY", "test"); vi.stubEnv("RESEND_FROM", "Test <test@example.com>");
  state.send.mockReset().mockResolvedValue({ data: { id: "notice" }, error: null });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("landlord automation alerts", () => {
  it("sends one alert for an ongoing incident and resets after recovery", async () => {
    await recordLandlordSweepFailure("minute");
    await recordLandlordSweepFailure("minute");
    expect(state.send).toHaveBeenCalledTimes(1);
    expect((await state.db.select().from(landlordAgentHealth))[0]).toMatchObject({ id: "minute", alertSentAt: expect.any(String) });
    await recordLandlordSweepSuccess("minute");
    expect((await state.db.select().from(landlordAgentHealth))[0]).toMatchObject({ failureStartedAt: null, alertSentAt: null });
    await recordLandlordSweepFailure("minute");
    expect(state.send).toHaveBeenCalledTimes(2);
  });
  it("uses a stable provider idempotency key for review notices", async () => {
    await sendLandlordReviewNotice("p1", "mail1");
    expect(state.send).toHaveBeenCalledWith(expect.objectContaining({ to: "kajsa@stayonsite.se" }), { idempotencyKey: "landlord-review/mail1" });
  });
  it("retries an alert that the provider did not accept", async () => {
    state.send.mockResolvedValueOnce({ data: null, error: { message: "unavailable" } });
    await expect(recordLandlordSweepFailure("minute")).rejects.toThrow();
    await recordLandlordSweepFailure("minute");
    expect(state.send).toHaveBeenCalledTimes(2);
    expect(state.send.mock.calls[0][1]).toEqual(state.send.mock.calls[1][1]);
  });
});
