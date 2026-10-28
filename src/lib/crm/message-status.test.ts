import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { reportMessageStatus } from "./message-status";
import { inboxMessages, outboxMessages } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("message-status"));
  await db.insert(inboxMessages).values([
    { id: "in1", guid: "g1", fromPhone: "+46701111111", body: "Hej", sentAt: "2026-10-28T08:00:00Z", isRead: false },
    { id: "in2", guid: "g2", fromPhone: "+46701111111", body: "En följdfråga", sentAt: "2026-10-28T08:05:00Z", isRead: false },
  ]);
  await db.insert(outboxMessages).values({
    id: "reply", toPhone: "+46701111111", body: "Hej tillbaka", status: "queued", replyToInboxIds: ["in1"],
  });
});
afterEach(() => cleanup());

describe("status för svar", () => {
  it("markerar bara det besvarade meddelandet när agenten rapporterar skickat", async () => {
    expect((await db.select().from(inboxMessages).where(eq(inboxMessages.id, "in1")))[0].isRead).toBe(false);
    await reportMessageStatus("reply", { ok: true }, { db });
    const rows = await db.select().from(inboxMessages);
    expect(rows.find((m) => m.id === "in1")?.isRead).toBe(true);
    expect(rows.find((m) => m.id === "in2")?.isRead).toBe(false);
  });

  it("visar svaret igen vid senare fel utan att ange leverans", async () => {
    await reportMessageStatus("reply", { ok: true }, { db });
    await reportMessageStatus("reply", { ok: false, error: "Leveransfel" }, { db });
    const [incoming] = await db.select().from(inboxMessages).where(eq(inboxMessages.id, "in1"));
    const [outgoing] = await db.select().from(outboxMessages).where(eq(outboxMessages.id, "reply"));
    expect(incoming.isRead).toBe(false);
    expect(outgoing).toMatchObject({ status: "failed", deliveredAt: null, error: "Leveransfel" });
  });

  it("registrerar leverans endast efter särskild bekräftelse", async () => {
    await reportMessageStatus("reply", { ok: true }, { db });
    expect((await db.select().from(outboxMessages))[0].deliveredAt).toBeNull();
    await reportMessageStatus("reply", { delivered: true }, { db });
    expect((await db.select().from(outboxMessages))[0].deliveredAt).toBeTruthy();
  });

  it("upprepar inte en gammal felrapport efter manuell hantering", async () => {
    await reportMessageStatus("reply", { ok: false }, { db });
    await db.update(inboxMessages).set({ isRead: true }).where(eq(inboxMessages.id, "in1"));
    await reportMessageStatus("reply", { ok: false }, { db });
    expect((await db.select().from(inboxMessages).where(eq(inboxMessages.id, "in1")))[0].isRead).toBe(true);
  });

  it("ett äldre misslyckat svar återöppnar inte ett senare lyckat svar", async () => {
    await db.update(outboxMessages).set({ status: "sent", sentAt: "2026-10-28T08:10:00Z" }).where(eq(outboxMessages.id, "reply"));
    await db.insert(outboxMessages).values({ id: "newer", toPhone: "+46701111111", body: "Nytt svar", status: "sent", sentAt: "2026-10-28T08:15:00Z", replyToInboxIds: ["in1"] });
    await db.update(inboxMessages).set({ isRead: true }).where(eq(inboxMessages.id, "in1"));
    await reportMessageStatus("reply", { ok: false }, { db });
    expect((await db.select().from(inboxMessages).where(eq(inboxMessages.id, "in1")))[0].isRead).toBe(true);
  });
});
