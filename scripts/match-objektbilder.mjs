#!/usr/bin/env node
/**
 * match-objektbilder.mjs  (TORRKÖRNING — läser bara, laddar inte upp något)
 * Går igenom lokala Drive-mappar (Stad/Adress_Stad/…) och matchar varje
 * objektmapp mot ett CRM-objekt via normaliserad adress. Rapporterar
 * matchade (med bildantal), omatchade mappar, och CRM-objekt utan mapp.
 *
 * Kräver i .env(.local): TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
 */

import { createClient } from "@libsql/client";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const UPLOAD = process.argv.includes("--upload");
const CT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", heic: "image/heic", heif: "image/heif", webp: "image/webp", gif: "image/gif" };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const f of [".env.local", ".env"]) {
  try {
    for (const l of readFileSync(resolve(ROOT, f), "utf-8").split("\n")) {
      const t = l.trim(); if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("="); if (i === -1) continue;
      const k = t.slice(0, i).trim(); if (!process.env[k]) process.env[k] = t.slice(i + 1).trim();
    }
  } catch {}
}

const BASE = process.argv.slice(2).find((a) => !a.startsWith("--")) || "/Users/kajsa/Downloads/Objektsbanken";
const IMG_RE = /\.(jpe?g|png|heic|heif|webp|gif)$/i;
// NFC: macOS-filsystemet ger mappnamn i NFD (ä = a+¨), databasen är NFC — normalisera till samma.
const norm = (s) => (s || "").toString().normalize("NFC").toLowerCase().replace(/[\s.,()\-_/]+/g, "").trim();

function collectImages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) out.push(...collectImages(p));
    else if (IMG_RE.test(name)) out.push(p);
  }
  return out;
}

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function main() {
  console.log(`\n🔍 TORRKÖRNING — matchar lokala mappar mot CRM-objekt (inget laddas upp)\nMapp: ${BASE}\n`);

  const props = (await turso.execute("SELECT id, address, city FROM crm_properties")).rows;
  const byAddr = new Map();
  for (const p of props) {
    const k = norm(p.address); if (!k) continue;
    if (!byAddr.has(k)) byAddr.set(k, []);
    byAddr.get(k).push(p);
  }

  const matched = [];      // { folder, address, city, prop, imageCount }
  const unmatched = [];    // { folder, city, imageCount }
  const matchedPropIds = new Set();

  for (const cityFolder of readdirSync(BASE)) {
    const cityPath = join(BASE, cityFolder);
    let st; try { st = statSync(cityPath); } catch { continue; }
    if (!st.isDirectory()) continue;

    for (const objFolder of readdirSync(cityPath)) {
      const objPath = join(cityPath, objFolder);
      try { if (!statSync(objPath).isDirectory()) continue; } catch { continue; }

      // Mappnamn är "Adress_Stad" eller "Adress, Stad" — kapa sista separatorn.
      const sepIdx = Math.max(objFolder.lastIndexOf("_"), objFolder.lastIndexOf(","));
      const addrPart = sepIdx > 0 ? objFolder.slice(0, sepIdx) : objFolder;
      const locality = sepIdx > 0 ? objFolder.slice(sepIdx + 1) : "";
      const cand = byAddr.get(norm(addrPart)) || [];
      let prop = null;
      if (cand.length === 1) prop = cand[0];
      else if (cand.length > 1) prop = cand.find((c) => norm(c.city) === norm(cityFolder) || norm(c.city) === norm(locality)) || null;

      const images = collectImages(objPath);
      if (prop) { matched.push({ folder: objFolder, prop, images }); matchedPropIds.add(prop.id); }
      else unmatched.push({ folder: objFolder, city: cityFolder, imageCount: images.length });
    }
  }

  const totalImages = matched.reduce((a, m) => a + m.images.length, 0);
  const propsNoFolder = props.filter((p) => !matchedPropIds.has(p.id));

  console.log(`MATCHADE objektmappar: ${matched.length}  ·  bilder att ladda upp: ${totalImages}`);
  console.log(`OMATCHADE mappar (ingen CRM-träff — troligen Granska/Skräp el. namnmiss): ${unmatched.length}`);
  console.log(`CRM-objekt UTAN mapp (får inga bilder): ${propsNoFolder.length} av ${props.length}\n`);

  console.log(`  Exempel matchade:`);
  for (const m of matched.slice(0, 10)) {
    console.log(`   ✓ ${m.folder}  →  ${m.prop.address}, ${m.prop.city}  (${m.images.length} bilder)`);
  }
  if (unmatched.length) {
    console.log(`\n  Omatchade (ex):`);
    for (const u of unmatched.slice(0, 15)) console.log(`   ✗ ${u.city}/${u.folder}  (${u.imageCount} bilder)`);
  }

  if (!UPLOAD) {
    console.log(`\n🔍 Torrkörning klar — inget laddades upp. Kör med --upload för att ladda upp till R2.\n`);
    process.exit(0);
  }

  // --- Uppladdning till R2 + länkning ---
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
  const BUCKET = process.env.R2_BUCKET;
  const haveImages = new Set(
    (await turso.execute("SELECT DISTINCT property_id FROM crm_property_images")).rows.map((r) => r.property_id)
  );

  console.log(`\n✍️  Laddar upp till R2…`);
  let uploaded = 0, skippedProps = 0;
  for (const m of matched) {
    if (haveImages.has(m.prop.id)) { skippedProps++; continue; }
    let order = 0;
    for (const file of m.images) {
      const ext = (file.split(".").pop() || "bin").toLowerCase();
      const key = `properties/${m.prop.id}/${nanoid()}.${ext}`;
      await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: readFileSync(file), ContentType: CT[ext] || "application/octet-stream" }));
      await turso.execute({
        sql: `INSERT INTO crm_property_images (id, property_id, key, file_name, sort_order, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        args: [nanoid(), m.prop.id, key, basename(file), order++],
      });
      uploaded++;
      if (uploaded % 50 === 0) console.log(`   …${uploaded} bilder`);
    }
  }
  console.log(`\n✅ Klart! ${uploaded} bilder uppladdade till R2 + länkade till objekt. (${skippedProps} objekt hade redan bilder → hoppades över.)\n`);
  process.exit(0);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
