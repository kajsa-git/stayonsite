import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { GetObjectCommand } from "@aws-sdk/client-s3";
import { createTestDb, type TestDB } from "./test-db";
import { owners, properties, propertyImages } from "./schema";
import { propertyContentHash } from "./property-content-policy";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./r2", () => ({ r2: {}, R2_BUCKET: "test-images" }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async (_client, command) => `https://images.example.test/${command.input.Key}`),
}));
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCityListings } from "./city-listings";

let cleanup: () => void;

async function approve(id: string) {
  const [property] = await state.db.select().from(properties).where(eq(properties.id, id));
  const images = await state.db.select().from(propertyImages).where(eq(propertyImages.propertyId, id));
  await state.db.update(properties).set({
    contentReviewStatus: "approved",
    contentReviewHash: propertyContentHash(property, images),
  }).where(eq(properties.id, id));
}

beforeEach(async () => {
  const testDb = await createTestDb("city-listings");
  state.db = testDb.db;
  cleanup = testDb.cleanup;
  vi.clearAllMocks();
  await state.db.insert(owners).values({ id: "owner", name: "Private owner" });
  await state.db.insert(properties).values({
    id: "gavle", ownerId: "owner", address: "Private address 1", city: "Gävle",
    slug: "boende-gavle", publicName: "Boende i Gävle", postalCode: "802 86",
    bedrooms: 5, beds: 8, rentIn: 12345, rentOut: 23456,
    published: true, status: "available",
  });
});

afterEach(() => cleanup());

describe("city listing images", () => {
  it("uses the selected main image even when another image sorts first", async () => {
    await state.db.insert(propertyImages).values([
      { id: "first", propertyId: "gavle", key: "gavle/first.jpg", sortOrder: 0 },
      { id: "main", propertyId: "gavle", key: "gavle/main.jpg", sortOrder: 9, isPrimary: true },
    ]);
    await approve("gavle");

    expect(await getCityListings("Gavle")).toEqual([{
      slug: "boende-gavle", name: "Boende i Gävle", postalCode: "802 86",
      bedrooms: 5, beds: 8, imageUrl: "https://images.example.test/gavle/main.jpg",
    }]);

    // Changing the main image is reflected on the next visit without a new review.
    await state.db.update(propertyImages).set({ isPrimary: false }).where(eq(propertyImages.id, "main"));
    await state.db.update(propertyImages).set({ isPrimary: true }).where(eq(propertyImages.id, "first"));
    expect((await getCityListings("Gävle"))[0].imageUrl).toBe("https://images.example.test/gavle/first.jpg");
  });

  it("falls back to gallery order and keeps listings with no image usable", async () => {
    await state.db.insert(propertyImages).values([
      { id: "later", propertyId: "gavle", key: "gavle/later.jpg", sortOrder: 1, createdAt: "2026-10-02" },
      { id: "earlier", propertyId: "gavle", key: "gavle/earlier.jpg", sortOrder: 1, createdAt: "2026-10-01" },
      { id: "last", propertyId: "gavle", key: "gavle/last.jpg", sortOrder: 2, createdAt: "2026-09-01" },
    ]);
    await state.db.insert(properties).values({
      id: "no-image", address: "Private address 2", city: " GÄVLE ",
      slug: "no-image-gavle", publicName: "Boende utan bild", published: true, status: "available",
    });
    await approve("gavle");
    await approve("no-image");

    const listings = await getCityListings("Gävle");
    expect(listings.find((l) => l.slug === "boende-gavle")?.imageUrl).toBe("https://images.example.test/gavle/earlier.jpg");
    expect(listings.find((l) => l.slug === "no-image-gavle")?.imageUrl).toBeNull();
  });

  it("excludes unavailable, unpublished, other-city and unapproved images", async () => {
    await state.db.insert(properties).values([
      { id: "unpublished", address: "Private", city: "Gävle", slug: "unpublished", published: false, status: "available" },
      { id: "rented", address: "Private", city: "Gävle", slug: "rented", published: true, status: "rented" },
      { id: "other-city", address: "Private", city: "Boden", slug: "other-city", published: true, status: "available" },
      { id: "unapproved", address: "Private", city: "Gävle", slug: "unapproved", published: true, status: "available" },
    ]);
    for (const id of ["gavle", "unpublished", "rented", "other-city", "unapproved"]) {
      await state.db.insert(propertyImages).values({ id: `${id}-image`, propertyId: id, key: `${id}/main.jpg`, isPrimary: true });
      if (id !== "unapproved") await approve(id);
    }

    expect((await getCityListings("Gävle")).map((l) => l.slug)).toEqual(["boende-gavle"]);
    expect(vi.mocked(getSignedUrl).mock.calls.map((call) => (call[1] as GetObjectCommand).input.Key)).toEqual(["gavle/main.jpg"]);
    expect(await getCityListings("Stockholm")).toEqual([]);
  });
});
