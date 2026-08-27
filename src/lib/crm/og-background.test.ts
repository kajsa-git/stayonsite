import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { prepareOgBackground } from "./og-background";

describe("prepareOgBackground", () => {
  it("keeps image formats supported by Satori as remote URLs", async () => {
    const fetcher = vi.fn();

    await expect(prepareOgBackground("https://example.com/image.jpg", "image.jpg", fetcher)).resolves.toBe(
      "https://example.com/image.jpg",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("converts AVIF images to a JPEG data URL", async () => {
    const avif = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#ff6300" },
    })
      .avif()
      .toBuffer();
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => avif.buffer.slice(avif.byteOffset, avif.byteOffset + avif.byteLength),
    });

    const result = await prepareOgBackground("https://example.com/image.avif", "property/image.avif", fetcher);

    expect(result).toMatch(/^data:image\/jpeg;base64,/);
  });

  it("falls back safely if the AVIF source cannot be fetched", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      arrayBuffer: async () => new ArrayBuffer(0),
    });

    await expect(prepareOgBackground("https://example.com/image.avif", "image.avif", fetcher)).resolves.toBeNull();
  });
});
