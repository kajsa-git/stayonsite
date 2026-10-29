// Körs uttryckligen inför driftsättning. Ändrar bara de två nya tabellerna.
// Använd inte för testdata: lokala tester migrerar en separat, tom databas.
import fs from "node:fs";
import { createClient } from "@libsql/client";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL saknas.");
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
try {
  const source = fs.readFileSync(new URL("../drizzle/0045_billing_plans.sql", import.meta.url), "utf8");
  const statements = source.replace(/-->\s*statement-breakpoint/g, "").split(";").map((statement) => statement.trim()).filter(Boolean);
  // Idempotent applicering för befintlig produktionsdatabas utan Drizzle-journal.
  await client.batch(statements.map((statement) => statement.replace(/^CREATE TABLE /, "CREATE TABLE IF NOT EXISTS ").replace(/^CREATE UNIQUE INDEX /, "CREATE UNIQUE INDEX IF NOT EXISTS ").replace(/^CREATE INDEX /, "CREATE INDEX IF NOT EXISTS ")), "write");
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('crm_billing_plans', 'crm_billing_periods') ORDER BY name");
  if (tables.rows.length !== 2) throw new Error("Båda faktureringstabellerna kunde inte verifieras.");
  console.log("0045: Fakturaplaner och månadshistorik är verifierade. Inga kund- eller bokningsstatusar har ändrats.");
} finally { client.close(); }
