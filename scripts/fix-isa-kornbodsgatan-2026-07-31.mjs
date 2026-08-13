// Engångsfix 2026-07-31: Isas objekt (foretagsboende-vasteras-4-sovrum-3) visade
// FEL HUS bilder. Objektsbanken hade två hus på Kornbodsgatan i Västerås i mappar
// som skiljde på en bokstav ("Konbodsgatan" [sic] = Isas, "Kornbodsgatan" = Merals,
// som aldrig svarade) — majimporten slog ihop dem: specar från Isas docx men
// Merals 14 foton. Isa flaggade via SMS 07-08 ("fel hus").
//
// Gör: backup → raderar Merals 14 bilder (DB + R2) → laddar upp Isas 7 rätta.
// Samma slug/URL — länken hon fått blir korrekt. Merals foton finns kvar i
// Objektsbanken-mappen på disk (Kajsas beslut: hennes objekt skapas inte).
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@libsql/client";
import { customAlphabet } from "nanoid";
import fs from "node:fs";
import path from "node:path";

const nanoid = customAlphabet("useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict", 21);

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const PROPERTY_ID = "CDGQcQRTC0_98PGbp6JSR";
const SRC_DIR = "/Users/kajsa/Downloads/Objektsbanken/Västerås/Konbodsgatan_Västerås/konbodsgatan bilder";

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const BUCKET = process.env.R2_BUCKET;

// 1) Backup av nuvarande läge
const prop = await db.execute({ sql: "SELECT * FROM crm_properties WHERE id = ?", args: [PROPERTY_ID] });
const oldImages = await db.execute({ sql: "SELECT * FROM crm_property_images WHERE property_id = ? ORDER BY sort_order", args: [PROPERTY_ID] });
fs.writeFileSync(
  "scripts/isa-kornbodsgatan-fix-backup.json",
  JSON.stringify({ when: new Date().toISOString(), property: prop.rows[0], images: oldImages.rows }, null, 2)
);
console.log(`Backup: ${oldImages.rows.length} gamla bildrader sparade.`);

// 2) Radera Merals bilder — DB-rad + R2-objekt
for (const img of oldImages.rows) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: img.key })).catch((e) => console.warn(`  R2-radering misslyckades för ${img.key}: ${e.message} (fortsätter)`));
  await db.execute({ sql: "DELETE FROM crm_property_images WHERE id = ?", args: [img.id] });
  console.log(`  bort: ${img.file_name}`);
}

// 3) Ladda upp Isas 7 bilder — första blir huvudbild
const files = fs.readdirSync(SRC_DIR).filter((f) => /\.jpe?g$/i.test(f)).sort((a, b) => a.localeCompare(b, "sv", { numeric: true }));
let order = 0;
for (const file of files) {
  const bytes = fs.readFileSync(path.join(SRC_DIR, file));
  const key = `properties/${PROPERTY_ID}/${nanoid()}.jpg`;
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: bytes, ContentType: "image/jpeg" }));
  await db.execute({
    sql: "INSERT INTO crm_property_images (id, property_id, key, file_name, sort_order, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
    args: [nanoid(), PROPERTY_ID, key, file, order, order === 0 ? 1 : 0],
  });
  console.log(`  upp: ${file} (sort ${order})`);
  order++;
}

const check = await db.execute({ sql: "SELECT COUNT(*) AS n FROM crm_property_images WHERE property_id = ?", args: [PROPERTY_ID] });
console.log(`Klart: objektet har nu ${check.rows[0].n} bilder (förväntat ${files.length}).`);
process.exit(0);
