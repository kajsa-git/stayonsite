// Konverterar hela bildbiblioteket i R2 till WebP (Kajsas beslut 2026-07-09:
// "vi kör allt online i webp"). Per bild: hämta → sharp (rotera, max 2000 px,
// webp q82) → ladda upp som ny .webp-nyckel → peka om databasraden.
// ORIGINALEN RADERAS INTE — de ligger kvar i R2 som backup tills en separat
// rensning körs. Manifest skrivs till scripts/webp-migration-manifest.json.
//
//   node scripts/convert-images-webp.mjs            → inventering (dry-run)
//   node scripts/convert-images-webp.mjs --commit   → konvertera
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { createClient } = require("@libsql/client");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const BUCKET = process.env.R2_BUCKET;
const COMMIT = process.argv.includes("--commit");
const CONCURRENCY = 5;

const rows = (await db.execute("SELECT id, property_id, key FROM crm_property_images ORDER BY property_id")).rows;
const isWebp = (k) => /\.webp$/i.test(String(k));
const isGif = (k) => /\.gif$/i.test(String(k));
const todo = rows.filter((r) => !isWebp(r.key) && !isGif(r.key));

console.log(`bilder totalt: ${rows.length} · redan webp: ${rows.filter((r) => isWebp(r.key)).length} · gif (hoppas över): ${rows.filter((r) => isGif(r.key)).length} · att konvertera: ${todo.length}`);
if (!COMMIT) {
  const byExt = {};
  for (const r of todo) {
    const ext = (String(r.key).match(/\.([a-z0-9]+)$/i)?.[1] ?? "okänd").toLowerCase();
    byExt[ext] = (byExt[ext] ?? 0) + 1;
  }
  console.log("per format:", JSON.stringify(byExt));
  console.log("\nDRY-RUN — kör med --commit för att konvertera.");
  process.exit(0);
}

const manifest = { startedAt: new Date().toISOString(), converted: [], failed: [] };
let done = 0;
let savedBytes = 0;

async function convertOne(row) {
  const oldKey = String(row.key);
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: oldKey }));
    const raw = Buffer.from(await obj.Body.transformToByteArray());
    const webp = await sharp(raw).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const newKey = oldKey.replace(/\.[a-z0-9]+$/i, "") + ".webp";
    await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: newKey, Body: webp, ContentType: "image/webp" }));
    await db.execute({ sql: "UPDATE crm_property_images SET key = ? WHERE id = ?", args: [newKey, row.id] });
    manifest.converted.push({ id: row.id, oldKey, newKey, oldBytes: raw.length, newBytes: webp.length });
    savedBytes += raw.length - webp.length;
  } catch (e) {
    manifest.failed.push({ id: row.id, oldKey, error: String(e?.message ?? e).slice(0, 200) });
    console.error(`FEL ${oldKey}: ${e?.message ?? e}`);
  }
  done++;
  if (done % 25 === 0) console.log(`${done}/${todo.length}…`);
}

// Enkel pool med CONCURRENCY samtidiga konverteringar.
const queue = [...todo];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await convertOne(queue.shift());
  }),
);

fs.writeFileSync("scripts/webp-migration-manifest.json", JSON.stringify(manifest, null, 2));
const mb = (n) => (n / 1048576).toFixed(1) + " MB";
console.log(`\nKLART: ${manifest.converted.length} konverterade, ${manifest.failed.length} misslyckade.`);
console.log(`Sparat: ${mb(savedBytes)} (originalen ligger kvar i R2 som backup — separat rensning senare).`);
console.log("Manifest: scripts/webp-migration-manifest.json");
process.exit(0);
