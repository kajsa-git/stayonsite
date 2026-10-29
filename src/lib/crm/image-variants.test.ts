import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sent = vi.hoisted(() => [] as { Key: string; ContentType: string; Body: Buffer }[]);
vi.mock("./r2", () => ({
  R2_BUCKET: "test-images",
  r2: { send: vi.fn(async (command: { input: { Key: string; ContentType: string; Body: Buffer } }) => { sent.push(command.input); }) },
}));
import { r2 } from "./r2";
import { createImageVariants, imageObjectKeys, variantKey } from "./image-variants";

const photo = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#ff6300" } }).jpeg().toBuffer();

beforeEach(() => {
  sent.length = 0;
  vi.mocked(r2.send).mockClear();
});

describe("image variants", () => {
  it("derives WebP keys next to the original", () => {
    expect(variantKey("properties/p1/abc.jpeg", 800)).toBe("properties/p1/abc.w800.webp");
    expect(variantKey("properties/p1/abc.webp", 1600)).toBe("properties/p1/abc.w1600.webp");
  });

  it("uploads 800 and 1600 px WebP variants of a large photo", async () => {
    const keys = await createImageVariants("properties/p1/abc.jpg", await photo(4000, 3000));

    expect(keys).toEqual({ thumbKey: "properties/p1/abc.w800.webp", displayKey: "properties/p1/abc.w1600.webp" });
    const widths = await Promise.all(sent.map(async (put) => {
      const meta = await sharp(put.Body).metadata();
      return [put.Key, put.ContentType, meta.format, meta.width];
    }));
    expect(widths.sort()).toEqual([
      ["properties/p1/abc.w1600.webp", "image/webp", "webp", 1600],
      ["properties/p1/abc.w800.webp", "image/webp", "webp", 800],
    ]);
  });

  it("never upscales a small original", async () => {
    await createImageVariants("properties/p1/small.png", await photo(500, 400));
    for (const put of sent) expect((await sharp(put.Body).metadata()).width).toBe(500);
  });

  it("returns null keys instead of failing the upload when a variant cannot be made", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await createImageVariants("properties/p1/broken.jpg", Buffer.from("not an image"))).toEqual({ thumbKey: null, displayKey: null });
    expect(r2.send).not.toHaveBeenCalled();
  });

  it("lists every R2 object belonging to an image row for deletion", () => {
    expect(imageObjectKeys({ key: "a.jpg", thumbKey: "a.w800.webp", displayKey: "a.w1600.webp" })).toEqual(["a.jpg", "a.w800.webp", "a.w1600.webp"]);
    expect(imageObjectKeys({ key: "a.jpg", thumbKey: null, displayKey: null })).toEqual(["a.jpg"]);
  });
});
