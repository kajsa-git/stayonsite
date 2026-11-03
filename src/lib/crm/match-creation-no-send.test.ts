import { NextRequest } from "next/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("@/lib/crm/db", () => ({ get db() { return state.db; } }));
vi.mock("@/lib/crm/auth", () => ({ requireApprovedSession: async () => ({ user: { id: "test" } }) }));

import { POST } from "../../../app/api/crm/matches/route";
import { companies, emails, matchEvents, matches, outboxMessages, owners, properties, requests } from "./schema";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("match-no-send"));
  await state.db.insert(companies).values({ id: "company", name: "Testföretag" });
  await state.db.insert(requests).values({ id: "request", companyId: "company" });
  await state.db.insert(owners).values({ id: "owner", name: "Testperson", email: "owner@example.test", phone: "+46701234567" });
  await state.db.insert(properties).values({ id: "property", ownerId: "owner", address: "Testvägen 1" });
});
afterEach(() => cleanup());

it("saves an internal property suggestion without sending or queuing any message", async () => {
  const response = await POST(new NextRequest("http://localhost/api/crm/matches", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ requestId: "request", propertyId: "property" }),
  }));
  expect(response.status).toBe(201);
  expect(await state.db.select().from(matches)).toHaveLength(1);
  expect(await state.db.select().from(outboxMessages)).toHaveLength(0);
  expect(await state.db.select().from(emails)).toHaveLength(0);
  expect(await state.db.select().from(matchEvents)).toHaveLength(0);
});
