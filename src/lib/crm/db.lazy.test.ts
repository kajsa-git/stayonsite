import { describe, expect, it } from "vitest";
import { is, sql } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

// Den lata libSQL-klienten får inte skapas vid module-load (då kraschar
// `next build` när TURSO_DATABASE_URL saknas, t.ex. i Vercel-preview), men `db`
// måste fortfarande vara en riktig LibSQLDatabase så att @auth/drizzle-adapter:s
// `is(db, BaseSQLiteDatabase)` och liknande introspektion funkar.
describe("crm db lazy client", () => {
  it("imports without TURSO_DATABASE_URL and exposes a real SQLite db", async () => {
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    const { db } = await import("./db");
    // Detta är exakt kontrollen @auth/drizzle-adapter gör för att välja dialekt.
    // Hade db varit en tom proxy (eller hade klienten skapats här) → fel.
    expect(is(db, BaseSQLiteDatabase)).toBe(true);
  });

  it("connects on first query and forwards results", async () => {
    process.env.TURSO_DATABASE_URL = "file::memory:";
    const { db } = await import("./db");
    const result = await db.run(sql`select 1 as x`);
    expect(result.rows[0]).toMatchObject({ x: 1 });
  });
});
