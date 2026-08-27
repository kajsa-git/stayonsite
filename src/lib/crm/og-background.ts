import sharp from "sharp";

type Fetcher = (input: string) => Promise<Pick<Response, "ok" | "arrayBuffer">>;

/**
 * Satori cannot render AVIF images in ImageResponse. Convert only that format
 * to a JPEG data URL and keep supported remote formats untouched.
 */
export async function prepareOgBackground(
  signedUrl: string,
  objectKey: string,
  fetcher: Fetcher = fetch,
): Promise<string | null> {
  if (!/\.avif$/i.test(objectKey)) return signedUrl;

  try {
    const response = await fetcher(signedUrl);
    if (!response.ok) return null;

    const source = Buffer.from(await response.arrayBuffer());
    const jpeg = await sharp(source).jpeg({ quality: 85 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    // Render the branded fallback instead of failing the whole OG endpoint.
    return null;
  }
}
