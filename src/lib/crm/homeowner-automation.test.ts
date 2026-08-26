import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { isHomeownerLeadForm, queueHomeownerLeadIntakeSms } from "./homeowner-automation";
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

  it("köar SMS-kvitto med länk till komplett bostadsregistrering för telefon-only husägare", async () => {
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
    expect(row.body).toBe([
      "Hej! Tack för att du hörde av dig om din bostad.",
      "Fyll gärna i bostaden här så vi kan bedöma och lägga ut den på hemsidan för uthyrning:",
      "www.stayonsite.se/registrera-bostad",
      "Mvh Kajsa",
      "StayOnSite",
    ].join("\n"));
    expect(row.body).not.toContain("uthyrare/");
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
