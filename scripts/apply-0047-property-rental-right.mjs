// Read-only without --apply. Adds one nullable property-specific field.
// node --env-file=.env.local scripts/apply-0047-property-rental-right.mjs [--apply]
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const TAG = "0047_property_rental_right";
const apply = process.argv.includes("--apply");
try {
  const columns = await db.execute("PRAGMA table_info(crm_properties)");
  if (!columns.rows.length) throw new Error("crm_properties saknas");
  if (apply) {
    const images = await db.execute("PRAGMA table_info(crm_property_images)");
    if (!["thumb_key", "display_key"].every((name) => images.rows.some((row) => row.name === name))) {
      throw new Error("Migration 0046 måste köras först");
    }
  }
  const existing = columns.rows.find((row) => row.name === "rental_right");
  if (existing) {
    if (String(existing.type).toUpperCase() !== "TEXT") throw new Error("crm_properties.rental_right har oväntad typ");
    console.log("crm_properties.rental_right: finns redan");
  } else if (apply) {
    await db.execute("ALTER TABLE crm_properties ADD COLUMN rental_right text");
    console.log("crm_properties.rental_right: tillagd");
  } else {
    console.log("crm_properties.rental_right: behöver läggas till");
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
    console.log("Migration 0047 registrerad");
  }
} finally {
  db.close();
}
