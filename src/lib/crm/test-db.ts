// Delad testharness: tempfils-libSQL med det riktiga, migrerade schemat.
// Samma migrationsapplicering som cascade-delete.test.ts/agreement-reminders.test.ts —
// läser drizzle/meta/_journal.json och spelar upp varje .sql i ordning.
// Används bara av *.test.ts (ingen produktionskod importerar den).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type TestDB = LibSQLDatabase<typeof schema>;

async function applyMigrations(client: Client) {
  const dir = path.resolve(__dirname, "../../../drizzle");
  const journal = JSON.parse(fs.readFileSync(path.join(dir, "meta/_journal.json"), "utf8")) as {
    entries: { tag: string }[];
  };
  for (const entry of journal.entries) {
    const sqlText = fs.readFileSync(path.join(dir, `${entry.tag}.sql`), "utf8");
    const statements = sqlText
      .replace(/-->\s*statement-breakpoint/g, "")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && s.split("\n").some((l) => !l.trim().startsWith("--") && l.trim()));
    for (const stmt of statements) {
      await client.execute(stmt);
    }
  }
}

export async function createTestDb(prefix = "crm-test"): Promise<{ db: TestDB; cleanup: () => void }> {
  const dbFile = path.join(
    os.tmpdir(),
    `${prefix}-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );
  const client = createClient({ url: `file:${dbFile}` });
  await applyMigrations(client);
  const db = drizzle(client, { schema });
  return {
    db,
    cleanup: () => {
      for (const suffix of ["", "-wal", "-shm"]) {
        try {
          fs.rmSync(dbFile + suffix);
        } catch {
          /* filen kanske inte finns */
        }
      }
    },
  };
}
