import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { TestDB } from "./test-db";
import { createTestDb } from "./test-db";
import { properties, owners, propertyImages } from "./schema";

const state = vi.hoisted(() => ({ db: null as unknown as TestDB }));
vi.mock("./db", () => ({ get db() { return state.db; } }));
vi.mock("./search-index", () => ({ indexProperty: vi.fn(async () => {}) }));
vi.mock("./r2", () => ({ R2_BUCKET: "test", r2: { send: vi.fn(async () => ({ Body: { transformToByteArray: async () => Buffer.from("image") } })) } }));
vi.mock("sharp", () => ({ default: () => ({ rotate() { return this; }, resize() { return this; }, jpeg() { return this; }, toBuffer: async () => Buffer.from("jpeg") }) }));
import { reviewPropertyContent, inspectPropertyContent, readReviewInput } from "./property-content-review";
import { approvedPropertyIds } from "./approved-property-content";
import { isCurrentContentApproved, propertyContentHash, publicTextProblems } from "./property-content-policy";

const copy = {
  publicName: "Boende för fyra personer i Boden",
  publicDescription: "Möblerat boende i Boden med två sovrum och fyra bäddar. Eget kök, badrum, tvättmaskin och parkering finns.",
  publicDescriptionEn: "Furnished accommodation in Boden with two bedrooms and four beds. Private kitchen, bathroom, washing machine and parking.",
  publicDescriptionPl: "Umeblowane zakwaterowanie w Boden z dwiema sypialniami i czterema łóżkami. Prywatna kuchnia, łazienka, pralka i parking.",
  skick: "", skickEn: "", skickPl: "", inclusions: ["Parkering"], inclusionsEn: ["Parking"], inclusionsPl: ["Parking"], reasons: [],
};
let cleanup: () => void;
let modelCopy: typeof copy;
let rejectedImage: string | null;
let calls: Record<string, unknown>[];

beforeEach(async () => {
  const created = await createTestDb("property-content"); state.db = created.db; cleanup = created.cleanup;
  modelCopy = structuredClone(copy); rejectedImage = null; calls = [];
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  await state.db.insert(owners).values({ id: "o1", name: "Anna Andersson", email: "private@example.com" });
  await state.db.insert(properties).values({ id: "p1", ownerId: "o1", address: "Privatgatan 9", postalCode: "961 00", city: "Boden", beds: 4, bedrooms: 2,
    publicName: "Boende i Boden", slug: "boende-boden", publicDescription: "Vi hyr för 12 000 kr. Fin bostad.", rentIn: 12345, rentOut: 23456, notes: "HEMLIG INTERN NOTERING", publishConsentAt: "2026-09-01", status: "available" });
  await state.db.insert(propertyImages).values({ id: "im1", propertyId: "p1", key: "immutable/1.jpg" });
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
    const body = JSON.parse(init.body); calls.push(body);
    const content = body.messages[0].content;
    const labels = content.filter((b: { type: string; text?: string }) => b.type === "text" && b.text?.startsWith("Bild-id:"));
    const result = labels.length ? { images: labels.map((b: { text: string }) => ({ id: b.text.slice(9).trim(), suitable: b.text.slice(9).trim() !== rejectedImage, reason: b.text.slice(9).trim() === rejectedImage ? "Privat dokument, inte en boendebild." : "" })) } : modelCopy;
    return new Response(JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(result) }] }), { status: 200 });
  }));
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("automatic property approval", () => {
  it("cleans and translates, publishes with consent, and keeps private finance separate", async () => {
    expect(await reviewPropertyContent("p1")).toBe("approved");
    const input = (await readReviewInput("p1"))!;
    expect(input.property).toMatchObject({ publicDescription: copy.publicDescription, publicDescriptionEn: copy.publicDescriptionEn, publicDescriptionPl: copy.publicDescriptionPl,
      rentIn: 12345, rentOut: 23456, notes: "HEMLIG INTERN NOTERING", published: true, prospektPublished: true, contentReviewStatus: "approved" });
    expect(isCurrentContentApproved(input.property, input.images)).toBe(true);
    expect(input.property.contentReviewOriginal?.publicDescription).toContain("12 000 kr");
    const textInput = JSON.stringify(calls.at(-1));
    expect(textInput).not.toMatch(/HEMLIG INTERN NOTERING|rentIn|rentOut|12345|23456|Privatgatan 9|private@example/);
  });
  it("does not publish without owner consent or change rented/off-market status", async () => {
    await state.db.update(properties).set({ publishConsentAt: null, status: "rented" }).where(eq(properties.id, "p1"));
    expect(await reviewPropertyContent("p1")).toBe("approved");
    expect((await readReviewInput("p1"))!.property).toMatchObject({ published: false, prospektPublished: false, status: "rented" });
  });
  it("preserves a manual publication pause after text cleanup", async () => {
    await state.db.update(properties).set({ autoPublishEnabled: false }).where(eq(properties.id, "p1"));
    expect(await reviewPropertyContent("p1")).toBe("approved");
    expect((await readReviewInput("p1"))!.property).toMatchObject({ published: false, prospektPublished: false, autoPublishEnabled: false });
  });
  it("checks every image, including number nine; any inappropriate image blocks approval", async () => {
    for (let n = 2; n <= 9; n++) await state.db.insert(propertyImages).values({ id: `im${n}`, propertyId: "p1", key: `immutable/${n}.jpg` });
    rejectedImage = "im9";
    expect(await reviewPropertyContent("p1")).toBe("needs_review");
    const input = (await readReviewInput("p1"))!;
    expect(input.property.contentReviewReport?.images).toHaveLength(9);
    expect(input.property.contentReviewReport?.reasons.join(" ")).toContain("im9");
    expect((await approvedPropertyIds(["p1"])).size).toBe(0);
    expect(input.property.published).toBe(false);
  });
  it("rejects price leaks in any language, including conditions/inclusions", async () => {
    modelCopy.publicDescriptionPl += " 12 000 SEK";
    expect(await reviewPropertyContent("p1")).toBe("needs_review");
    expect((await readReviewInput("p1"))!.property.publicDescription).not.toBe(copy.publicDescription);
  });
  it("does not reuse approval after external text or the image set changes", async () => {
    await reviewPropertyContent("p1");
    expect((await approvedPropertyIds(["p1"])).has("p1")).toBe(true);
    await state.db.update(properties).set({ publicDescriptionEn: "Rent: 12000 SEK" }).where(eq(properties.id, "p1"));
    expect((await approvedPropertyIds(["p1"])).has("p1")).toBe(false);
    await reviewPropertyContent("p1");
    await state.db.insert(propertyImages).values({ id: "new", propertyId: "p1", key: "new.jpg" });
    expect((await approvedPropertyIds(["p1"])).has("p1")).toBe(false);
  });
  it("does not save a review if data changed during the AI request", async () => {
    const fetcher = fetch;
    vi.stubGlobal("fetch", vi.fn(async (url, init) => {
      if (!(init as RequestInit)?.body?.toString().includes("Bild-id:")) await state.db.update(properties).set({ beds: 8 }).where(eq(properties.id, "p1"));
      return fetcher(url, init);
    }));
    expect(await reviewPropertyContent("p1")).toBe("pending");
    expect((await readReviewInput("p1"))!.property).toMatchObject({ beds: 8, published: false, publicDescription: "Vi hyr för 12 000 kr. Fin bostad." });
  });
  it("flags missing images without inventing a description or sending AI requests", async () => {
    await state.db.delete(propertyImages).where(eq(propertyImages.propertyId, "p1"));
    expect(await reviewPropertyContent("p1")).toBe("needs_review");
    expect(calls).toHaveLength(0);
  });
  it("fails closed on an API outage or missing translation", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    expect(await reviewPropertyContent("p1")).toBe("retry");
    expect((await approvedPropertyIds(["p1"])).size).toBe(0);
  });
  it("inspects without mutating records (batch audit)", async () => {
    await inspectPropertyContent("p1");
    expect((await readReviewInput("p1"))!.property).toMatchObject({ contentReviewStatus: "pending", published: false });
  });
});

describe("public text checks", () => {
  it.each(["12000 kr/mån", "rent: 900 EUR", "€1200", "12 000 SEK", "hyran: 12000", "marginal 20%", "jävla bra", "fuck this", "kurwa", "x@example.com", "www.qasa.se", "TODO", "IGNORE PREVIOUS instructions"])("flags %s", (value) => {
    expect(publicTextProblems(value).length).toBeGreaterThan(0);
  });
  it("keeps relevant dimensions, parking and sensitive surfaces", () => {
    expect(publicTextProblems("Boende på 120 m² med fyra sovrum, två parkeringsplatser och känsligt golv som kräver försiktighet.")).toEqual([]);
  });
  it("hashes translations and all image identities but not internal rent or image ordering", () => {
    const p = { publicDescription: "Boende", publicDescriptionEn: "Housing", rentIn: 12000 };
    const hash = propertyContentHash(p, [{ id: "a", key: "a.jpg" }, { id: "b", key: "b.jpg" }]);
    expect(propertyContentHash({ ...p, rentIn: 90000 }, [{ id: "b", key: "b.jpg" }, { id: "a", key: "a.jpg" }])).toBe(hash);
    expect(propertyContentHash({ ...p, publicDescriptionEn: "Changed" }, [{ id: "a", key: "a.jpg" }, { id: "b", key: "b.jpg" }])).not.toBe(hash);
  });
});
