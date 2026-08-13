// Riktad bilduppladdning för 3 publicerade objekt utan bilder (mappnamnen matchar
// inte CRM-adresserna, därför missade match-objektbilder.mjs dem):
//   Masurgatan 84 (Gävle), Vikingavägen 75 (Gävle, CRM-stavning "Vinkingavägen"),
//   Fisknätsgatan 3 (Saltsjöbaden/Stockholm).
// Hoppar över objekt som redan har bilder. Kör: node scripts/upload-images-3-objekt.mjs
import { createClient } from "@libsql/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { nanoid } from "nanoid";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const BUCKET = process.env.R2_BUCKET;
const CT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", heic: "image/heic", heif: "image/heif", webp: "image/webp", gif: "image/gif" };
const IMG_RE = /\.(jpe?g|png|heic|heif|webp|gif)$/i;

const MAP = [
  { propertyId: "BU91WhLn5ldrZziyoNQP-", label: "Masurgatan 84, Gävle", dir: "/Users/kajsa/Downloads/Objektsbanken/Gävle/Masurgatan84_Gävle" },
  { propertyId: "6AnRf-5F_QWEZzz5-TDiK", label: "Vikingavägen 75, Gävle", dir: "/Users/kajsa/Downloads/Objektsbanken/Gävle/Vikingavägen75_Gävle" },
  { propertyId: "5BfA_eQN_l_jSn3tLzPzg", label: "Fisknätsgatan 3, Stockholm", dir: "/Users/kajsa/Downloads/Objektsbanken/Stockholm/Fisknätsgatan_Stockholm" },
];

function collectImages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) out.push(...collectImages(p));
    else if (IMG_RE.test(name)) out.push(p);
  }
  return out.sort((a, b) => a.localeCompare(b, "sv", { numeric: true }));
}

for (const m of MAP) {
  const has = await turso.execute({ sql: "SELECT COUNT(*) AS n FROM crm_property_images WHERE property_id = ?", args: [m.propertyId] });
  if (has.rows[0].n > 0) { console.log(`SKIP ${m.label} — har redan ${has.rows[0].n} bilder`); continue; }
  const images = collectImages(m.dir);
  if (!images.length) { console.log(`SKIP ${m.label} — inga bilder i ${m.dir}`); continue; }
  let order = 0;
  for (const file of images) {
    const ext = (file.split(".").pop() || "bin").toLowerCase();
    const key = `properties/${m.propertyId}/${nanoid()}.${ext}`;
    await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: readFileSync(file), ContentType: CT[ext] || "application/octet-stream" }));
    await turso.execute({
      sql: `INSERT INTO crm_property_images (id, property_id, key, file_name, sort_order, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [nanoid(), m.propertyId, key, basename(file), order++],
    });
  }
  console.log(`OK ${m.label} — ${order} bilder uppladdade`);
}
process.exit(0);
