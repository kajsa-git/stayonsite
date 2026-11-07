import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTestDb, type TestDB } from "./test-db";
const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
import { acquireLandlordPropertyLock, releaseLandlordPropertyLock } from "./landlord-property-lock";
let cleanup: () => void;
beforeEach(async () => { ({ db: state.db, cleanup } = await createTestDb("landlord-property-lock")); });
afterEach(() => cleanup());

it("serializes different channels for the same property and releases only the owner's lease", async () => {
  const first = await acquireLandlordPropertyLock("property");
  expect(first).toBeTruthy();
  expect(await acquireLandlordPropertyLock("property")).toBeNull();
  await releaseLandlordPropertyLock("property", "wrong-token");
  expect(await acquireLandlordPropertyLock("property")).toBeNull();
  await releaseLandlordPropertyLock("property", first!);
  expect(await acquireLandlordPropertyLock("property")).toBeTruthy();
});
