import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2_BUCKET, r2 } from "./r2";

// Publika ytor visar WebP-varianter i stället för originalet, som kan vara en
// flera MB stor JPEG/PNG direkt ur mobilen. Originalet ligger kvar orört för
// CRM:et och prospekt-OG. Dess nyckel ingår i innehållsgranskningens hash, men
// varianterna gör det inte — att skapa dem i efterhand avpublicerar inget.
export const IMAGE_VARIANT_WIDTHS = { thumbKey: 800, displayKey: 1600 } as const;

export type ImageVariantKeys = { thumbKey: string | null; displayKey: string | null };

export function variantKey(originalKey: string, width: number): string {
  return `${originalKey.replace(/\.[a-z0-9]+$/i, "")}.w${width}.webp`;
}

export async function renderImageVariant(bytes: Buffer, width: number): Promise<Buffer> {
  return sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
}

// Best-effort: en misslyckad variant får aldrig stoppa uppladdningen. Läsarna
// faller tillbaka på originalet när nyckeln är null.
export async function createImageVariants(originalKey: string, bytes: Buffer): Promise<ImageVariantKeys> {
  const fields = Object.entries(IMAGE_VARIANT_WIDTHS) as [keyof ImageVariantKeys, number][];
  const entries = await Promise.all(
    fields.map(async ([field, width]) => {
      try {
        const key = variantKey(originalKey, width);
        const body = await renderImageVariant(bytes, width);
        await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: "image/webp" }));
        return [field, key] as const;
      } catch (error) {
        console.error("image-variant:", error instanceof Error ? error.message : "failed");
        return [field, null] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as ImageVariantKeys;
}

// Alla R2-objekt som hör till en bildrad — används vid radering.
export function imageObjectKeys(row: { key: string; thumbKey?: string | null; displayKey?: string | null }): string[] {
  return [row.key, row.thumbKey, row.displayKey].filter((key): key is string => !!key);
}
