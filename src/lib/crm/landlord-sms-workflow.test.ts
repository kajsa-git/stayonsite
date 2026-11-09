import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createTestDb, type TestDB } from "./test-db";
import { companies, contacts, inboxMessages, landlordSmsDialogs, landlordSmsReceipts, landlordSmsRuns, notes, outboxMessages, owners, properties, propertyNotes, requests } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./landlord-dialog-alerts", () => ({ sendLandlordSmsReviewNotice: vi.fn().mockResolvedValue(undefined), sendLandlordSmsAttachmentNotice: vi.fn().mockResolvedValue(undefined) }));
vi.mock("./landlord-dialog-model", async (load) => ({ ...await load<typeof import("./landlord-dialog-model")>(), planLandlordReply: vi.fn() }));

import { planLandlordReply } from "./landlord-dialog-model";
import { sendLandlordSmsAttachmentNotice, sendLandlordSmsReviewNotice } from "./landlord-dialog-alerts";
import { runLandlordSmsSweep } from "./landlord-sms-workflow";
import { reportMessageStatus } from "./message-status";
import { deletePropertyDeep } from "./cascade-delete";
import { GET as claimReplies } from "../../../app/api/crm/messages/agent/landlord-replies/route";
import { GET as claimOrdinary } from "../../../app/api/crm/messages/agent/route";

let cleanup: () => void;
const phone = "+46700000000";
const timestamp = "2026-11-07T12:00:01.000Z";
function agentRequest() { return new NextRequest("https://example.test/api/crm/messages/agent/landlord-replies", { headers: { authorization: "Bearer test-token" } }); }
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-sms"));
  vi.stubEnv("CRM_AGENT_TOKEN", "test-token");
  vi.clearAllMocks();
  await state.db.insert(owners).values({ id: "owner", name: "Anna", phone });
  await state.db.insert(properties).values({ id: "property", ownerId: "owner", address: "Testgatan 1" });
  await state.db.insert(landlordSmsDialogs).values({ id: "dialog", ownerId: "owner", propertyId: "property", phone,
    enrolledAt: "2026-11-06T12:00:00.000Z", active: true, createdAt: "2026-11-06T12:00:00.000Z", updatedAt: "2026-11-06T12:00:00.000Z" });
  await state.db.insert(inboxMessages).values({ id: "inbox", guid: "guid-1", fromPhone: phone, body: "Det finns 2 bäddar.",
    sentAt: timestamp, direction: "in", ownerId: "owner", isRead: false });
  await state.db.insert(landlordSmsReceipts).values({ guid: "guid-1", conversationKind: "direct" });
  vi.mocked(planLandlordReply).mockResolvedValue({ action: "reply", summary: "Två bäddar.", reply: "Hej Anna! Tack. När är det ledigt? Mvh Kajsa", facts: [] });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("automatic landlord SMS", () => {
  it("uses Kajsa's latest branded SMS even when a newer acknowledgement is unbranded", async () => {
    await state.db.insert(inboxMessages).values([
      { id: "signed", guid: "signed-guid", fromPhone: phone, body: "Tack! /Kajsa, HyrUtSmart", direction: "out", ownerId: "owner", sentAt: "2026-11-07T11:58:00.000Z", isRead: true },
      { id: "ack", guid: "ack-guid", fromPhone: phone, body: "Toppen!", direction: "out", ownerId: "owner", sentAt: "2026-11-07T11:59:00.000Z", isRead: true },
    ]);
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 1 });
    expect(vi.mocked(planLandlordReply).mock.calls[0][0].brand).toBe("HyrUtSmart");
  });
  it("requests review if the last branded SMS names both businesses", async () => {
    await state.db.insert(inboxMessages).values({ id: "signed", guid: "signed-guid", fromPhone: phone,
      body: "Kajsa, HyrUtSmart och StayOnSite", direction: "out", ownerId: "owner", sentAt: "2026-11-07T11:59:00.000Z", isRead: true });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0, review: 1 });
    expect(planLandlordReply).not.toHaveBeenCalled();
  });
  it("does not respond to an acknowledgement by itself", async () => {
    await state.db.update(inboxMessages).set({ body: "👍🏻👍🏻" });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0, review: 0 });
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
  });
  it("includes a substantive message followed by an acknowledgement", async () => {
    await state.db.insert(inboxMessages).values({ id: "thumb", guid: "thumb-guid", fromPhone: phone, body: "👍🏻",
      sentAt: "2026-11-07T12:00:02.000Z", direction: "in", ownerId: "owner", isRead: false });
    await state.db.insert(landlordSmsReceipts).values({ guid: "thumb-guid", conversationKind: "direct" });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 1 });
    expect(vi.mocked(planLandlordReply).mock.calls[0][0].newReply).toBe("Det finns 2 bäddar.");
    expect((await state.db.select().from(outboxMessages))[0].replyToInboxIds).toEqual(["thumb", "inbox"]);
  });
  it("does not answer a later acknowledgement when the sent message is absent from the Mac inbox", async () => {
    await runLandlordSmsSweep();
    const [out] = await (await claimReplies(agentRequest())).json() as { id: string }[];
    await reportMessageStatus(out.id, { ok: true }, { db: state.db });
    await state.db.insert(inboxMessages).values({ id: "thumb", guid: "thumb-guid", fromPhone: phone, body: "👍🏻",
      sentAt: "2026-11-07T12:00:02.000Z", direction: "in", ownerId: "owner", isRead: false });
    await state.db.insert(landlordSmsReceipts).values({ guid: "thumb-guid", conversationKind: "direct" });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0, review: 0 });
    expect(await state.db.select().from(outboxMessages)).toHaveLength(1);
    expect(planLandlordReply).toHaveBeenCalledTimes(1);
  });
  it("flags a photo for manual import while answering a text-bearing message", async () => {
    await state.db.update(landlordSmsReceipts).set({ attachmentCount: 1 });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 1 });
    expect((await state.db.select().from(landlordSmsRuns))[0].attachmentsNeedReview).toBe(true);
    expect((await state.db.select().from(propertyNotes))[0].content).toContain("inte importerats automatiskt");
    await runLandlordSmsSweep();
    expect(sendLandlordSmsAttachmentNotice).toHaveBeenCalledWith("property", "guid-1");
  });
  it("routes an image-only message to review rather than inventing its contents", async () => {
    await state.db.update(inboxMessages).set({ body: "\uFFFC" });
    await state.db.update(landlordSmsReceipts).set({ attachmentCount: 1 });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0, review: 1 });
    expect(vi.mocked(planLandlordReply)).not.toHaveBeenCalled();
    expect((await state.db.select().from(landlordSmsRuns))[0].attachmentsNeedReview).toBe(true);
  });
  it("queues one reply, preserves the open inbox item, and never claims the same send twice", async () => {
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 1 });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0 });
    expect((await state.db.select().from(propertyNotes))[0].content).toContain("2 bäddar");
    expect(await (await claimOrdinary(agentRequest())).json()).toEqual([]);
    const response = await claimReplies(agentRequest());
    const claimed = await response.json() as { id: string; status: string }[];
    expect(claimed).toHaveLength(1);
    expect(claimed[0].status).toBe("sending");
    expect(await (await claimReplies(agentRequest())).json()).toEqual([]);
    await reportMessageStatus(claimed[0].id, { ok: true }, { db: state.db });
    expect((await state.db.select().from(inboxMessages))[0].isRead).toBe(false);
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0 });
    expect((await state.db.select().from(landlordSmsRuns))[0].status).toBe("sent");
  });
  it("does not answer a group or an SMS whose conversation type is unknown", async () => {
    await state.db.update(landlordSmsReceipts).set({ conversationKind: "unknown" });
    expect(await runLandlordSmsSweep()).toMatchObject({ review: 1, queued: 0 });
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
    expect(sendLandlordSmsReviewNotice).toHaveBeenCalledWith("property", "guid-1");
  });
  it("does not mistake a newer WhatsApp message for part of the SMS conversation", async () => {
    await state.db.insert(inboxMessages).values({ id: "wa", guid: "wa-guid", fromPhone: phone, body: "Ett WhatsApp-meddelande",
      service: "WhatsApp", sentAt: "2026-11-07T12:00:02.000Z", direction: "in", ownerId: "owner", isRead: false });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 1, review: 0 });
    expect(vi.mocked(planLandlordReply).mock.calls[0][0].newReply).toBe("Det finns 2 bäddar.");
    expect(await (await claimReplies(agentRequest())).json()).toHaveLength(1);
  });
  it("fills a clearly stated empty field only when the property cannot auto-publish", async () => {
    await state.db.update(properties).set({ autoPublishEnabled: false });
    vi.mocked(planLandlordReply).mockResolvedValueOnce({ action: "reply", summary: "Två bäddar.", reply: "Tack!", facts: [{ field: "beds", value: "2", evidence: "2 bäddar" }] });
    await runLandlordSmsSweep();
    expect((await state.db.select().from(properties))[0]).toMatchObject({ beds: 2, published: false, prospektPublished: false });
  });
  it("does not queue a response when Kajsa replies while it is being composed", async () => {
    vi.mocked(planLandlordReply).mockImplementationOnce(async () => {
      await state.db.insert(inboxMessages).values({ id: "human", guid: "human-guid", fromPhone: phone, body: "Tack!",
        sentAt: "2026-11-07T12:00:02.000Z", direction: "out", ownerId: "owner", isRead: true });
      return { action: "reply", summary: "Två bäddar.", reply: "Tack!", facts: [] };
    });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 0 });
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
  });
  it("does not send a queued reply after a newer message arrives", async () => {
    await runLandlordSmsSweep();
    await state.db.insert(inboxMessages).values({ id: "newer", guid: "newer-guid", fromPhone: phone, body: "En sak till!",
      sentAt: "2026-11-07T12:00:02.000Z", direction: "in", ownerId: "owner", isRead: false });
    expect(await (await claimReplies(agentRequest())).json()).toEqual([]);
    expect((await state.db.select().from(outboxMessages))[0].status).toBe("failed");
    expect(await runLandlordSmsSweep()).toMatchObject({ review: 1 });
  });
  it("does not send when a previously closed duplicate contact becomes an active customer", async () => {
    await state.db.update(owners).set({ email: "anna@example.se" });
    await state.db.insert(companies).values({ id: "company", name: "Webbförfrågan · anna@example.se" });
    await state.db.insert(contacts).values({ id: "contact", companyId: "company", email: "anna@example.se", phone });
    await state.db.insert(requests).values({ id: "old", companyId: "company", status: "lost" });
    await state.db.insert(notes).values({ id: "note", companyId: "company", channel: "övrigt", content: "Felriktad kundförfrågan avslutad. Anna registrerar uthyrning." });
    expect(await runLandlordSmsSweep()).toMatchObject({ queued: 1 });
    await state.db.insert(requests).values({ id: "new", companyId: "company", status: "incoming" });
    expect(await (await claimReplies(agentRequest())).json()).toEqual([]);
    expect((await state.db.select().from(outboxMessages))[0].status).toBe("failed");
  });
  it("surfaces a delivery failure reported after the message was sent", async () => {
    await runLandlordSmsSweep();
    const [out] = await (await claimReplies(agentRequest())).json() as { id: string }[];
    await reportMessageStatus(out.id, { ok: true }, { db: state.db });
    await runLandlordSmsSweep();
    await reportMessageStatus(out.id, { ok: false, error: "delivery failed" }, { db: state.db });
    expect(await runLandlordSmsSweep()).toMatchObject({ review: 1 });
    expect(sendLandlordSmsReviewNotice).toHaveBeenCalledWith("property", "guid-1");
  });
  it("rejects the claim without the agent credential", async () => {
    expect((await claimReplies(new NextRequest("https://example.test/api/crm/messages/agent/landlord-replies"))).status).toBe(401);
  });
  it("cancels a queued automated reply when its property is explicitly deleted", async () => {
    await runLandlordSmsSweep();
    await state.db.transaction((tx) => deletePropertyDeep(tx, "property"));
    expect(await state.db.select().from(landlordSmsDialogs)).toHaveLength(0);
    expect(await state.db.select().from(landlordSmsRuns)).toHaveLength(0);
    expect((await state.db.select().from(outboxMessages))[0].status).toBe("failed");
    expect(await (await claimReplies(agentRequest())).json()).toEqual([]);
  });
});
