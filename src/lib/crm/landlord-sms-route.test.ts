import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { companies, contacts, landlordSmsDialogs, landlordSmsRuns, owners, properties } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB, authorized: true }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./auth", () => ({ requireApprovedSession: async () => state.authorized ? { user: { id: "test" } } : null }));
import { POST, PUT } from "../../../app/api/crm/landlord-sms-dialogs/route";
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "./landlord-property-lock";
let cleanup: () => void;
function request() { return new NextRequest("https://example.test/api/crm/landlord-sms-dialogs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ propertyId: "property" }) }); }
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("landlord-sms-route")); state.authorized = true;
  await state.db.insert(owners).values({ id: "owner", name: "Anna", phone: "0700000000" });
  await state.db.insert(properties).values({ id: "property", ownerId: "owner" });
});
afterEach(() => cleanup());

describe("landlord SMS enrollment", () => {
  it("requires a session and connects a number to only one selected property", async () => {
    state.authorized = false;
    expect((await POST(request())).status).toBe(401);
    state.authorized = true;
    expect((await POST(request())).status).toBe(201);
    expect((await POST(request())).status).toBe(409);
    expect((await state.db.select().from(landlordSmsDialogs))[0]).toMatchObject({ propertyId: "property", phone: "+46700000000", active: true });
  });
  it("does not enroll a number shared by different owners", async () => {
    await state.db.insert(owners).values({ id: "other", name: "Maria", phone: "+46 70 000 00 00" });
    expect((await POST(request())).status).toBe(409);
    expect(await state.db.select().from(landlordSmsDialogs)).toHaveLength(0);
  });
  it("waits when the other reply engine is processing the same number", async () => {
    const key = "channel:sms:+46700000000";
    const token = await acquireLandlordPropertyLock(key);
    expect(token).toBeTruthy();
    expect((await POST(request())).status).toBe(409);
    await releaseLandlordPropertyLock(key, token!);
    expect((await POST(request())).status).toBe(201);
  });
  it("does not enroll a number that is also a company contact", async () => {
    await state.db.insert(companies).values({ id: "company", name: "Test AB" });
    await state.db.insert(contacts).values({ id: "contact", companyId: "company", name: "Kontakt", phone: "+46700000000" });
    expect((await POST(request())).status).toBe(409);
    expect(await state.db.select().from(landlordSmsDialogs)).toHaveLength(0);
  });
  it("records a checked attachment without changing the delivery status", async () => {
    await POST(request());
    const [dialog] = await state.db.select().from(landlordSmsDialogs);
    await state.db.insert(landlordSmsRuns).values({ inboxGuid: "photo", dialogId: dialog.id, status: "queued",
      attachmentsNeedReview: true, createdAt: "2026-11-07T12:00:00Z", updatedAt: "2026-11-07T12:00:00Z" });
    const checked = new NextRequest("https://example.test/api/crm/landlord-sms-dialogs", { method: "PUT",
      headers: { "content-type": "application/json" }, body: JSON.stringify({ inboxGuid: "photo", checked: true }) });
    expect((await PUT(checked)).status).toBe(200);
    expect((await state.db.select().from(landlordSmsRuns))[0]).toMatchObject({ status: "queued", attachmentsNeedReview: false });
  });
});
