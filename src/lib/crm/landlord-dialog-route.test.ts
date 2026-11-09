import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { landlordDialogs, landlordReplyRuns, owners, properties } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, authorized: true, sender: "anna@example.com", recipient: "kajsa@stayonsite.se", cc: "", labels: [] as string[] }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: async () => state.authorized ? { user: { id: "test" } } : null }));
vi.mock("./gmail", () => ({
  gmailAutomationUserId: vi.fn().mockResolvedValue("user"),
  gmailGetThread: vi.fn(async () => [{ from: state.sender, to: state.recipient, cc: state.cc, labelIds: state.labels }]),
}));
import { POST, PUT } from "../../../app/api/crm/landlord-dialogs/route";

let cleanup: () => void;
function request(method: string, body: object) {
  return new NextRequest("http://localhost/api/crm/landlord-dialogs", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-route"));
  state.authorized = true; state.sender = "anna@example.com"; state.recipient = "kajsa@stayonsite.se"; state.cc = ""; state.labels = [];
  await state.db.insert(owners).values({ id: "owner", name: "Anna", email: "anna@example.com" });
  await state.db.insert(properties).values({ id: "property", ownerId: "owner" });
});
afterEach(() => cleanup());

describe("landlord dialog enrollment", () => {
  it("requires an approved session and a thread from the correct owner", async () => {
    state.authorized = false;
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(401);
    state.authorized = true; state.sender = "other@example.com";
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(400);
    expect(await state.db.select().from(landlordDialogs)).toHaveLength(0);
  });
  it("enrols a verified thread only once", async () => {
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(201);
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(409);
    expect((await state.db.select().from(landlordDialogs))[0]).toMatchObject({ landlordEmail: "anna@example.com", active: true });
  });
  it("enrols a sent one-to-one thread while waiting for the landlord's first reply", async () => {
    state.sender = "kajsa@stayonsite.se"; state.recipient = "Anna <anna@example.com>"; state.labels = ["SENT"];
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(201);
  });
  it("does not enrol an unsent draft or a message sent to multiple recipients", async () => {
    state.sender = "kajsa@stayonsite.se"; state.recipient = "anna@example.com"; state.labels = ["DRAFT"];
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(400);
    state.labels = ["SENT"]; state.recipient = "anna@example.com, other@example.com";
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(400);
    state.recipient = "anna@example.com"; state.cc = "other@example.com";
    expect((await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }))).status).toBe(400);
  });
  it("won't resolve an uncertain send while the dialog is still running", async () => {
    await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }));
    const [dialog] = await state.db.select().from(landlordDialogs);
    await state.db.insert(landlordReplyRuns).values({ gmailMessageId: "m", dialogId: dialog.id, status: "send_uncertain", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await state.db.update(landlordDialogs).set({ leaseUntil: new Date(Date.now() + 60_000).toISOString(), leaseToken: "held" });
    expect((await PUT(request("PUT", { gmailMessageId: "m", checked: true }))).status).toBe(409);
    await state.db.update(landlordDialogs).set({ leaseUntil: null, leaseToken: null });
    expect((await PUT(request("PUT", { gmailMessageId: "m", checked: true }))).status).toBe(200);
    expect((await state.db.select().from(landlordReplyRuns))[0].status).toBe("resolved");
  });
  it("clears an attachment review without changing a sent reply's delivery status", async () => {
    await POST(request("POST", { propertyId: "property", gmailThreadId: "thread" }));
    const [dialog] = await state.db.select().from(landlordDialogs);
    await state.db.insert(landlordReplyRuns).values({ gmailMessageId: "image", dialogId: dialog.id, status: "sent", attachmentsNeedReview: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    expect((await PUT(request("PUT", { gmailMessageId: "image", checked: true }))).status).toBe(200);
    expect((await state.db.select().from(landlordReplyRuns))[0]).toMatchObject({ status: "sent", attachmentsNeedReview: false });
  });
});
