import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PUBLICATION_CONSENT_VERSION } from "./publication-consent-text";
import { HUS_PUBLICATION_SMS_SOURCE, husPublicationSmsId } from "./hus-publication";
import { loadPublishConsentState, recordPublishConsent, webConsentEvidence, withdrawPublishConsent } from "./publish-consent";
import { agreementAcceptances, outboxMessages, owners, properties, propertyNotes } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

let db: TestDB;
let cleanup: () => void;
beforeEach(async () => {
  ({ db, cleanup } = await createTestDb("crm-pubconsent"));
  await db.insert(owners).values([{ id: "o1", name: "Anna Andersson" }, { id: "o2", name: "Berit Berg" }]);
  await db.insert(properties).values([
    { id: "p1", ownerId: "o1", address: "Gatan 1", city: "Boden", published: false },
    { id: "p2", ownerId: "o1", address: "Gatan 2", city: "Boden", published: false },
    { id: "p3", ownerId: "o2", address: "Annan väg 3", city: "Gävle", published: false },
    { id: "legacy", ownerId: "o1", published: true },
  ]);
});
afterEach(() => cleanup());

describe("publiceringsmedgivande", () => {
  it("visar äldre publicerade bostäder utan att hitta på ett nytt godkännande", async () => {
    const state = await loadPublishConsentState("o1", { db });
    expect(state.pending.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(state.consented.map((p) => p.id)).toEqual(["legacy"]);
    expect((await db.select().from(properties).where(eq(properties.id, "legacy")))[0].publishConsentAt).toBeNull();
  });

  it("sparar ett sms-ja med underlag för bara den valda bostaden", async () => {
    const stamped = await recordPublishConsent({ propertyIds: ["p1"], name: "Anna Andersson", source: "sms",
      acceptedAt: "2026-11-10", evidence: "SMS 10 november: Ja, lägg ut huset på hemsidan.", authorId: "kajsa" }, { db });
    expect(stamped.map((p) => p.id)).toEqual(["p1"]);
    const rows = await db.select().from(properties);
    expect(rows.find((p) => p.id === "p1")).toMatchObject({ publishConsentAt: "2026-11-10", publishConsentName: "Anna Andersson", publishConsentSource: "sms" });
    expect(rows.find((p) => p.id === "p2")?.publishConsentAt).toBeNull();
    const notes = await db.select().from(propertyNotes);
    expect(notes[0]).toMatchObject({ propertyId: "p1", channel: "sms", source: "publication-consent", authorId: "kajsa" });
    expect(notes[0].content).toContain("Ja, lägg ut huset på hemsidan");
    expect(await db.select().from(agreementAcceptances)).toHaveLength(0);
  });

  it("avvisar en annan ägares bostad och sparar inget för någon av bostäderna", async () => {
    await expect(recordPublishConsent({ ownerId: "o1", propertyIds: ["p1", "p3"], name: "Anna", source: "web", evidence: "Ja till publicering" }, { db })).rejects.toThrow();
    expect((await db.select().from(properties).where(eq(properties.id, "p1")))[0].publishConsentAt).toBeNull();
    expect(await db.select().from(propertyNotes)).toHaveLength(0);
  });

  it("bevarar befintligt underlag när samma medgivande skickas igen", async () => {
    const input = { ownerId: "o1", propertyIds: ["p1"], name: "Anna", source: "sms" as const, evidence: "SMS: ja till publicering" };
    await recordPublishConsent(input, { db });
    expect(await recordPublishConsent({ ...input, name: "Någon annan" }, { db })).toHaveLength(0);
    expect((await db.select().from(properties).where(eq(properties.id, "p1")))[0].publishConsentName).toBe("Anna");
    expect(await db.select().from(propertyNotes)).toHaveLength(1);
  });

  it("respekterar valet att inte publicera automatiskt och behåller HUS manuell", async () => {
    await recordPublishConsent({ propertyIds: ["p1"], name: "Anna", source: "sms", evidence: "Ja till publicering", autoPublishEnabled: false }, { db });
    expect((await db.select().from(properties).where(eq(properties.id, "p1")))[0].autoPublishEnabled).toBe(false);
    await db.update(properties).set({ notes: "HUS webbpublicering (2026-11-02.1): inte godkänd." }).where(eq(properties.id, "p2"));
    await recordPublishConsent({ propertyIds: ["p2"], name: "Anna", source: "sms", evidence: "Ja till publicering", autoPublishEnabled: true }, { db });
    expect((await db.select().from(properties).where(eq(properties.id, "p2")))[0].autoPublishEnabled).toBe(false);
  });

  it("sparar länkgodkännandet separat från förmedlingsvillkoren", async () => {
    await recordPublishConsent({ ownerId: "o1", propertyIds: ["p1"], name: "Anna", source: "web", ip: "127.0.0.1",
      evidence: webConsentEvidence(), webAcceptance: { shareLinkId: "l1", language: "sv" } }, { db });
    const [acceptance] = await db.select().from(agreementAcceptances);
    expect(acceptance).toMatchObject({ agreementType: "publiceringsmedgivande", version: PUBLICATION_CONSENT_VERSION, propertyId: "p1", ownerId: "o1" });
    expect((await db.select().from(propertyNotes))[0].content).toContain("ingen skyldighet att hyra ut");
  });

  it("återkallar publicering och prospekt, behåller historiken och stoppar ett väntande HUS-sms", async () => {
    await recordPublishConsent({ propertyIds: ["p1"], name: "Anna", source: "sms", evidence: "SMS: ja till publicering" }, { db });
    await db.update(properties).set({ published: true, prospektPublished: true, autoPublishEnabled: true }).where(eq(properties.id, "p1"));
    await db.insert(outboxMessages).values({ id: husPublicationSmsId("p1"), toPhone: "+46701234567", body: "länk", source: HUS_PUBLICATION_SMS_SOURCE, status: "queued" });
    expect(await withdrawPublishConsent({ propertyId: "p1", source: "mejl", name: "Anna", evidence: "Ta bort annonsen" }, { db })).toBe(true);
    expect((await db.select().from(properties).where(eq(properties.id, "p1")))[0]).toMatchObject({ publishConsentAt: null, publishConsentSource: "withdrawn", published: false, prospektPublished: false, autoPublishEnabled: false });
    expect((await db.select().from(outboxMessages))[0].status).toBe("pending_publication");
    expect((await db.select().from(propertyNotes)).map((n) => n.content).join(" ")).toContain("SMS: ja till publicering");
    expect((await db.select().from(propertyNotes)).map((n) => n.content).join(" ")).toContain("Ta bort annonsen");
    await recordPublishConsent({ propertyIds: ["p1"], name: "Anna", source: "mejl", evidence: "Ett nytt ja till publicering" }, { db });
    expect(await db.select().from(propertyNotes)).toHaveLength(3);
  });

  it("kan registrera ett nej även när inget äldre medgivande finns i CRM", async () => {
    expect(await withdrawPublishConsent({ propertyId: "p2", source: "sms", name: "Anna", evidence: "Visa inte huset medan det är uthyrt." }, { db })).toBe(true);
    expect((await db.select().from(properties).where(eq(properties.id, "p2")))[0]).toMatchObject({ publishConsentAt: null, publishConsentSource: "withdrawn", published: false });
    expect((await db.select().from(propertyNotes))[0].content).toContain("Visa inte huset medan det är uthyrt");
  });
});
