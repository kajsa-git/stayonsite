import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { inboxMessages, landlordSmsReceipts, owners } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("next/server", async (original) => ({ ...await original<typeof import("next/server")>(), after: vi.fn() }));
import { POST } from "../../../app/api/crm/inbox/agent/route";
let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-sms-ingest"));
  vi.stubEnv("CRM_AGENT_TOKEN", "test-token");
  await state.db.insert(owners).values({ id: "owner", name: "Anna", phone: "+46700000000" });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

it("preserves the Mac's conversation classification, defaulting old agents to unknown", async () => {
  const messages = [
    { guid: "direct", fromPhone: "+46700000000", body: "Hej", sentAt: "2026-11-06T12:00:00Z", conversationKind: "direct", attachmentCount: 2 },
    { guid: "legacy", fromPhone: "+46700000000", body: "Hej igen", sentAt: "2026-11-06T12:01:00Z" },
  ];
  const request = new NextRequest("https://example.test/api/crm/inbox/agent", { method: "POST",
    headers: { authorization: "Bearer test-token", "content-type": "application/json" }, body: JSON.stringify({ messages }) });
  expect((await POST(request)).status).toBe(200);
  expect(await state.db.select().from(inboxMessages)).toHaveLength(2);
  const receipts = await state.db.select().from(landlordSmsReceipts);
  expect(receipts).toEqual(expect.arrayContaining([{ guid: "direct", conversationKind: "direct", attachmentCount: 2 }, { guid: "legacy", conversationKind: "unknown", attachmentCount: 0 }]));
});
