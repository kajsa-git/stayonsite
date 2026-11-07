import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, type TestDB } from "./test-db";
import { owners, properties, propertyImages } from "./schema";
import { propertyContentHash } from "./property-content-policy";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
import { getCityListings } from "./city-listings";
import { resolvePublicPropertyImageKey } from "./public-images";
import { HUS_TEST_MARKER } from "./test-property";

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

describe("city listings", () => {
  it("links the main image through a stable public address", async () => {
    await state.db.insert(propertyImages).values([
      { id: "first", propertyId: "gavle", key: "gavle/first.jpg", sortOrder: 0 },
      { id: "main", propertyId: "gavle", key: "gavle/main.jpg", sortOrder: 9, isPrimary: true },
    ]);
    await approve("gavle");

    expect(await getCityListings("Gavle")).toEqual([{
      slug: "boende-gavle", name: "Boende i Gävle", city: "Gävle", postalCode: "802 86",
      bedrooms: 5, beds: 8, imageUrl: "/boenden/boende-gavle/bilder/1?w=800",
    }]);
  });

  it("keeps listings with no image usable", async () => {
    await state.db.insert(properties).values({
      id: "no-image", address: "Private address 2", city: " GÄVLE ",
      slug: "no-image-gavle", publicName: "Boende utan bild", published: true, status: "available",
    });
    await approve("gavle");
    await approve("no-image");

    const listings = await getCityListings("Gävle");
    expect(listings.find((l) => l.slug === "no-image-gavle")?.imageUrl).toBeNull();
    expect(listings.find((l) => l.slug === "no-image-gavle")?.city).toBe("GÄVLE");
  });

  it("includes homes in the city's listed localities after the city's own homes", async () => {
    await state.db.insert(properties).values([
      { id: "figeholm", address: "Private", city: "Figeholm", slug: "villa-figeholm", publicName: "Villa i Figeholm", published: true, status: "available" },
      { id: "paskallavik", address: "Private", city: "Påskallavik", slug: "hus-paskallavik", publicName: "Hus i Påskallavik", published: true, status: "available" },
      { id: "oskarshamn", address: "Private", city: "Oskarshamn", slug: "lagenhet-oskarshamn", publicName: "Lägenhet i Oskarshamn", published: true, status: "available" },
    ]);
    for (const id of ["figeholm", "paskallavik", "oskarshamn"]) await approve(id);

    const withLocalities = await getCityListings("Oskarshamn", ["Figeholm", "Paskallavik"]);
    expect(withLocalities.map((l) => l.slug)).toEqual(["lagenhet-oskarshamn", "villa-figeholm", "hus-paskallavik"]);
    expect(withLocalities.map((l) => l.city)).toEqual(["Oskarshamn", "Figeholm", "Påskallavik"]);
    expect((await getCityListings("Oskarshamn")).map((l) => l.slug)).toEqual(["lagenhet-oskarshamn"]);
  });

  it("excludes unavailable, unpublished, other-city and unapproved homes", async () => {
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
    expect(await getCityListings("Stockholm")).toEqual([]);
  });

  it("does not advertise test properties on city pages", async () => {
    await state.db.update(properties).set({ notes: HUS_TEST_MARKER }).where(eq(properties.id, "gavle"));
    await approve("gavle");
    expect(await getCityListings("Gävle")).toEqual([]);
  });
});

describe("public property images", () => {
  it("resolves gallery positions with the main image first", async () => {
    await state.db.insert(propertyImages).values([
      { id: "later", propertyId: "gavle", key: "gavle/later.jpg", sortOrder: 1, createdAt: "2026-10-02" },
      { id: "earlier", propertyId: "gavle", key: "gavle/earlier.jpg", sortOrder: 1, createdAt: "2026-10-01" },
      { id: "main", propertyId: "gavle", key: "gavle/main.jpg", sortOrder: 9, isPrimary: true },
    ]);
    await approve("gavle");

    expect(await resolvePublicPropertyImageKey("boende-gavle", 1)).toBe("gavle/main.jpg");
    expect(await resolvePublicPropertyImageKey("boende-gavle", 2)).toBe("gavle/earlier.jpg");
    expect(await resolvePublicPropertyImageKey("boende-gavle", 3)).toBe("gavle/later.jpg");
    expect(await resolvePublicPropertyImageKey("boende-gavle", 4)).toBeNull();
    expect(await resolvePublicPropertyImageKey("boende-gavle", 0)).toBeNull();
  });

  it("serves the WebP variants, and adding them later keeps the property approved", async () => {
    await state.db.insert(propertyImages).values({ id: "main", propertyId: "gavle", key: "gavle/main.jpg", isPrimary: true });
    await approve("gavle");
    expect(await resolvePublicPropertyImageKey("boende-gavle", 1, "thumb")).toBe("gavle/main.jpg");

    await state.db.update(propertyImages).set({ thumbKey: "gavle/main.w800.webp", displayKey: "gavle/main.w1600.webp" }).where(eq(propertyImages.id, "main"));
    expect(await resolvePublicPropertyImageKey("boende-gavle", 1, "thumb")).toBe("gavle/main.w800.webp");
    expect(await resolvePublicPropertyImageKey("boende-gavle", 1)).toBe("gavle/main.w1600.webp");
  });

  it("serves nothing for unpublished, unapproved or unknown properties", async () => {
    await state.db.insert(propertyImages).values({ id: "main", propertyId: "gavle", key: "gavle/main.jpg", isPrimary: true });
    expect(await resolvePublicPropertyImageKey("boende-gavle", 1)).toBeNull();

    await approve("gavle");
    await state.db.update(properties).set({ published: false }).where(eq(properties.id, "gavle"));
    expect(await resolvePublicPropertyImageKey("boende-gavle", 1)).toBeNull();
    expect(await resolvePublicPropertyImageKey("missing", 1)).toBeNull();
  });
});
