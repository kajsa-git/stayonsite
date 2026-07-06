import { createHash } from "node:crypto";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { R2_BUCKET, r2 } from "./r2";

// Innehålls-dedup för objektbilder: samma bild (exakt samma bytes) ska aldrig
// lagras två gånger på samma objekt. R2:s ETag för single-part-uploads (allt vi
// gör) är MD5-hex av innehållet, så befintliga bilders hashar fås via en billig
// LIST — ingen nedladdning behövs.

export function imageContentHash(bytes: Buffer): string {
  return createHash("md5").update(bytes).digest("hex");
}

// Hashar för objektets redan uppladdade bilder. Multipart-ETags ("…-2") är inte
// rena MD5:or och hoppas över — de kan inte jämföras säkert.
export async function existingImageHashes(propertyId: string): Promise<Set<string>> {
  const hashes = new Set<string>();
  let token: string | undefined;
  do {
    const page = await r2.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: `properties/${propertyId}/`,
        ContinuationToken: token,
      }),
    );
    for (const o of page.Contents ?? []) {
      const etag = (o.ETag ?? "").replace(/"/g, "");
      if (etag && !etag.includes("-")) hashes.add(etag);
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return hashes;
}
