// Backfill: sätt en ren, unik slug på objekt som saknar en (så befintliga objekt får snygga URL:er).
// publicName lämnas orört (manuell override) — visningsnamnet beräknas annars deterministiskt.
// Kör EFTER apply-0021. Från repo-roten (läser ./.env.local):  node scripts/backfill-slugs.mjs
import { createClient } from "@libsql/client";
import fs from "node:fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Speglar src/lib/crm/slug.ts (inlinat — .mjs kan inte importera TS-modulen).
const slugify = (input) =>
  input
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildPublicName = ({ city, bedrooms, beds }) => {
  const c = (city ?? "").trim();
  const base = c ? `Företagsboende ${c}` : "Företagsboende i Sverige";
  if (bedrooms != null && bedrooms > 0) return `${base} · ${bedrooms} sovrum`;
  if (beds != null && beds > 0) return `${base} · ${beds} bäddar`;
  return base;
};

const { rows } = await client.execute("SELECT id, public_name, slug, city, bedrooms, beds FROM crm_properties");
const taken = new Set(rows.map((r) => r.slug).filter(Boolean));

let updated = 0;
for (const r of rows) {
  if (r.slug) continue; // har redan slug
  if (!r.city) continue; // ingen ort → hoppa (listan faller tillbaka till id tills ort fylls i)
  const name =
    (r.public_name && String(r.public_name).trim()) ||
    buildPublicName({ city: r.city, bedrooms: r.bedrooms, beds: r.beds });
  const root = slugify(name) || "boende";
  let slug = root;
  let n = 1;
  while (taken.has(slug)) {
    n += 1;
    slug = `${root}-${n}`;
  }
  taken.add(slug);
  await client.execute({
    sql: "UPDATE crm_properties SET slug = ?, updated_at = ? WHERE id = ?",
    args: [slug, new Date().toISOString(), r.id],
  });
  console.log(`slug: ${r.id} → ${slug}`);
  updated += 1;
}
console.log(`backfill-slugs: done (${updated} uppdaterade)`);
process.exit(0);
