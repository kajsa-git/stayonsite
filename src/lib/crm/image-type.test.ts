import { describe, expect, it } from "vitest";
import { sniffImageType } from "./image-type";

const bytes = (...arr: number[]) => new Uint8Array(arr);

describe("sniffImageType", () => {
  it("känner igen JPEG", () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00))).toEqual({ mime: "image/jpeg", ext: "jpg" });
  });

  it("känner igen PNG", () => {
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00))).toEqual({
      mime: "image/png",
      ext: "png",
    });
  });

  it("känner igen GIF och WebP", () => {
    expect(sniffImageType(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))?.mime).toBe("image/gif");
    const webp = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);
    expect(sniffImageType(webp)?.mime).toBe("image/webp");
  });

  it("känner igen AVIF (ftyp/avif)", () => {
    const avif = bytes(0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66);
    expect(sniffImageType(avif)?.mime).toBe("image/avif");
  });

  it("avvisar SVG och annat icke-bild-innehåll", () => {
    // "<svg" / "<?xml" → ingen bild-magic → null (XSS-skydd)
    expect(sniffImageType(bytes(0x3c, 0x73, 0x76, 0x67, 0x20))).toBeNull();
    expect(sniffImageType(bytes(0x3c, 0x3f, 0x78, 0x6d, 0x6c))).toBeNull();
    // HTML/script-payload med spoofad image/png-content-type
    expect(sniffImageType(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
    expect(sniffImageType(bytes())).toBeNull();
  });
});
