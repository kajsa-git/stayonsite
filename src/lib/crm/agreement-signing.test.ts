import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UPPDRAGSBEKRAFTELSE, UTHYRNINGSUPPDRAG } from "./avtal";
import * as schema from "./schema";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./schedule-property-review", () => ({ schedulePropertyReview: vi.fn() }));

import { POST } from "../../../app/api/share/[token]/agreement/route";

let cleanup: () => void;

beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("crm-agreement-signing"));
  await state.db.insert(schema.owners).values([{ id: "o1", name: "Anna" }, { id: "o2", name: "Bo" }]);
  await state.db.insert(schema.properties).values([
    { id: "p1", ownerId: "o1", published: false },
    { id: "p2", ownerId: "o2", published: false },
  ]);
  await state.db.insert(schema.companies).values({ id: "c1", name: "Testföretaget" });
  await state.db.insert(schema.requests).values({ id: "r1", companyId: "c1" });
  await state.db.insert(schema.shareLinks).values([
    { id: "l1", token: "owner-token", audience: "landlord", ownerId: "o1" },
    { id: "l2", token: "tenant-token", audience: "tenant", requestId: "r1" },
  ]);
});

afterEach(() => cleanup());

function approve(body: Record<string, unknown>, token = "owner-token") {
  return POST(new NextRequest(`http://localhost/api/share/${token}/agreement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Anna Andersson", language: "sv", ...body }),
  }), { params: Promise.resolve({ token }) });
}

describe("godkännande av aktuell avtalstext", () => {
  it.each(["2026-07-16.8", undefined])("avvisar gammalt formulär (%s) utan att registrera godkännande eller publiceringslov", async (version) => {
    const response = await approve({ version, publishConsent: true });
    expect(response.status).toBe(409);
    expect(await state.db.select().from(schema.agreementAcceptances)).toHaveLength(0);
    const [property] = await state.db.select().from(schema.properties).where(eq(schema.properties.id, "p1"));
    expect(property.publishConsentAt).toBeNull();
  });

  it("registrerar medgivandet och publiceringsvalet enbart för uthyrarens egna bostäder", async () => {
    expect((await approve({ version: UTHYRNINGSUPPDRAG.version, publishConsent: true })).status).toBe(201);
    const [acceptance] = await state.db.select().from(schema.agreementAcceptances);
    expect(acceptance).toMatchObject({
      ownerId: "o1", agreementType: "uthyrningsuppdrag", version: UTHYRNINGSUPPDRAG.version,
      acceptedName: "Anna Andersson", language: "sv",
    });
    const properties = await state.db.select().from(schema.properties);
    expect(properties.find((p) => p.id === "p1")?.publishConsentAt).toBeTruthy();
    expect(properties.find((p) => p.id === "p2")?.publishConsentAt).toBeNull();
  });

  it("registrerar inte lov att visa annonsen online om publiceringsvalet inte gjorts", async () => {
    expect((await approve({ version: UTHYRNINGSUPPDRAG.version })).status).toBe(201);
    const [property] = await state.db.select().from(schema.properties).where(eq(schema.properties.id, "p1"));
    expect(property.publishConsentAt).toBeNull();
  });

  it("behåller ett giltigt tidigare godkännande utan att byta version eller starta om giltighetstiden", async () => {
    const acceptedAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await state.db.insert(schema.agreementAcceptances).values({
      id: "previous", ownerId: "o1", agreementType: "uthyrningsuppdrag", version: "2026-07-16.8",
      acceptedName: "Tidigare namn", acceptedAt,
    });
    const input = { version: UTHYRNINGSUPPDRAG.version };
    expect((await approve(input)).status).toBe(200);
    const acceptances = await state.db.select().from(schema.agreementAcceptances);
    expect(acceptances).toHaveLength(1);
    expect(acceptances.find((a) => a.id === "previous")).toMatchObject({
      version: "2026-07-16.8", acceptedName: "Tidigare namn", acceptedAt,
    });
  });

  it("förnyar först efter utgång och använder då den nya texten utan att skriva om historiken", async () => {
    const expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() - 13);
    await state.db.insert(schema.agreementAcceptances).values({
      id: "expired", ownerId: "o1", agreementType: "uthyrningsuppdrag", version: "2026-07-16.8",
      acceptedName: "Tidigare namn", acceptedAt: expiredAt.toISOString(),
    });
    const input = { version: UTHYRNINGSUPPDRAG.version };
    expect((await approve(input)).status).toBe(201);
    expect((await approve(input)).status).toBe(200);
    const acceptances = await state.db.select().from(schema.agreementAcceptances);
    expect(acceptances).toHaveLength(2);
    expect(acceptances.find((a) => a.id === "expired")?.acceptedAt).toBe(expiredAt.toISOString());
    expect(acceptances.find((a) => a.id !== "expired")?.version).toBe(UTHYRNINGSUPPDRAG.version);
  });

  it("låter kundens uppdragsbekräftelse godkännas med dess egen version och företagsscope", async () => {
    expect((await approve({ version: UPPDRAGSBEKRAFTELSE.version }, "tenant-token")).status).toBe(201);
    const [acceptance] = await state.db.select().from(schema.agreementAcceptances);
    expect(acceptance).toMatchObject({
      companyId: "c1", ownerId: null, agreementType: "uppdragsbekraftelse", version: UPPDRAGSBEKRAFTELSE.version,
    });
  });
});
