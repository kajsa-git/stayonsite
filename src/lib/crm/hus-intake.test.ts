import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}), indexOwner: vi.fn(async () => {}) }));
import { createPropertyIntake, propertyIntakeSchema } from "./property-intake";
import { HUS_INTAKE_VERSION, HUS_PUBLICATION_SMS_SOURCE, HUS_UPLOAD_LINK_ACTOR, husPublicationSmsId } from "./hus-publication";
import { ensureShareLink } from "./share-links";
import { agreementAcceptances, outboxMessages, owners, properties } from "./schema";

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
