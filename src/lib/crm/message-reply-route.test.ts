import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { inboxMessages, outboxMessages } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: async () => ({ user: { id: "test" } }) }));
import { POST } from "../../../app/api/crm/messages/route";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("reply-route"));
  await state.db.insert(inboxMessages).values({ id: "in", guid: "guid", fromPhone: "+46701111111", body: "Hej", sentAt: "2026-10-28T08:00:00Z", isRead: false });
});
afterEach(() => cleanup());

function request(body: object) {
  return new NextRequest("http://localhost/api/crm/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

describe("köa svar på inkommande SMS", () => {
  it("köar ett svar till rätt kontakt och lämnar inkorgen oläst tills agenten rapporterar", async () => {
    const response = await POST(request({ toPhone: "0701111111", body: "Tack!", replyToInboxIds: ["in"] }));
    expect(response.status).toBe(201);
    expect((await state.db.select().from(outboxMessages))[0]).toMatchObject({ status: "queued", replyToInboxIds: ["in"] });
    expect((await state.db.select().from(inboxMessages))[0].isRead).toBe(false);
  });

  it("nekar en koppling till fel telefonnummer", async () => {
    const response = await POST(request({ toPhone: "0702222222", body: "Tack!", replyToInboxIds: ["in"] }));
    expect(response.status).toBe(400);
    expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
  });
});
