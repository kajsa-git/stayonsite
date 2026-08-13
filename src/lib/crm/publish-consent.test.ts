import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadPublishConsentState, recordPublishConsent } from "./publish-consent";
import { owners, properties } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;

beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-pubconsent"));
  await db.insert(owners).values([{ id: "o1", name: "Anna Andersson" }, { id: "o2", name: "Berit Berg" }]);
  await db.insert(properties).values([
    { id: "p-pending", ownerId: "o1", address: "Gatan 1", city: "Boden", published: false },
    { id: "p-published", ownerId: "o1", address: "Gatan 2", city: "Boden", published: true },
    { id: "p-other-owner", ownerId: "o2", address: "Annan väg 3", city: "Gävle", published: false },
  ]);
});

afterEach(() => cleanup());

describe("loadPublishConsentState", () => {
  it("skiljer väntande från godkända — publicerat räknas som implicit godkänt", async () => {
    const state = await loadPublishConsentState("o1", { db });
    expect(state.pending.map((p) => p.id)).toEqual(["p-pending"]);
    expect(state.consented.map((p) => p.id)).toEqual(["p-published"]);
  });
});

describe("recordPublishConsent", () => {
  it("stämplar bara ägarens väntande objekt — aldrig publicerade eller andras", async () => {
    const stamped = await recordPublishConsent({ ownerId: "o1", name: "Anna Andersson", source: "web", ip: "1.2.3.4" }, { db });
    expect(stamped.map((p) => p.id)).toEqual(["p-pending"]);

    const [row] = await db.select().from(properties).where(eq(properties.id, "p-pending"));
    expect(row.publishConsentAt).toBeTruthy();
    expect(row.publishConsentName).toBe("Anna Andersson");
    expect(row.publishConsentSource).toBe("web");
    expect(row.publishConsentIp).toBe("1.2.3.4");

    const [other] = await db.select().from(properties).where(eq(properties.id, "p-other-owner"));
    expect(other.publishConsentAt).toBeNull();
    const [pub] = await db.select().from(properties).where(eq(properties.id, "p-published"));
    expect(pub.publishConsentAt).toBeNull();
  });

  it("är idempotent — bevis skrivs aldrig om", async () => {
    await recordPublishConsent({ ownerId: "o1", name: "Anna", source: "web" }, { db });
    const [first] = await db.select().from(properties).where(eq(properties.id, "p-pending"));

    const again = await recordPublishConsent({ ownerId: "o1", name: "Någon Annan", source: "crm" }, { db });
    expect(again).toHaveLength(0);
    const [second] = await db.select().from(properties).where(eq(properties.id, "p-pending"));
    expect(second.publishConsentAt).toBe(first.publishConsentAt);
    expect(second.publishConsentName).toBe("Anna");
  });

  it("tomt namn lagras som null", async () => {
    await recordPublishConsent({ ownerId: "o1", name: "  ", source: "web" }, { db });
    const [row] = await db.select().from(properties).where(eq(properties.id, "p-pending"));
    expect(row.publishConsentName).toBeNull();
  });
});
