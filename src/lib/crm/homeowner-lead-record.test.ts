import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
import { owners, properties, ownerOutreach } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(), indexOwner: vi.fn(async () => {}), indexCompany: vi.fn(), indexContact: vi.fn(), indexRequest: vi.fn() }));
import { mapWebSubmissionToCrm } from "./contact-intake";

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
