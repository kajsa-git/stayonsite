// Klientside-komprimering före bilduppladdning. Vercels serverless-funktioner
// har en hård gräns på ~4,5 MB per request — moderna mobilfoton spränger den
// och ger "Uppladdning misslyckades (413)". 2000 px räcker gott för annonser
// och prospekt, så vi skalar ner i webbläsaren innan uppladdning (snabbare på
// mobil dessutom). Misslyckas avkodningen (t.ex. HEIC i vissa webbläsare)
// returneras originalet orört — då gäller serverns vanliga felhantering.
export async function compressImage(
  file: File,
  opts?: { maxDim?: number; quality?: number },
): Promise<File> {
  const maxDim = opts?.maxDim ?? 2000;
  const quality = opts?.quality ?? 0.82;

  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file; // animeringar förstörs av canvas

  try {
    // from-image: EXIF-rotationen bakas in så liggande mobilfoton inte vrids fel.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));

    // Redan liten i både pixlar och bytes → rör inte filen.
    if (scale === 1 && file.size < 1_200_000) {
      bitmap.close();
      return file;
    }

    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file; // vann inget — behåll originalet

    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
