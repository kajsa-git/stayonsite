import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "../test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("../db", () => ({ get db() { return state.db; } }));
import { GET } from "../../../../app/api/crm/messages/agent/route";
import { outboxMessages } from "../schema";
import { setOutboxChannel } from "./store";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("whatsapp-channel"));
  vi.stubEnv("CRM_AGENT_TOKEN", "test-token");
  await state.db.insert(outboxMessages).values([
    { id: "sms", toPhone: "+46701234567", body: "SMS", status: "queued", source: "crm" },
    { id: "wa", toPhone: "+46701234567", body: "WhatsApp", status: "queued", source: "reply-engine" },
  ]);
  await setOutboxChannel(state.db, "wa", "whatsapp");
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

const claim = async (query = "") => {
  const res = await GET(new NextRequest(`http://localhost/api${query}`, { headers: { authorization: "Bearer test-token" } }));
  return (await res.json() as { id: string }[]).map((r) => r.id);
};

it("Mac-agenten får aldrig WhatsApp-meddelanden och WhatsApp-agenten bara sina egna", async () => {
  expect(await claim()).toEqual(["sms"]);
  expect(await claim("?channel=whatsapp")).toEqual(["wa"]);
  expect(await claim("?channel=whatsapp")).toEqual([]);
});
