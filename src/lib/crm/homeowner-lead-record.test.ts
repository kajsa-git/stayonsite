import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { owners, properties, ownerOutreach, outboxMessages } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(), indexOwner: vi.fn(async () => {}), indexCompany: vi.fn(), indexContact: vi.fn(), indexRequest: vi.fn() }));
import { mapWebSubmissionToCrm } from "./contact-intake";
import { createPropertyIntake, propertyIntakeSchema } from "./property-intake";
import { queueHomeownerLeadIntakeSms } from "./homeowner-automation";
import { HUS_INTAKE_VERSION } from "./hus-publication";

let cleanup: () => void;
beforeEach(async () => { ({ db: state.db, cleanup } = await createTestDb("short-homeowner")); });
afterEach(() => cleanup());

it("stores a short interest on the owner without creating an addressless property", async () => {
  const result = await mapWebSubmissionToCrm({
    formType: "homeowner", locale: "sv", page: "/for-husagare", source: "homeowner-conversion",
    fields: { name: "Anna Exempel", email: "anna@example.se", phone: "0701234567", bedrooms: "2", postalCode: "96100" },
  });
  expect(result.type).toBe("homeowner");
  const [owner] = await state.db.select().from(owners);
  expect(owner.notes).toContain("Postnummer: 96100");
  expect(owner.notes).toContain("Sovrum: 2");
  expect(owner.followUpDate).toBeTruthy();
  expect(await state.db.select().from(properties)).toHaveLength(0);
  expect(await state.db.select().from(ownerOutreach)).toHaveLength(0);
});

it("keeps a phone-only enquiry separate from a named owner using the same number", async () => {
  await state.db.insert(owners).values({ id: "existing", name: "KM Group AB", phone: "+46701234567", notes: "Befintlig uthyrare" });
  const lead = {
    formType: "lp-homeowner" as const, locale: "sv" as const, page: "/lp/husagare", source: "facebook-landing",
    fields: { phone: "0701234567", city: "Boden" },
  };
  await mapWebSubmissionToCrm(lead);
  await mapWebSubmissionToCrm(lead);
  const rows = await state.db.select().from(owners);
  expect(rows).toHaveLength(2);
  expect(rows.find((owner) => owner.id === "existing")).toMatchObject({ name: "KM Group AB", notes: "Befintlig uthyrare", followUpDate: null });
  expect(rows.find((owner) => owner.id !== "existing")?.name).toBe("Husägare · +46701234567");
});

it("does not overwrite a different named owner who shares a phone", async () => {
  await state.db.insert(owners).values({ id: "existing", name: "Tidigare ägare", phone: "+46701234567", email: "old@example.se" });
  await mapWebSubmissionToCrm({ formType: "homeowner", locale: "sv", page: "/for-husagare", fields: {
    name: "Ny ägare", email: "new@example.se", phone: "0701234567",
  } });
  const rows = await state.db.select().from(owners);
  expect(rows).toHaveLength(2);
  expect(rows.find((owner) => owner.id === "existing")?.email).toBe("old@example.se");
});

it("connects a phone-only enquiry to the full registration and cancels its obsolete invitation", async () => {
  await mapWebSubmissionToCrm({ formType: "lp-homeowner", locale: "sv", page: "/lp/husagare", fields: { phone: "0701234567" } });
  const [lead] = await state.db.select().from(owners);
  await queueHomeownerLeadIntakeSms({ owner: lead, db: state.db });
  const { property } = await createPropertyIntake(propertyIntakeSchema.parse({
    ownerName: "Anna Exempel", ownerEmail: "anna@example.se", ownerPhone: "0701234567",
    address: "Nygatan 2", postalCode: "961 00", city: "Boden", bedrooms: 2, beds: 2,
    source: "HUS", consent: true, husPublication: { version: HUS_INTAKE_VERSION, approved: true },
  }));
  expect(property.ownerId).toBe(lead.id);
  expect(await state.db.select().from(owners)).toHaveLength(1);
  expect(await state.db.select().from(properties)).toHaveLength(1);
  expect(await state.db.select().from(ownerOutreach)).toHaveLength(1);
  const messages = await state.db.select().from(outboxMessages);
  expect(messages.find((message) => message.source === "intake")?.status).toBe("cancelled");
  expect(messages.find((message) => message.source === "hus_publication")?.status).toBe("pending_publication");
});
