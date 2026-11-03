// Read-only unless --apply is supplied. Adds nullable fields for landlord-facing requirements.
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const tag = "0048_landlord_match_preferences";
const columns = ["landlord_project_duration", "landlord_bedroom_preference", "landlord_parking_preference", "landlord_other_wishes"];
const apply = process.argv.includes("--apply");
try {
  const current = await client.execute("PRAGMA table_info(crm_requests)");
  if (!current.rows.length) throw new Error("crm_requests saknas");
  const property = await client.execute("PRAGMA table_info(crm_properties)");
  if (!property.rows.some((row) => row.name === "rental_right")) throw new Error("Migration 0047 måste köras först");
  for (const name of columns) {
    const existing = current.rows.find((row) => row.name === name);
    if (existing && String(existing.type).toUpperCase() !== "TEXT") throw new Error(`${name} har oväntad typ`);
    console.log(`${name}: ${existing ? "finns redan" : apply ? "läggs till" : "behöver läggas till"}`);
  }
  if (apply) {
    const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
    const entry = journal.entries.find((item) => item.tag === tag);
    if (!entry) throw new Error(`${tag} saknas i Drizzle-journalen`);
    const sql = await readFile(new URL(`../drizzle/${tag}.sql`, import.meta.url), "utf8");
    const tx = await client.transaction("write");
    try {
      for (const name of columns) {
        if (!current.rows.some((row) => row.name === name)) await tx.execute(`ALTER TABLE crm_requests ADD COLUMN ${name} text`);
      }
      await tx.execute("CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)");
      await tx.execute({
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
        args: [createHash("sha256").update(sql).digest("hex"), entry.when, entry.when],
      });
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }
    console.log("Migration 0048 registrerad");
  }
} finally {
  client.close();
}
