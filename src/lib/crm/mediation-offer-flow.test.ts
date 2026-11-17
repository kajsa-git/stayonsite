import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UTHYRNINGSUPPDRAG } from "./avtal";
import * as schema from "./schema";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: vi.fn(async () => ({ user: { id: "kajsa" } })) }));

import { PATCH as patchMatch } from "../../../app/api/crm/matches/[id]/route";
import { GET as listMatches } from "../../../app/api/crm/matches/route";
import { POST as approve } from "../../../app/api/share/[token]/agreement/route";
import { loadLandlordDeal } from "./deal-projection";
import { ensureShareLink, isCurrentLandlordMatchLink } from "./share-links";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("mediation-offer-flow"));
  await state.db.insert(schema.owners).values([{ id: "o1", name: "Anna" }, { id: "o2", name: "Bo" }]);
  await state.db.insert(schema.companies).values({ id: "c1", name: "Kund" });
  await state.db.insert(schema.requests).values([
    { id: "r1", companyId: "c1", status: "matching" },
    { id: "r2", companyId: "c1", status: "matching" },
  ]);
  await state.db.insert(schema.properties).values([
    { id: "p1", ownerId: "o1" }, { id: "p2", ownerId: "o1" },
  ]);
  await state.db.insert(schema.matches).values([
    { id: "m1", requestId: "r1", propertyId: "p1" },
    { id: "m2", requestId: "r1", propertyId: "p2" },
    { id: "m3", requestId: "r2", propertyId: "p1" },
  ]);
  await state.db.insert(schema.shareLinks).values([
    { id: "l1", token: "deal-one", audience: "landlord", requestId: "r1", matchId: "m1", ownerId: "o1" },
    { id: "l2", token: "wrong-request", audience: "landlord", requestId: "r2", matchId: "m1", ownerId: "o1" },
  ]);
  await state.db.insert(schema.agreementAcceptances).values({
    id: "old", ownerId: "o1", agreementType: "uthyrningsuppdrag", version: "2026-10-16.1",
    acceptedName: "Anna", acceptedAt: new Date().toISOString(),
  });
});
afterEach(() => cleanup());

const send = (id: string) => patchMatch(new NextRequest(`http://localhost/api/crm/matches/${id}`, {
  method: "PATCH", body: JSON.stringify({ status: "sent", offerRentOut: 15000 }),
}), { params: Promise.resolve({ id }) });
const sign = (token = "deal-one") => approve(new NextRequest(`http://localhost/api/share/${token}/agreement`, {
  method: "POST", body: JSON.stringify({ name: "Anna Andersson", version: UTHYRNINGSUPPDRAG.version }),
}), { params: Promise.resolve({ token }) });

describe("separata förmedlingsvillkor före kundförslag", () => {
  it("kräver godkännande för just den bostaden och förfrågan före nytt erbjudande", async () => {
    expect((await send("m1")).status).toBe(409);
    expect((await state.db.select().from(schema.matches).where(eq(schema.matches.id, "m1")))[0]).toMatchObject({ sentAt: null, offerRentOut: null });
    expect((await loadLandlordDeal("m1"))?.agreementAccepted).toBe(false);
    expect((await sign()).status).toBe(201);
    expect((await sign()).status).toBe(200);
    expect((await loadLandlordDeal("m1"))?.agreementAccepted).toBe(true);
    expect((await send("m1")).status).toBe(200);
    expect((await send("m2")).status).toBe(409);
    expect((await send("m3")).status).toBe(409);
    const response = await listMatches(new NextRequest("http://localhost/api/crm/matches?requestId=r1"));
    const rows = await response.json();
    expect(rows.find((row: { id: string }) => row.id === "m1").landlordSignedName).toBe("Anna Andersson");
    expect(rows.find((row: { id: string }) => row.id === "m2").landlordSignedAt).toBeNull();
    const old = (await state.db.select().from(schema.agreementAcceptances).where(eq(schema.agreementAcceptances.id, "old")))[0];
    expect(old).toMatchObject({ version: "2026-10-16.1", acceptedName: "Anna" });
  });

  it("avvisar en avtalslänk som pekar på fel förfrågan eller en avslutad förfrågan", async () => {
    expect((await sign("wrong-request")).status).toBe(404);
    await state.db.update(schema.requests).set({ status: "archived" }).where(eq(schema.requests.id, "r1"));
    expect((await sign()).status).toBe(404);
  });

  it("bevarar tidigare skickade erbjudanden och kräver ny ägares godkännande", async () => {
    expect((await sign()).status).toBe(201);
    await state.db.update(schema.properties).set({ ownerId: "o2" }).where(eq(schema.properties.id, "p1"));
    expect((await send("m1")).status).toBe(409);
    await state.db.update(schema.matches).set({ status: "sent", sentAt: "2026-10-01T12:00:00Z" }).where(eq(schema.matches.id, "m1"));
    expect((await send("m1")).status).toBe(200);
  });

  it("förnyar en äldre obunden länk och binder den nya till rätt uthyrare", async () => {
    await state.db.update(schema.shareLinks).set({ ownerId: null }).where(eq(schema.shareLinks.id, "l1"));
    expect((await sign()).status).toBe(404);
    const link = await ensureShareLink({ audience: "landlord", requestId: "r1", matchId: "m1" });
    expect(link).toMatchObject({ ownerId: "o1", requestId: "r1", matchId: "m1" });
    expect(link.id).not.toBe("l1");
    const [old] = await state.db.select().from(schema.shareLinks).where(eq(schema.shareLinks.id, "l1"));
    expect(old.revokedAt).toBeTruthy();
    expect((await sign(link.token)).status).toBe(201);
  });

  it("låter en tidigare skickad affär med verifierat äldre avtal behålla sin länk", async () => {
    await state.db.update(schema.shareLinks).set({ ownerId: null }).where(eq(schema.shareLinks.id, "l1"));
    await state.db.update(schema.matches).set({ status: "sent", sentAt: new Date().toISOString() }).where(eq(schema.matches.id, "m1"));
    await state.db.insert(schema.agreementAcceptances).values({
      id: "old-deal", ownerId: "o1", requestId: "r1", propertyId: "p1", shareLinkId: "l1",
      agreementType: "uthyrningsuppdrag", version: "2026-10-16.1", acceptedName: "Anna", acceptedAt: new Date().toISOString(),
    });
    const [link] = await state.db.select().from(schema.shareLinks).where(eq(schema.shareLinks.id, "l1"));
    expect(await isCurrentLandlordMatchLink(link)).toBe(true);
    expect((await loadLandlordDeal("m1"))?.agreementAccepted).toBe(true);
    const response = await listMatches(new NextRequest("http://localhost/api/crm/matches?requestId=r1"));
    const rows = await response.json();
    expect(rows.find((row: { id: string }) => row.id === "m1").landlordSignedName).toBe("Anna");
    await state.db.update(schema.matches).set({ status: "suggested", sentAt: null }).where(eq(schema.matches.id, "m1"));
    expect(await isCurrentLandlordMatchLink(link)).toBe(false);
    expect((await send("m1")).status).toBe(409);
  });
});
