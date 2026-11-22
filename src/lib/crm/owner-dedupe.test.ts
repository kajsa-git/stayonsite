import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexOwner: vi.fn(async () => {}), removeFromIndex: vi.fn(async () => {}) }));
import { runOwnerDedupe } from "./owner-dedupe";
import { outboxMessages, owners, properties } from "./schema";

let cleanup: () => void;
beforeEach(async () => { ({ db: state.db, cleanup } = await createTestDb("owner-dedupe")); });
afterEach(() => cleanup());

describe("automatisk sammanslagning av uthyrare", () => {
  it("slår ihop samma telefon och e-post och flyttar bostäder och meddelanden", async () => {
    await state.db.insert(owners).values([
      { id: "old", name: "Anna Andersson", phone: "+46701234567", email: "anna@example.com", createdAt: "2026-01-01 10:00:00", notes: "Gammal anteckning" },
      { id: "new", name: "Anna A", phone: "+46701234567", email: "ANNA@example.com", orgNr: null, createdAt: "2026-11-20 10:00:00", notes: "Ny anteckning" },
    ]);
    await state.db.insert(properties).values({ id: "p1", ownerId: "new", address: "Nygatan 2" });
    await state.db.insert(outboxMessages).values({ id: "sms", ownerId: "new", toPhone: "+46701234567", body: "x", status: "sent", source: "crm" });

    const result = await runOwnerDedupe({ apply: true });
    expect(result.merged).toEqual([{ primaryId: "new", mergedIds: ["old"] }]);
    const left = await state.db.select().from(owners);
    expect(left.map((o) => o.id)).toEqual(["new"]);
    expect(left[0].notes).toContain("Sammanslagen");
    expect(left[0].notes).toContain("Anna Andersson");
    expect(left[0].notes).toContain("Gammal anteckning");
    const [property] = await state.db.select().from(properties).where(eq(properties.id, "p1"));
    expect(property.ownerId).toBe("new");
    const [sms] = await state.db.select().from(outboxMessages);
    expect(sms.ownerId).toBe("new");
  });

  it("rör inte två personer som delar telefon men har olika namn och e-post", async () => {
    await state.db.insert(owners).values([
      { id: "a", name: "Anna Andersson", phone: "+46701234567", email: "anna@example.com" },
      { id: "b", name: "Bertil Berg", phone: "+46701234567", email: "bertil@example.com" },
    ]);
    const result = await runOwnerDedupe({ apply: true });
    expect(result.groups).toEqual([]);
    expect(await state.db.select().from(owners)).toHaveLength(2);
  });

  it("ger den namnlösa webbposten namnet från den riktiga uthyraren", async () => {
    await state.db.insert(owners).values([
      { id: "lp", name: "Husägare · +46709999999", phone: "+46709999999", notes: "Inkommen från webb (lp-homeowner)", createdAt: "2026-11-01 10:00:00" },
      { id: "named", name: "Lars Larsson", phone: "+46709999999", createdAt: "2026-11-02 10:00:00" },
    ]);
    await state.db.insert(properties).values({ id: "p1", ownerId: "lp", address: "Byvägen 1" });
    await runOwnerDedupe({ apply: true });
    const left = await state.db.select().from(owners);
    expect(left).toHaveLength(1);
    expect(left[0]).toMatchObject({ id: "lp", name: "Lars Larsson" });
  });

  it("visar bara vad som skulle slås ihop när apply är av", async () => {
    await state.db.insert(owners).values([
      { id: "a", name: "Anna", phone: "+46701234567", email: "anna@example.com" },
      { id: "b", name: "Anna", phone: "+46701234567", email: "anna@example.com" },
    ]);
    const result = await runOwnerDedupe({ apply: false });
    expect(result.groups).toHaveLength(1);
    expect(result.merged).toEqual([]);
    expect(await state.db.select().from(owners)).toHaveLength(2);
  });
});
