import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, type TestDB } from "./test-db";
import { owners, properties } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
import { normalizePropertyWriteBody } from "./owners";

let cleanup: () => void;

beforeEach(async () => {
  ({ db: state.db, cleanup } = await createTestDb("owner-patch"));
  await state.db.insert(owners).values({
    id: "owner", name: "Anna", ownerType: null, ownerArrangement: null,
    email: "old@example.se", phone: "+46701234567", rating: 8,
  });
  await state.db.insert(properties).values({ id: "property", ownerId: "owner" });
});

afterEach(() => cleanup());

describe("partiell uppdatering av länkad uthyrare", () => {
  it("ändrar bara fältet som skickats med bostaden", async () => {
    const [property] = await state.db.select().from(properties).where(eq(properties.id, "property"));
    await normalizePropertyWriteBody({ ownerEmail: "new@example.se" }, property);
    const [owner] = await state.db.select().from(owners).where(eq(owners.id, "owner"));
    expect(owner).toMatchObject({
      name: "Anna", ownerType: null, ownerArrangement: null, email: "new@example.se",
      phone: "+46701234567", rating: 8,
    });
  });

  it("kan uttryckligen tömma ett fält utan att tömma andra", async () => {
    const [property] = await state.db.select().from(properties).where(eq(properties.id, "property"));
    await normalizePropertyWriteBody({ ownerId: "owner", ownerEmail: null }, property);
    const [owner] = await state.db.select().from(owners).where(eq(owners.id, "owner"));
    expect(owner).toMatchObject({ name: "Anna", email: null, phone: "+46701234567", rating: 8 });
  });
});
