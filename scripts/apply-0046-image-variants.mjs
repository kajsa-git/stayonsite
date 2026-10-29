// Läs-only utan --apply. Med --apply läggs enbart de två nullable variantkolumnerna till.
// Originalnyckeln (key) rörs inte — den ingår i innehållsgranskningens hash.
// node --env-file=.env.local scripts/apply-0046-image-variants.mjs [--apply]
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const TAG = "0046_property_image_variants";
const apply = process.argv.includes("--apply");
try {
  if (apply) {
    // Att registrera 0046 som senaste migration får inte hoppa över 0045.
    const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='crm_billing_plans'");
    if (!tables.rows.length) throw new Error("Migration 0045 måste köras först: crm_billing_plans saknas");
  }
  const columns = await db.execute("PRAGMA table_info(crm_property_images)");
  for (const column of ["thumb_key", "display_key"]) {
    if (columns.rows.some((row) => row.name === column)) {
      console.log(`crm_property_images.${column}: finns redan`);
    } else if (apply) {
      await db.execute(`ALTER TABLE crm_property_images ADD COLUMN ${column} text`);
      console.log(`crm_property_images.${column}: tillagd`);
    } else {
      console.log(`crm_property_images.${column}: behöver läggas till`);
    }
  }
  if (apply) {
    const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
    const entry = journal.entries.find((item) => item.tag === TAG);
    if (!entry) throw new Error(`Migration ${TAG} saknas i Drizzle-journalen`);
    const sql = await readFile(new URL(`../drizzle/${TAG}.sql`, import.meta.url), "utf8");
    await db.execute("CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)");
    await db.execute({
      sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
      args: [createHash("sha256").update(sql).digest("hex"), entry.when, entry.when],
    });
    console.log("Migration 0046 registrerad i Drizzle-journalen");
  }
} finally {
  db.close();
}
