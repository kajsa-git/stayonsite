// Dry-run by default; additive migration with a journal entry, safe to repeat.
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const tag = "0049_rental_reviews";
const apply = process.argv.includes("--apply");
try {
  const previous = await client.execute("PRAGMA table_info(crm_requests)");
  if (!previous.rows.some((r) => r.name === "landlord_other_wishes")) throw new Error("Migration 0048 måste köras först");
  const current = await client.execute("PRAGMA table_info(crm_rental_reviews)");
  if (current.rows.length) {
    for (const name of ["property_id", "rented_since", "check_on", "source"]) {
      if (!current.rows.some((r) => r.name === name && String(r.type).toUpperCase() === "TEXT")) throw new Error(`Felaktigt schema: ${name}`);
    }
  }
  console.log(`Tillgänglighetskontroller: ${current.rows.length ? "tabell finns" : apply ? "tabell skapas" : "tabell behöver skapas"}`);
  if (apply) {
    const journal = JSON.parse(await readFile(new URL("../drizzle/meta/_journal.json", import.meta.url), "utf8"));
    const entry = journal.entries.find((item) => item.tag === tag);
    if (!entry) throw new Error(`${tag} saknas i Drizzle-journalen`);
    const sql = await readFile(new URL(`../drizzle/${tag}.sql`, import.meta.url), "utf8");
    const tx = await client.transaction("write");
    try {
      if (!current.rows.length) await tx.execute(sql.split("--> statement-breakpoint")[0]);
      await tx.execute("CREATE INDEX IF NOT EXISTS crm_rental_reviews_check_on_idx ON crm_rental_reviews (check_on)");
      await tx.execute("CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)");
      await tx.execute({ sql: "INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)",
        args: [createHash("sha256").update(sql).digest("hex"), entry.when, entry.when] });
      await tx.commit();
    } catch (error) { await tx.rollback(); throw error; }
    console.log("Migration 0049 registrerad");
  }
} finally { client.close(); }
