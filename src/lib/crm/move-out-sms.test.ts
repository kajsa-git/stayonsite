import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MOVE_OUT_LANDLORD_MESSAGE_KEY } from "./move-checklists";
import { moveOutSmsSource } from "./move-out-sms";
import { reportMessageStatus } from "./message-status";
import { queueMoveOutSms } from "./queue-move-out-sms";
import { applyRequestUpdate } from "./request-update";
import { companies, contacts, outboxMessages, owners, properties, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;
const baseChecklist = ["confirmed", "keys_back", "cleaning", "condition", "available"];
const tenant = { toPhone: "0701111111", body: "Utflyttningsinfo till hyresgästen", contactId: "contact", ownerId: null,
  recipient: "tenant", submissionId: "tenant-1234567890123456" };
const landlord = { toPhone: "0702222222", body: "Utflyttningsinfo till uthyraren", contactId: null, ownerId: "owner",
  recipient: "landlord", submissionId: "landlord-12345678901234" };

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("move-out-sms"));
  await db.insert(companies).values({ id: "company", name: "Testföretag" });
  await db.insert(contacts).values({ id: "contact", companyId: "company", name: "Kontakt", phone: "0701111111" });
  await db.insert(owners).values({ id: "owner", name: "Uthyrare", phone: "0702222222" });
  await db.insert(properties).values({ id: "property", ownerId: "owner", address: "Testgatan 1" });
  await db.insert(requests).values({ id: "request", companyId: "company", status: "won", endDate: "2026-12-01",
    wonPropertyId: "property", moveOutChecklist: baseChecklist });
});
afterEach(() => cleanup());

const finish = () => applyRequestUpdate("request", { moveOutDoneAt: "2026-12-01T12:00:00Z" }, {
  db, indexRequest: async () => undefined, indexProperty: async () => undefined,
});

describe("utflyttningsmeddelanden", () => {
  it("kräver kontrollerade uppgifter och rätt kopplad mottagare", async () => {
    expect(await queueMoveOutSms("request", { ...tenant, body: "Nyckel: [instruktion]" }, { db })).toMatchObject({ ok: false, status: 400 });
    expect(await queueMoveOutSms("request", { ...tenant, toPhone: "0709999999" }, { db })).toMatchObject({ ok: false, status: 400 });
    expect(await queueMoveOutSms("request", { ...landlord, toPhone: "0709999999" }, { db })).toMatchObject({ ok: false, status: 400 });
    expect(await db.select().from(outboxMessages)).toHaveLength(0);
  });

  it("köar mottagarna var för sig och hindrar dubbla pågående utskick", async () => {
    const first = await queueMoveOutSms("request", tenant, { db });
    expect(first.ok).toBe(true);
    const repeat = await queueMoveOutSms("request", tenant, { db });
    expect(repeat).toEqual(first);
    expect(await queueMoveOutSms("request", { ...tenant, submissionId: "second-1234567890123456" }, { db })).toMatchObject({ ok: false, status: 409 });
    expect((await queueMoveOutSms("request", landlord, { db })).ok).toBe(true);
    const messages = await db.select().from(outboxMessages);
    expect(messages).toHaveLength(2);
    expect(messages.map((m) => m.source).sort()).toEqual([moveOutSmsSource("request", "landlord"), moveOutSmsSource("request", "tenant")]);
  });

  it("hindrar dubbla utskick även om två flikar skickar samtidigt", async () => {
    const results = await Promise.all([
      queueMoveOutSms("request", tenant, { db }),
      queueMoveOutSms("request", { ...tenant, submissionId: "second-1234567890123456" }, { db }),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => result.ok === false)).toMatchObject([{ status: 409 }]);
    expect(await db.select().from(outboxMessages)).toHaveLength(1);
  });

  it("räknar bara skickade meddelanden och hanterar senare fel utan att skriva om checklistan", async () => {
    const a = await queueMoveOutSms("request", tenant, { db });
    const b = await queueMoveOutSms("request", landlord, { db });
    if (a.ok === false || b.ok === false) throw new Error("Utskicken kunde inte köas");
    expect(await finish()).toMatchObject({ ok: false, status: 400 });
    await reportMessageStatus(a.message.id, { ok: true }, { db });
    expect(await finish()).toMatchObject({ ok: false, status: 400 });
    await reportMessageStatus(b.message.id, { ok: true }, { db });
    await reportMessageStatus(a.message.id, { ok: false, error: "misslyckades" }, { db });
    expect(await finish()).toMatchObject({ ok: false, status: 400 });
    const retry = await queueMoveOutSms("request", { ...tenant, submissionId: "retry-1234567890123456" }, { db });
    if (retry.ok === false) throw new Error("Nytt försök kunde inte köas");
    await reportMessageStatus(retry.message.id, { ok: true }, { db });
    expect((await finish()).ok).toBe(true);
    expect((await db.select().from(requests).where(eq(requests.id, "request")))[0].moveOutChecklist).toEqual(baseChecklist);
  });

  it("godtar manuell markering när till exempel ett WhatsApp-meddelande skickats", async () => {
    await db.update(requests).set({ moveOutChecklist: [...baseChecklist, MOVE_OUT_LANDLORD_MESSAGE_KEY] }).where(eq(requests.id, "request"));
    const result = await queueMoveOutSms("request", tenant, { db });
    if (result.ok === false) throw new Error("Sms:et kunde inte köas");
    await reportMessageStatus(result.message.id, { ok: true }, { db });
    expect((await finish()).ok).toBe(true);
  });
});
