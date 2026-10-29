import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { TestDB } from "./test-db";
import { createTestDb } from "./test-db";
import { properties } from "./schema";
import { propertyContentHash } from "./property-content-policy";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./r2", () => ({ R2_BUCKET: "test", r2: {} }));

import { GET } from "../../../app/api/listings/route";
import { loadPublicProperty } from "./public-property";
import { getPublicListingLinks } from "./public-listing-links";

let cleanup: () => void;

beforeEach(async () => {
  const created = await createTestDb("website-publication");
  state.db = created.db;
  cleanup = created.cleanup;

  for (const [id, status, published, approved] of [
    ["available", "available", true, true],
    ["off-market", "off_market", true, true],
    ["rented", "rented", true, true],
    ["reserved", "reserved", true, true],
    ["unpublished", "off_market", false, true],
    ["unreviewed", "rented", true, false],
    ["stale", "off_market", true, true],
  ] as const) {
    await state.db.insert(properties).values({
      id, slug: id, status, published,
      address: "Privatgatan 9", rentIn: 12345, rentOut: 23456,
      publicName: `Boende ${id}`, publicDescription: "Ett möblerat boende.",
      publicDescriptionEn: "Furnished accommodation.", publicDescriptionPl: "Umeblowane zakwaterowanie.",
      contentReviewStatus: approved ? "approved" : "needs_review",
    });
    const [row] = await state.db.select().from(properties).where(eq(properties.id, id));
    await state.db.update(properties).set({ contentReviewHash: propertyContentHash(row, []) }).where(eq(properties.id, id));
  }
  // A stale approval must not become public just because its status is allowed.
  await state.db.update(properties).set({ publicDescription: "Ändrad text." }).where(eq(properties.id, "stale"));
});

afterEach(() => cleanup());

describe("public website publication", () => {
  it("shows eligible statuses but keeps unpublished, reserved and unreviewed records private", async () => {
    const response = await GET();
    const rows = await response.json() as Record<string, unknown>[];
    expect(rows.map((row) => row.id).sort()).toEqual(["available", "off-market", "rented"]);
    for (const row of rows) {
      expect(row).not.toHaveProperty("address");
      expect(row).not.toHaveProperty("rentIn");
      expect(row).not.toHaveProperty("rentOut");
      expect(row).not.toHaveProperty("status");
    }
    expect((await getPublicListingLinks()).map((row) => row.slug).sort()).toEqual(["available", "off-market", "rented"]);
  });

  it("applies the same gates to direct property links", async () => {
    for (const id of ["available", "off-market", "rented"]) {
      const result = await loadPublicProperty(id, { surface: "web" });
      expect(result?.row.id).toBe(id);
      expect(result?.row).not.toHaveProperty("address");
      expect(result?.row).not.toHaveProperty("rentIn");
    }
    for (const id of ["reserved", "unpublished", "unreviewed", "stale"]) {
      expect(await loadPublicProperty(id, { surface: "web" })).toBeNull();
    }
  });
});
