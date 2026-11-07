import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TestDB } from "./test-db";
import { createTestDb } from "./test-db";
import { emails, landlordDialogs, landlordImageCandidates, landlordReplyRuns, owners, properties, propertyNotes } from "./schema";
import type { GmailMessage } from "./gmail";

const state = vi.hoisted(() => ({ db: null as unknown }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./gmail", () => ({
  gmailAutomationUserId: vi.fn().mockResolvedValue("user"),
  gmailGetThread: vi.fn(),
  gmailRecentThreadMessages: vi.fn().mockResolvedValue(new Map([["thread-1", ["in-1"]]])),
  gmailSend: vi.fn(),
  gmailThreadReplyHeaders: vi.fn().mockResolvedValue({ inReplyTo: "<incoming>" }),
}));
vi.mock("./landlord-dialog-model", async (load) => ({
  ...await load<typeof import("./landlord-dialog-model")>(), planLandlordReply: vi.fn(),
}));
vi.mock("./landlord-dialog-alerts", () => ({ sendLandlordReviewNotice: vi.fn().mockResolvedValue(undefined) }));

import { gmailGetThread, gmailSend } from "./gmail";
import { planLandlordReply } from "./landlord-dialog-model";
import { sendLandlordReviewNotice } from "./landlord-dialog-alerts";
import { runLandlordDialogSweep } from "./landlord-dialog-workflow";

let testDb: TestDB;
let cleanup: () => void;
const incoming: GmailMessage = {
  id: "in-1", threadId: "thread-1", from: "Anna <anna@example.com>", to: "kajsa@stayonsite.se",
  subject: "Re: Hus", date: "2026-11-07T09:00:00Z", internalDate: String(Date.parse("2026-11-07T09:00:00Z")),
  text: "Huset har 2 bäddar.", html: null, autoSubmitted: "", precedence: "", cc: "", listUnsubscribe: "", labelIds: [], snippet: "", receivedAt: null,
};

beforeEach(async () => {
  ({ db: testDb, cleanup } = await createTestDb("landlord-dialog"));
  state.db = testDb;
  vi.clearAllMocks();
  await testDb.insert(owners).values({ id: "owner", name: "Anna", email: "anna@example.com" });
  await testDb.insert(properties).values({ id: "property", ownerId: "owner", address: "Testgatan 1", autoPublishEnabled: false });
  await testDb.insert(landlordDialogs).values({
    id: "dialog", ownerId: "owner", propertyId: "property", gmailThreadId: "thread-1", landlordEmail: "anna@example.com",
    enrolledAt: "2026-11-06T12:00:00Z", active: true, createdAt: "2026-11-06T12:00:00Z", updatedAt: "2026-11-06T12:00:00Z",
  });
  vi.mocked(gmailGetThread).mockResolvedValue([incoming]);
  vi.mocked(planLandlordReply).mockResolvedValue({
    action: "reply", summary: "Två bäddar.", reply: "Hej Anna! Tack för informationen. Mvh Kajsa",
    facts: [{ field: "beds", value: "2", evidence: "2 bäddar" }],
  });
  vi.mocked(gmailSend).mockResolvedValue({ messageId: "out-1", threadId: "thread-1" });
});
afterEach(() => cleanup());

describe("landlord Gmail qualification", () => {
  it("does not answer a standalone acknowledgement", async () => {
    vi.mocked(gmailGetThread).mockResolvedValue([{ ...incoming, text: "Tack! 👍" }]);
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 0 });
    expect(gmailSend).not.toHaveBeenCalled();
    expect(planLandlordReply).not.toHaveBeenCalled();
  });
  it("answers substantive information followed by an acknowledgement", async () => {
    const acknowledgement = { ...incoming, id: "in-2", text: "👍" };
    vi.mocked(gmailGetThread).mockResolvedValue([incoming, acknowledgement]);
    expect(await runLandlordDialogSweep({ full: true })).toMatchObject({ sent: 1 });
    expect(vi.mocked(planLandlordReply).mock.calls[0][0].newReply).toContain("Huset har 2 bäddar.");
  });
  it("saves the source and replies at most once when the same event is delivered twice", async () => {
    expect(await runLandlordDialogSweep()).toMatchObject({ checked: 1, sent: 1 });
    expect(await runLandlordDialogSweep()).toMatchObject({ checked: 0, sent: 0 });
    expect(vi.mocked(gmailSend).mock.calls.filter(([, options]) => options.to === "anna@example.com")).toHaveLength(1);
    expect(await testDb.select().from(emails)).toHaveLength(2);
    expect((await testDb.select().from(propertyNotes))[0].content).toContain("Huset har 2 bäddar");
    expect((await testDb.select().from(properties))[0].beds).toBe(2);
    expect((await testDb.select().from(properties))[0].contentReviewHash).toBeNull();
    expect((await testDb.select().from(landlordReplyRuns))[0].status).toBe("sent");
  });
  it("never retries an uncertain send", async () => {
    vi.mocked(gmailSend).mockRejectedValue(new Error("timeout"));
    expect(await runLandlordDialogSweep()).toMatchObject({ review: 1 });
    await runLandlordDialogSweep();
    expect(vi.mocked(gmailSend).mock.calls.filter(([, options]) => options.to === "anna@example.com")).toHaveLength(1);
    expect((await testDb.select().from(landlordReplyRuns))[0].status).toBe("send_uncertain");
  });
  it("does not send if Kajsa answered while the reply was being prepared", async () => {
    vi.mocked(gmailGetThread).mockResolvedValueOnce([incoming]).mockResolvedValueOnce([
      incoming, { ...incoming, id: "human", from: "kajsa@stayonsite.se" },
    ]);
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 0 });
    expect(vi.mocked(gmailSend).mock.calls.filter(([, options]) => options.to === "anna@example.com")).toHaveLength(0);
  });
  it("does not answer a thread after the owner's email has changed", async () => {
    await testDb.update(owners).set({ email: "new@example.com" });
    expect(await runLandlordDialogSweep()).toMatchObject({ review: 1 });
    expect(vi.mocked(gmailSend).mock.calls.filter(([, options]) => options.to === "anna@example.com")).toHaveLength(0);
  });
  it("does not send when the owner changes during reply generation", async () => {
    vi.mocked(planLandlordReply).mockImplementationOnce(async () => {
      await testDb.update(owners).set({ email: "new@example.com" });
      return { action: "reply", summary: "Två bäddar.", reply: "Tack!", facts: [] };
    });
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 0, review: 1 });
    expect(vi.mocked(gmailSend).mock.calls.filter(([, options]) => options.to === "anna@example.com")).toHaveLength(0);
  });
  it("records all consecutive replies and flags possible image attachments", async () => {
    const first = { ...incoming, id: "in-0", text: "Den är ledig nu.", possibleImageAttachments: 1 };
    vi.mocked(gmailGetThread).mockResolvedValue([first, incoming]);
    await runLandlordDialogSweep();
    const stored = await testDb.select().from(emails);
    expect(stored.filter((item) => item.direction === "in")).toHaveLength(2);
    expect((await testDb.select().from(propertyNotes))[0].content).toContain("inte importerade");
    expect((await testDb.select().from(landlordReplyRuns))[0]).toMatchObject({ status: "sent", attachmentsNeedReview: true });
    expect(sendLandlordReviewNotice).toHaveBeenCalledWith("property", "in-1");
  });
  it("queues a real image attachment for a separate image check", async () => {
    vi.mocked(gmailGetThread).mockResolvedValue([{ ...incoming, possibleImageAttachments: 1,
      imageAttachments: [{ attachmentId: "photo", fileName: "rum.jpg", mimeType: "image/jpeg", sizeBytes: 120000 }] }]);
    await runLandlordDialogSweep();
    expect((await testDb.select().from(landlordImageCandidates))[0]).toMatchObject({ propertyId: "property", attachmentId: "photo", status: "pending" });
    expect((await testDb.select().from(landlordReplyRuns))[0].attachmentsNeedReview).toBe(false);
    expect(sendLandlordReviewNotice).not.toHaveBeenCalled();
  });
  it.each([
    { published: true, autoPublishEnabled: false },
    { published: false, prospektPublished: true, autoPublishEnabled: false },
    { published: false, prospektPublished: false, autoPublishEnabled: true },
  ])("keeps listing content and publication settings unchanged when it could affect public content", async (state) => {
    await testDb.update(properties).set(state);
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 1 });
    const property = (await testDb.select().from(properties))[0];
    expect(property.beds).toBeNull();
    expect(property).toMatchObject(state);
    expect((await testDb.select().from(propertyNotes))[0].content).toContain("2 bäddar");
  });
  it("does not overwrite a value that was added while the model was working", async () => {
    vi.mocked(planLandlordReply).mockImplementationOnce(async () => {
      await testDb.update(properties).set({ beds: 4 });
      return { action: "reply", summary: "Två bäddar.", reply: "Tack!", facts: [{ field: "beds", value: "2", evidence: "2 bäddar" }] };
    });
    await runLandlordDialogSweep();
    expect((await testDb.select().from(properties))[0].beds).toBe(4);
  });
  it("requires review if property facts changed while the reply was generated", async () => {
    vi.mocked(planLandlordReply).mockImplementationOnce(async () => {
      await testDb.update(properties).set({ beds: 4, updatedAt: "2026-11-07T18:00:00Z" });
      return { action: "reply", summary: "Två bäddar.", reply: "Tack!", facts: [{ field: "beds", value: "2", evidence: "2 bäddar" }] };
    });
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 0, review: 1 });
    expect((await testDb.select().from(properties))[0].beds).toBe(4);
  });
  it("requires manual review for HTML-only messages", async () => {
    vi.mocked(gmailGetThread).mockResolvedValueOnce([{ ...incoming, text: "", html: "<p>Hej</p>" }]);
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 0, review: 1 });
    expect(vi.mocked(planLandlordReply)).not.toHaveBeenCalled();
    expect((await testDb.select().from(landlordReplyRuns))[0].error).toContain("textversion");
  });
  it("requires manual review when other senders participate in the new turn", async () => {
    vi.mocked(gmailGetThread).mockResolvedValueOnce([{ ...incoming, id: "third", from: "other@example.com" }, incoming]);
    expect(await runLandlordDialogSweep()).toMatchObject({ sent: 0, review: 1 });
    expect(vi.mocked(planLandlordReply)).not.toHaveBeenCalled();
    expect((await testDb.select().from(landlordReplyRuns))[0].error).toContain("Flera avsändare");
  });
  it("checks least recently inspected threads first in a full sweep", async () => {
    await testDb.update(landlordDialogs).set({ lastCheckedAt: "2026-11-06T12:00:00Z" });
    await testDb.insert(landlordDialogs).values({
      id: "older", ownerId: "owner", propertyId: "property", gmailThreadId: "thread-2", landlordEmail: "anna@example.com",
      enrolledAt: "2026-11-06T12:00:00Z", active: true, createdAt: "2026-11-06T12:00:00Z", updatedAt: "2026-11-06T12:00:00Z",
    });
    vi.mocked(gmailGetThread).mockResolvedValue([]);
    await runLandlordDialogSweep({ full: true });
    expect(vi.mocked(gmailGetThread).mock.calls.map(([, id]) => id)).toEqual(["thread-2", "thread-1"]);
  });
});
