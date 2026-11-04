import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { isHomeownerLeadForm, queueHomeownerLeadIntakeSms, shouldQueueHomeownerLeadIntakeSms } from "./homeowner-automation";
import { outboxMessages } from "./schema";

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
    expect(row.body).toContain("matchning med hyresgäster");
    expect(row.body).toContain("Inget visas utan ditt godkännande");
    expect(row.body).not.toMatch(/gratis|kostnadsfri/i);
    expect(row.body).toContain("HyrUtSmart - en del av StayOnSite");
    expect(row.body).toContain("www.hyrutsmart.se/registrera");
    expect(row.body).not.toContain("https://");
    expect(row.body).not.toContain("stayonsite.se/registrera-bostad");
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
