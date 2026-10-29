// Skapar WebP-varianterna (800/1600 px) för befintliga bilder som saknar dem.
// Rör aldrig originalobjektet eller crm_property_images.key — nyckeln ingår i
// innehållsgranskningens hash, så publiceringen påverkas inte. Publicerade objekt först.
// Kräver migration 0046 (scripts/apply-0046-image-variants.mjs --apply).
//
//   tsx --env-file=.env.local scripts/backfill-image-variants.ts            → inventering (dry-run)
//   tsx --env-file=.env.local scripts/backfill-image-variants.ts --commit   → skapa varianter
//   … --commit --limit 20                                                   → bara de 20 första
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../src/lib/crm/db";
import { createImageVariants } from "../src/lib/crm/image-variants";
import { R2_BUCKET, r2 } from "../src/lib/crm/r2";
import { properties, propertyImages } from "../src/lib/crm/schema";

const COMMIT = process.argv.includes("--commit");
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const CONCURRENCY = 4;

const todo = (
  await db
    .select({ id: propertyImages.id, key: propertyImages.key, published: properties.published })
    .from(propertyImages)
    .leftJoin(properties, eq(properties.id, propertyImages.propertyId))
    .where(or(isNull(propertyImages.thumbKey), isNull(propertyImages.displayKey)))
    .orderBy(desc(properties.published))
).slice(0, LIMIT);

console.log(`saknar varianter: ${todo.length} bilder (varav på publicerade objekt: ${todo.filter((r) => r.published).length})`);
if (!COMMIT) {
  console.log("DRY-RUN — kör med --commit för att skapa varianterna.");
  process.exit(0);
}

let done = 0;
const failed: string[] = [];
let originalBytes = 0;
let thumbBytes = 0;
async function worker(queue: typeof todo) {
  for (let row = queue.shift(); row; row = queue.shift()) {
    try {
      const object = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: row.key }));
      const bytes = Buffer.from(await object.Body!.transformToByteArray());
      const variants = await createImageVariants(row.key, bytes);
      if (!variants.thumbKey || !variants.displayKey) throw new Error("variant misslyckades");
      await db.update(propertyImages).set(variants).where(eq(propertyImages.id, row.id));
      originalBytes += bytes.length;
      const thumb = await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: variants.thumbKey }));
      thumbBytes += Number(thumb.ContentLength ?? 0);
    } catch (error) {
      failed.push(`${row.key}: ${error instanceof Error ? error.message : "okänt fel"}`);
    }
    if (++done % 50 === 0) console.log(`  ${done}/${todo.length}`);
  }
}
const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
console.log(`klart: ${done - failed.length}/${todo.length} · original ${mb(originalBytes)} MB → 800 px-varianter ${mb(thumbBytes)} MB`);
if (failed.length) console.log(`misslyckade (${failed.length}) — originalet visas tills vidare:\n  ${failed.join("\n  ")}`);
process.exit(failed.length ? 1 : 0);
