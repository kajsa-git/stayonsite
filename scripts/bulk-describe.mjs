// Bulk: AI-beskrivning för publicerade objekt som saknar publicDescription.
// Samma logik och prompt som /api/crm/properties/[id]/describe (inkl. sharp-
// normalisering av bilder och underlagsskalning: 1–2 bilder → återhållsam text).
// Skriver public_description direkt i DB — rör ALDRIG objekt som redan har text.
//   node scripts/bulk-describe.mjs           → visa vilka som skulle beskrivas
//   node scripts/bulk-describe.mjs --commit  → generera och spara
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { createClient } = require("@libsql/client");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");

for (const line of (fs.readFileSync(".env.local", "utf8") + "\n" + fs.readFileSync(".env", "utf8")).split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const COMMIT = process.argv.includes("--commit");
const MODEL = "claude-sonnet-4-6";
const yesNo = (v) => (v ? "ja" : null);

const props = (
  await db.execute(`SELECT * FROM crm_properties WHERE published=1 AND status='available' AND (public_description IS NULL OR public_description='') ORDER BY city`)
).rows;
console.log(`publicerade utan beskrivning: ${props.length}`);
if (!COMMIT) {
  for (const p of props) console.log(`- ${p.address} · ${p.city}`);
  console.log("\nDRY-RUN — kör med --commit för att generera.");
  process.exit(0);
}

let done = 0;
for (const p of props) {
  const facts = [
    p.city && `Ort: ${p.city}`,
    p.postal_code && `Postnummer: ${p.postal_code}`,
    p.square_meters && `Yta: ${p.square_meters} m²`,
    p.bedrooms && `Sovrum: ${p.bedrooms}`,
    p.beds && `Bäddar: ${p.beds}`,
    p.bathrooms && `Badrum: ${p.bathrooms}`,
    yesNo(p.furnished) && "Möblerat",
    yesNo(p.kitchen) && "Eget kök",
    yesNo(p.garage) && "Garage",
    yesNo(p.broadband) && "Bredband ingår",
    yesNo(p.eget_boende) && "Eget boende (ej delat)",
    p.parking_spaces && `Parkering: ${p.parking_spaces} platser`,
    p.washing_machines && `Tvättmaskin: ${p.washing_machines}`,
    p.dryers && `Tumlare: ${p.dryers}`,
    p.skick && `Skick: ${p.skick}`,
    p.move_in_from && `Tillgänglig från: ${p.move_in_from}`,
    p.available_to && `Tillgänglig till: ${p.available_to}`,
  ].filter(Boolean);

  const imgs = (
    await db.execute({ sql: "SELECT key FROM crm_property_images WHERE property_id=? ORDER BY is_primary DESC, sort_order ASC, created_at ASC LIMIT 6", args: [p.id] })
  ).rows;
  const blocks = [];
  for (const im of imgs) {
    try {
      const obj = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: im.key }));
      const raw = Buffer.from(await obj.Body.transformToByteArray());
      const jpeg = await sharp(raw).rotate().resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer();
      blocks.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpeg.toString("base64") } });
    } catch (e) {
      console.error(`  hoppar bild ${im.key}: ${e?.message}`);
    }
  }
  if (facts.length === 0 && blocks.length === 0) {
    console.log(`HOPPAR (varken data eller bilder): ${p.address}`);
    continue;
  }

  const thin = blocks.length <= 2;
  const instructions = `Du skriver en extern bostadsbeskrivning för ett seriöst svenskt corporate housing-bolag (StayOnSite). Beskrivningen visas publikt för företag som söker boende åt personal.

Du har ${blocks.length === 0 ? "inga bilder" : blocks.length === 1 ? "EN bild" : `${blocks.length} bilder`} att utgå från.
${thin ? "OBS — tunt underlag: beskriv ENDAST det som faktiskt syns och det som står i objektdatan. Nämn inga rum, våningar eller egenskaper du inte ser. Skriv hellre 2 korta meningar än att fylla ut." : "Skriv 2–4 meningar utifrån det som faktiskt syns på bilderna och framgår av datan (standard, ljus, möblering, läge-känsla)."}

Saklig och förtroendeingivande B2B-ton på svenska. Förbjudet: hitta inte på fakta, beskriv inte rum som varken syns på bild eller finns i datan, ingen reklamfluff, inga superlativ-staplar, och nämn ALDRIG exakt gatuadress, hyresvärd/ägare eller pris. Svara ENBART med beskrivningstexten, inget annat.

Objektdata:
${facts.length ? facts.map((f) => `- ${f}`).join("\n") : "(ingen strukturerad data angiven)"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, thinking: { type: "disabled" }, messages: [{ role: "user", content: [{ type: "text", text: instructions }, ...blocks] }] }),
  });
  if (!res.ok) {
    console.error(`API-FEL ${res.status} för ${p.address}: ${(await res.text()).slice(0, 150)}`);
    continue;
  }
  const data = await res.json();
  const desc = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("").trim().replace(/^["“”]|["“”]$/g, "");
  if (!desc) {
    console.error(`tom beskrivning: ${p.address}`);
    continue;
  }
  await db.execute({ sql: "UPDATE crm_properties SET public_description=?, updated_at=datetime('now') WHERE id=? AND (public_description IS NULL OR public_description='')", args: [desc, p.id] });
  done++;
  console.log(`${done}/${props.length} ✓ ${p.address} · ${p.city} (${blocks.length} bilder): ${desc.slice(0, 70)}…`);
  await new Promise((r) => setTimeout(r, 800));
}
console.log(`\nKLART: ${done} beskrivningar sparade.`);
process.exit(0);
