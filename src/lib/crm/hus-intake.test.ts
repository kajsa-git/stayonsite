import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}), indexOwner: vi.fn(async () => {}) }));
import { createPropertyIntake, propertyIntakeSchema } from "./property-intake";
import { HUS_INTAKE_VERSION, HUS_PUBLICATION_SMS_SOURCE, HUS_UPLOAD_LINK_ACTOR, husPublicationSmsId } from "./hus-publication";
import { ensureShareLink } from "./share-links";
import { agreementAcceptances, outboxMessages, owners, ownerOutreach, properties } from "./schema";
import { homeownerLeadIntakeSms } from "./sms-templates";

let cleanup: () => void;
beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("hus-intake"));
  await state.db.insert(owners).values({ id: "o1", name: "Anna Exempel", phone: "+46701234567", ownerType: "privatperson" });
  await state.db.insert(properties).values({ id: "old", ownerId: "o1", city: "Boden", address: "Annan gata 1", published: false });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const raw = {
  ownerName: "Anna Exempel", ownerPhone: "0701234567", address: "Nygatan 2", postalCode: "961 00",
  city: "Boden", bedrooms: 2, beds: 4, source: "HUS", consent: true,
  husPublication: { version: HUS_INTAKE_VERSION, approved: true },
};

describe("HUS registration", () => {
  it("stores rental rights on each property independently for the same landlord", async () => {
    const first = await createPropertyIntake(propertyIntakeSchema.parse({ ...raw, rentalRight:"ager" }));
    const second = await createPropertyIntake(propertyIntakeSchema.parse({ ...raw, address:"Andra gatan 4", rentalRight:"andrahand" }));
    expect(first.property.ownerId).toBe("o1");
    expect(second.property.ownerId).toBe("o1");
    const [owned] = await state.db.select().from(properties).where(eq(properties.id, first.property.id));
    const [sublet] = await state.db.select().from(properties).where(eq(properties.id, second.property.id));
    expect(owned.rentalRight).toBe("ager");
    expect(sublet.rentalRight).toBe("andrahand");
    expect(propertyIntakeSchema.safeParse({ ...raw, rentalRight:"invalid" }).success).toBe(false);
  });
  it("records consent only for the submitted property and defers its SMS and publication", async () => {
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse(raw));
    expect(property).toMatchObject({ ownerId: "o1", published: false, autoPublishEnabled: false, publishConsentName: "Anna Exempel", publishConsentSource: "hus", publishConsentIp: null });
    expect(property.publishConsentAt).toBeTruthy();
    expect(property.notes).toContain(`HUS webbpublicering (${HUS_INTAKE_VERSION}): godkänd`);
    const [old] = await state.db.select().from(properties).where(eq(properties.id, "old"));
    expect(old.publishConsentAt).toBeNull();
    expect(await state.db.select().from(agreementAcceptances)).toHaveLength(0);
    const [message] = await state.db.select().from(outboxMessages).where(eq(outboxMessages.id, husPublicationSmsId(property.id)));
    expect(message).toMatchObject({ toPhone: "+46701234567", status: "pending_publication", source: HUS_PUBLICATION_SMS_SOURCE });
  });

  it("does not fabricate consent when the choice is unchecked", async () => {
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse({ ...raw, husPublication: { ...raw.husPublication, approved: false } }));
    expect(property).toMatchObject({ published: false, autoPublishEnabled: false, publishConsentAt: null, publishConsentName: null });
    expect(property.notes).toContain("inte godkänd");
  });

  it("reuses an unambiguous older short enquiry and keeps one property follow-up", async () => {
    await state.db.update(owners).set({ followUpDate: "2026-11-04", followUpReason: "Ny husägare från webb" }).where(eq(owners.id, "o1"));
    await state.db.insert(properties).values({ id: "lead", ownerId: "o1", postalCode: "96100", status: "off_market", notes: "Inkommen från webb (homeowner)\nKälla: homeowner-conversion" });
    await state.db.insert(ownerOutreach).values({ id: "lead-followup", ownerId: "o1", propertyId: "lead", status: "ej_kontaktad", nextFollowUpDate: "2026-11-04", nextFollowUpReason: "Ny husägare från webb" });
    await state.db.insert(outboxMessages).values({ id: "old-sms", ownerId: "o1", toPhone: "+46701234567", body: homeownerLeadIntakeSms(), status: "queued", source: "intake" });
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse(raw));
    expect(property).toMatchObject({ id: "lead", address: "Nygatan 2", published: false, autoPublishEnabled: false });
    expect(property.notes).toContain("Inkommen från webb (homeowner)");
    expect(property.notes).toContain("HUS webbpublicering");
    expect((await state.db.select().from(properties).where(eq(properties.ownerId, "o1")))).toHaveLength(2);
    const rounds = await state.db.select().from(ownerOutreach).where(eq(ownerOutreach.ownerId, "o1"));
    expect(rounds).toHaveLength(1);
    expect(rounds[0]).toMatchObject({ id: "lead-followup", nextFollowUpReason: "Nytt bostadsintag: granska uppgifter och bilder" });
    const [owner] = await state.db.select().from(owners).where(eq(owners.id, "o1"));
    expect(owner.followUpDate).toBeNull();
    const [oldSms] = await state.db.select().from(outboxMessages).where(eq(outboxMessages.id, "old-sms"));
    expect(oldSms.status).toBe("cancelled");
  });

  it("does not merge ambiguous addressless properties", async () => {
    for (const id of ["lead1", "lead2"]) await state.db.insert(properties).values({ id, ownerId: "o1", postalCode: "96100", status: "off_market", notes: "Inkommen från webb (homeowner)" });
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse(raw));
    expect(property.id).not.toMatch(/^lead/);
    expect((await state.db.select().from(properties).where(eq(properties.ownerId, "o1")))).toHaveLength(4);
  });

  it("preserves an unrelated owner follow-up when a HUS intake arrives", async () => {
    await state.db.update(owners).set({ followUpDate: "2026-12-01", followUpReason: "Stäm av en annan bostad" }).where(eq(owners.id, "o1"));
    await createPropertyIntake(propertyIntakeSchema.parse(raw));
    const [owner] = await state.db.select().from(owners).where(eq(owners.id, "o1"));
    expect(owner).toMatchObject({ followUpDate: "2026-12-01", followUpReason: "Stäm av en annan bostad" });
  });

  it("does not merge different owners merely because they share a phone number", async () => {
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse({ ...raw, ownerName: "Kajsa Flödestest", ownerEmail: "hus-test@example.se" }));
    expect(property.ownerId).not.toBe("o1");
    const [original] = await state.db.select().from(owners).where(eq(owners.id, "o1"));
    expect(original).toMatchObject({ name: "Anna Exempel", phone: "+46701234567", email: null });
  });

  it("upgrades one unambiguous phone-only lead when the full HUS registration arrives", async () => {
    await state.db.insert(owners).values({ id: "lead-owner", name: "Husägare · +46709998877", phone: "+46709998877", notes: "Inkommen från webb (lp-homeowner)", followUpReason: "Ny husägare från webb", followUpDate: "2026-11-04" });
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse({ ...raw, ownerName: "Lisa Exempel", ownerPhone: "0709998877", ownerEmail: "lisa@example.se" }));
    expect(property.ownerId).toBe("lead-owner");
    const [owner] = await state.db.select().from(owners).where(eq(owners.id, "lead-owner"));
    expect(owner).toMatchObject({ name: "Lisa Exempel", email: "lisa@example.se", followUpDate: null });
    expect((await state.db.select().from(ownerOutreach).where(eq(ownerOutreach.ownerId, "lead-owner")))).toHaveLength(1);
  });

  it("does not attach an ambiguous phone-only lead when a named owner shares the number", async () => {
    await state.db.insert(owners).values({ id: "lead-owner", name: "Husägare · +46701234567", phone: "+46701234567", notes: "Inkommen från webb (lp-homeowner)" });
    const { property } = await createPropertyIntake(propertyIntakeSchema.parse({ ...raw, ownerName: "Lisa Exempel", ownerEmail: "lisa@example.se" }));
    expect(property.ownerId).not.toBe("lead-owner");
    expect(property.ownerId).not.toBe("o1");
    expect((await state.db.select().from(owners).where(eq(owners.id, "lead-owner")))[0].name).toBe("Husägare · +46701234567");
  });

  it("rejects a stale consent version and an invalid number before saving", () => {
    expect(propertyIntakeSchema.safeParse({ ...raw, husPublication: { version: "old", approved: true } }).success).toBe(false);
    expect(propertyIntakeSchema.safeParse({ ...raw, ownerPhone: "123456" }).success).toBe(false);
  });

  it("suppresses early agreement reminders for HUS but restores normal reminders for a later standard intake", async () => {
    const husLink = await ensureShareLink({ audience: "landlord", ownerId: "o1", intakePurpose: "hus-upload" });
    expect(husLink.createdBy).toBe(HUS_UPLOAD_LINK_ACTOR);
    const normalLink = await ensureShareLink({ audience: "landlord", ownerId: "o1", intakePurpose: "agreement" });
    expect(normalLink.id).toBe(husLink.id);
    expect(normalLink.createdBy).toBeNull();
  });
});
