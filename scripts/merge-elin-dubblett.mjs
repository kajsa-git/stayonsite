// Mergar Elin Rubins Notion-dubblett "Valnötsvägen" (FQWC_IKMeATroUSkTZ98V, 5 bilder)
// in i "Valnötsvägen 5" (Lqa4mBpClik5A_xZxWomC, 14 bilder).
//   1. Backup av båda raderna + dubblettens barnrader → scripts/elin-merge-backup.json
//   2. Bilder: exakta dubbletter (samma R2-ETag/MD5) slängs, övriga flyttas till
//      properties/<nytt id>/ i R2 (server-side copy) och läggs sist i sorteringen
//   3. Not + matchning flyttas (matchning slängs om samma förfrågan redan finns på målet)
//   4. Dubblettens rad + sökindex-raden raderas (FK är AV — allt explicit, jfr cascade-delete.ts)
// Kör från repo-roten: node scripts/merge-elin-dubblett.mjs
import { createClient } from "@libsql/client";
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, writeFileSync } from "node:fs";
import { nanoid } from "nanoid";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const OLD = "FQWC_IKMeATroUSkTZ98V"; // Valnötsvägen (Notion-import)
const NEW = "Lqa4mBpClik5A_xZxWomC"; // Valnötsvägen 5 (behålls)

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const BUCKET = process.env.R2_BUCKET;

const q = async (sql, args = []) => (await db.execute({ sql, args })).rows;

// --- 1. Backup ---
const backup = {
  timestamp: new Date().toISOString(),
  oldRow: (await q("SELECT * FROM crm_properties WHERE id=?", [OLD]))[0],
  newRow: (await q("SELECT * FROM crm_properties WHERE id=?", [NEW]))[0],
  images: await q("SELECT * FROM crm_property_images WHERE property_id=?", [OLD]),
  notes: await q("SELECT * FROM crm_property_notes WHERE property_id=?", [OLD]),
  matches: await q("SELECT * FROM crm_matches WHERE property_id=?", [OLD]),
};
if (!backup.oldRow || !backup.newRow) { console.error("FEL: hittar inte båda raderna — avbryter."); process.exit(1); }
writeFileSync("scripts/elin-merge-backup.json", JSON.stringify(backup, null, 2));
console.log(`Backup skriven: ${backup.images.length} bilder, ${backup.notes.length} noter, ${backup.matches.length} matchningar`);

// --- 2. Bilder: ETag-dedup + flytt ---
async function etagsByKey(propertyId) {
  const map = new Map();
  let token;
  do {
    const page = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `properties/${propertyId}/`, ContinuationToken: token }));
    for (const o of page.Contents ?? []) {
      const etag = (o.ETag ?? "").replace(/"/g, "");
      if (etag && !etag.includes("-")) map.set(o.Key, etag);
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return map;
}
const oldEtags = await etagsByKey(OLD);
const newHashes = new Set((await etagsByKey(NEW)).values());
const maxSort = (await q("SELECT COALESCE(MAX(sort_order),-1) m FROM crm_property_images WHERE property_id=?", [NEW]))[0].m;

let moved = 0, dropped = 0, order = maxSort + 1;
const oldR2KeysToDelete = [];
for (const img of backup.images) {
  const etag = oldEtags.get(img.key);
  if (etag && newHashes.has(etag)) {
    await db.execute({ sql: "DELETE FROM crm_property_images WHERE id=?", args: [img.id] });
    oldR2KeysToDelete.push(img.key);
    dropped++;
    continue;
  }
  const ext = (img.key.split(".").pop() || "bin").toLowerCase();
  const newKey = `properties/${NEW}/${nanoid()}.${ext}`;
  await r2.send(new CopyObjectCommand({ Bucket: BUCKET, CopySource: `${BUCKET}/${encodeURIComponent(img.key)}`, Key: newKey }));
  await db.execute({ sql: "UPDATE crm_property_images SET property_id=?, key=?, sort_order=? WHERE id=?", args: [NEW, newKey, order++, img.id] });
  oldR2KeysToDelete.push(img.key);
  if (etag) newHashes.add(etag); // dubbletter inom gamla serien fångas också
  moved++;
}
console.log(`Bilder: ${moved} flyttade, ${dropped} exakta dubbletter slängda`);

// --- 3. Not + matchning ---
await db.execute({ sql: "UPDATE crm_property_notes SET property_id=? WHERE property_id=?", args: [NEW, OLD] });
for (const m of backup.matches) {
  const dup = await q("SELECT id FROM crm_matches WHERE property_id=? AND request_id=?", [NEW, m.request_id]);
  if (dup.length) { await db.execute({ sql: "DELETE FROM crm_matches WHERE id=?", args: [m.id] }); console.log(`Matchning ${m.id} slängd (förfrågan redan matchad mot målet)`); }
  else { await db.execute({ sql: "UPDATE crm_matches SET property_id=? WHERE id=?", args: [NEW, m.id] }); console.log(`Matchning ${m.id} flyttad`); }
}

// --- 4. Radera dubbletten + sökindex ---
await db.execute({ sql: "UPDATE crm_requests SET won_property_id=NULL WHERE won_property_id=?", args: [OLD] });
await db.execute({ sql: "DELETE FROM crm_properties WHERE id=?", args: [OLD] });
await db.execute({ sql: "DELETE FROM crm_search_index WHERE id=?", args: [`property:${OLD}`] });
console.log("Dubblettraden + sökindex-raden raderade");

// --- 5. R2-städning av gamla nycklar (sist — om något ovan fallerar finns filerna kvar) ---
for (const key of oldR2KeysToDelete) await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
console.log(`R2: ${oldR2KeysToDelete.length} gamla objekt städade`);

// --- Verifiering ---
const imgs = (await q("SELECT COUNT(*) n FROM crm_property_images WHERE property_id=?", [NEW]))[0].n;
const gone = (await q("SELECT COUNT(*) n FROM crm_properties WHERE id=?", [OLD]))[0].n;
console.log(`KLART: målet har ${imgs} bilder; dubbletten finns kvar: ${gone === 0 ? "nej" : "JA — FEL!"}`);
process.exit(0);
