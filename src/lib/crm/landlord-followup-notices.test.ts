import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { landlordDialogs, landlordReplyRuns, landlordSmsDialogs, landlordSmsRuns, outboxMessages, ownerOutreach, owners, properties } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./landlord-dialog-alerts", () => ({ sendLandlordFollowUpQuestion: vi.fn() }));
import { sendLandlordFollowUpQuestion } from "./landlord-dialog-alerts";
import { sendPendingLandlordFollowUpQuestions } from "./landlord-followup-notices";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-followup")); vi.clearAllMocks();
  vi.mocked(sendLandlordFollowUpQuestion).mockResolvedValue(undefined);
  await state.db.insert(owners).values({ id: "owner", name: "Anna" });
  await state.db.insert(properties).values({ id: "p", ownerId: "owner" });
  await state.db.insert(ownerOutreach).values({ id: "outreach", propertyId: "p", ownerId: "owner", status: "i_dialog", nextFollowUpDate: "2026-11-09" });
  await state.db.insert(landlordDialogs).values({ id: "mail", ownerId: "owner", propertyId: "p", gmailThreadId: "thread", landlordEmail: "anna@example.com", enrolledAt: "2026-11-06T00:00:00Z", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
  await state.db.insert(landlordReplyRuns).values({ gmailMessageId: "m1", dialogId: "mail", status: "sent", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
  await state.db.insert(landlordSmsDialogs).values({ id: "sms", ownerId: "owner", propertyId: "p", phone: "+46700000000", enrolledAt: "2026-11-06T00:00:00Z", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
  await state.db.insert(outboxMessages).values({ id: "out", ownerId: "owner", toPhone: "+46700000000", body: "Tack!", status: "sent", source: "landlord_agent_sms" });
  await state.db.insert(landlordSmsRuns).values({ inboxGuid: "s1", dialogId: "sms", status: "queued", outboxId: "out", createdAt: "2026-11-06T00:00:00Z", updatedAt: "2026-11-06T00:00:00Z" });
});
afterEach(() => cleanup());

describe("landlord follow-up questions", () => {
  it("asks Kajsa once for each sent response without changing outreach status or date", async () => {
    expect(await sendPendingLandlordFollowUpQuestions("mejl")).toBe(1);
    expect(await sendPendingLandlordFollowUpQuestions("sms")).toBe(1);
    expect(await sendPendingLandlordFollowUpQuestions("mejl")).toBe(0);
    expect(await sendPendingLandlordFollowUpQuestions("sms")).toBe(0);
    expect(sendLandlordFollowUpQuestion).toHaveBeenCalledTimes(2);
    expect((await state.db.select().from(ownerOutreach))[0]).toMatchObject({ status: "i_dialog", nextFollowUpDate: "2026-11-09" });
  });
  it("retries a notice that was not accepted", async () => {
    vi.mocked(sendLandlordFollowUpQuestion).mockRejectedValueOnce(new Error("temporarily unavailable"));
    await expect(sendPendingLandlordFollowUpQuestions("mejl")).rejects.toThrow();
    expect(await sendPendingLandlordFollowUpQuestions("mejl")).toBe(1);
  });
});
