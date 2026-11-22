import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { WAITING_FOR_INTAKE, isHomeownerLeadForm, queueHomeownerLeadIntakeSms, releaseDueHomeownerNudges, shouldQueueHomeownerLeadIntakeSms } from "./homeowner-automation";
import { outboxMessages, owners, properties } from "./schema";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-homeowner-automation"));
});

afterEach(() => cleanup());

describe("homeowner lead automation", () => {
  it("omfattar både vanligt husägarformulär och LP-formulär", () => {
    expect(isHomeownerLeadForm("homeowner")).toBe(true);
    expect(isHomeownerLeadForm("lp-homeowner")).toBe(true);
    expect(isHomeownerLeadForm("hero-intent")).toBe(false);
  });

  it("köar intags-SMS för husägarlead även när e-post finns", () => {
    expect(shouldQueueHomeownerLeadIntakeSms({
      formType: "homeowner",
      hasCrmOwner: true,
      customerEmail: "dana@example.com",
    })).toBe(true);
    expect(shouldQueueHomeownerLeadIntakeSms({
      formType: "lp-homeowner",
      hasCrmOwner: true,
      customerEmail: null,
    })).toBe(true);
    expect(shouldQueueHomeownerLeadIntakeSms({
      formType: "homeowner",
      hasCrmOwner: false,
      customerEmail: "dana@example.com",
    })).toBe(false);
    expect(shouldQueueHomeownerLeadIntakeSms({
      formType: "inquiry",
      hasCrmOwner: true,
    })).toBe(false);
  });

  it("köar SMS-kvitto med länk till komplett bostadsregistrering för husägare", async () => {
    const result = await queueHomeownerLeadIntakeSms({
      db,
      owner: { id: "owner-1", phone: "070-123 45 67" },
    });

    expect(result.queued).toBe(true);

    const [row] = await db.select().from(outboxMessages).where(eq(outboxMessages.id, result.messageId!));
    expect(row).toMatchObject({
      toPhone: "+46701234567",
      status: "queued",
      ownerId: "owner-1",
      source: "intake",
    });
    expect(row.body).toContain("påbörjat registreringen");
    expect(row.body).toContain("matcha den med hyresgäster");
    expect(row.body).not.toMatch(/gratis|kostnadsfri/i);
    expect(row.body).toContain("/Kajsa, StayOnSite");
    expect(row.body).toContain("www.stayonsite.se/registrera-bostad");
    expect(row.body).not.toContain("https://");
    expect(row.body).not.toMatch(/hyrutsmart/i);
    expect(row.body).not.toContain("uthyrare/");

    // Ett GSM-7-sms rymmer 160 enheter. Tecken i extension-tabellen räknas
    // dubbelt; andra tecken skulle tvinga Unicode och ett lägre gränsvärde.
    const basic = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
    const extended = "^{}\\[~]|€\f";
    const characters = [...row.body];
    expect(characters.every((character) => basic.includes(character) || extended.includes(character))).toBe(true);
    const septets = characters.reduce((total, character) => total + (extended.includes(character) ? 2 : 1), 0);
    expect(septets).toBeLessThanOrEqual(160);
  });

  it("skapar inte dubbla identiska SMS samma dag", async () => {
    const args = {
      db,
      owner: { id: "owner-1", phone: "070-123 45 67" },
    };

    const first = await queueHomeownerLeadIntakeSms(args);
    const second = await queueHomeownerLeadIntakeSms(args);

    expect(first.queued).toBe(true);
    expect(second).toMatchObject({ queued: false, messageId: first.messageId, reason: "duplicate_today" });
    expect(await db.select().from(outboxMessages)).toHaveLength(1);
  });
});

describe("registreringspåminnelse för husägare som fortsätter direkt", () => {
  const sqliteTs = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);
  const now = new Date("2026-11-22T12:00:00Z");
  const fortyMinutesAgo = sqliteTs(new Date(now.getTime() - 40 * 60 * 1000));

  it("väntar med SMS:et när husägaren fortsätter till registreringen", async () => {
    await db.insert(owners).values({ id: "owner-1", name: "Anna", phone: "+46701234567", email: "anna@example.com" });
    await queueHomeownerLeadIntakeSms({ owner: { id: "owner-1", phone: "+46701234567" }, deferred: true, db });
    const [row] = await db.select().from(outboxMessages);
    expect(row.status).toBe(WAITING_FOR_INTAKE);
  });

  it("släpper SMS och mejl efter fördröjningen om ingen bostad registrerats", async () => {
    await db.insert(owners).values({ id: "owner-1", name: "Anna", phone: "+46701234567", email: "anna@example.com" });
    await db.insert(outboxMessages).values({ id: "nudge", ownerId: "owner-1", toPhone: "+46701234567", body: "x", status: WAITING_FOR_INTAKE, source: "intake", createdAt: fortyMinutesAgo });
    const sent: string[] = [];
    const result = await releaseDueHomeownerNudges({ now, db, sendEmail: async (to) => { sent.push(to); } });
    expect(result).toMatchObject({ released: 1, cancelled: 0 });
    const [row] = await db.select().from(outboxMessages).where(eq(outboxMessages.id, "nudge"));
    expect(row.status).toBe("queued");
    expect(sent).toEqual(["anna@example.com"]);

    // En andra körning skickar inte samma påminnelse igen.
    expect(await releaseDueHomeownerNudges({ now, db, sendEmail: async (to) => { sent.push(to); } })).toMatchObject({ released: 0 });
    expect(sent).toHaveLength(1);
  });

  it("rör inte påminnelser som är yngre än fördröjningen", async () => {
    await db.insert(outboxMessages).values({ id: "nudge", ownerId: "owner-1", toPhone: "+46701234567", body: "x", status: WAITING_FOR_INTAKE, source: "intake", createdAt: sqliteTs(new Date(now.getTime() - 10 * 60 * 1000)) });
    expect(await releaseDueHomeownerNudges({ now, db, sendEmail: async () => {} })).toMatchObject({ released: 0, cancelled: 0 });
  });

  it("stoppar påminnelsen när bostaden kopplats till en annan post med samma telefon", async () => {
    await db.insert(owners).values({ id: "old-anna", name: "Anna", phone: "+46701234567", email: "anna@example.com" });
    await db.insert(owners).values({ id: "owner-1", name: "Anna", phone: "+46701234567", email: "anna@example.com" });
    await db.insert(outboxMessages).values({ id: "nudge", ownerId: "owner-1", toPhone: "+46701234567", body: "x", status: WAITING_FOR_INTAKE, source: "intake", createdAt: fortyMinutesAgo });
    await db.insert(properties).values({ id: "p1", ownerId: "old-anna", address: "Nygatan 2", createdAt: sqliteTs(new Date(now.getTime() - 30 * 60 * 1000)) });
    expect(await releaseDueHomeownerNudges({ now, db, sendEmail: async () => {} })).toMatchObject({ released: 0, cancelled: 1 });
  });

  it("stoppar påminnelsen om husägaren hunnit registrera en bostad", async () => {
    await db.insert(owners).values({ id: "owner-1", name: "Anna", phone: "+46701234567", email: "anna@example.com" });
    await db.insert(outboxMessages).values({ id: "nudge", ownerId: "owner-1", toPhone: "+46701234567", body: "x", status: WAITING_FOR_INTAKE, source: "intake", createdAt: fortyMinutesAgo });
    await db.insert(properties).values({ id: "p1", ownerId: "owner-1", address: "Nygatan 2", createdAt: sqliteTs(new Date(now.getTime() - 30 * 60 * 1000)) });
    const sent: string[] = [];
    expect(await releaseDueHomeownerNudges({ now, db, sendEmail: async (to) => { sent.push(to); } })).toMatchObject({ released: 0, cancelled: 1 });
    const [row] = await db.select().from(outboxMessages).where(eq(outboxMessages.id, "nudge"));
    expect(row.status).toBe("cancelled");
    expect(sent).toHaveLength(0);
  });
});
