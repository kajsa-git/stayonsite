// Magic-byte-sniffning av bildformat. Vi litar ALDRIG på klientens Content-Type
// (den kan spoofas). Returnerar null för okända format och — medvetet — för SVG
// (SVG kan bära script och är en XSS-vektor om den serveras tillbaka).

export type SniffedImage = { mime: string; ext: string };

export function sniffImageType(bytes: Uint8Array): SniffedImage | null {
  const b = bytes;

  // JPEG: FF D8 FF
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }
  // GIF: "GIF8" (87a/89a)
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
    return { mime: "image/gif", ext: "gif" };
  }
  // WebP: "RIFF"...."WEBP"
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  // AVIF / HEIC: ISO-BMFF-box "ftyp" på offset 4, brand på offset 8
  if (b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", ext: "avif" };
    if (brand.startsWith("hei") || brand === "mif1" || brand === "msf1") return { mime: "image/heic", ext: "heic" };
  }

  return null;
}
