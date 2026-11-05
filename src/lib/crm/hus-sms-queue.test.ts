import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
import { GET } from "../../../app/api/crm/messages/agent/route";
import { outboxMessages, properties } from "./schema";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("hus-sms-queue"));
  vi.stubEnv("CRM_AGENT_TOKEN", "test-token");
  await state.db.insert(properties).values({ id: "ready", published: true, contentReviewStatus: "approved", publishConsentAt: "2026-11-05" });
  await state.db.insert(outboxMessages).values([
    { id: "waiting", toPhone: "+46701234567", body: "Väntar", status: "pending_publication", source: "hus_publication" },
    { id: "hus-publication:ready", toPhone: "+46701234567", body: "Länk", status: "queued", source: "hus_publication" },
    { id: "hus-publication:withdrawn", toPhone: "+46701234567", body: "Länk", status: "queued", source: "hus_publication" },
  ]);
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

it("allows the agent to claim queued messages but never those awaiting publication", async () => {
  const response = await GET(new NextRequest("http://localhost/api", { headers: { authorization: "Bearer test-token" } }));
  expect(response.status).toBe(200);
  const claimed = await response.json() as { id: string; status: string }[];
  expect(claimed.map((row) => row.id)).toEqual(["hus-publication:ready"]);
  expect(claimed[0].status).toBe("sending");
  const rows = await state.db.select().from(outboxMessages);
  expect(rows.find((row) => row.id === "waiting")?.status).toBe("pending_publication");
  expect(rows.find((row) => row.id === "hus-publication:withdrawn")?.status).toBe("pending_publication");
});
