// Global sökning mot det denormaliserade sökindexet (crm_search_index).
// Delas av /api/crm/search-all och MCP-verktyget crm_search — en implementation.
import { and, like, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { searchIndex } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export interface SearchHit {
  id: string;
  entityType: string;
  entityId: string;
  companyId: string | null;
  title: string;
  subtitle: string | null;
  route: string;
}

export async function searchCrm(
  rawQuery: string,
  opts?: { db?: DB; limit?: number },
): Promise<SearchHit[]> {
  const db = opts?.db ?? defaultDb;
  const limit = opts?.limit ?? 20;

  // Normalisera: gemener, neutralisera LIKE-jokrar (% _ \) så att t.ex. "50%" inte
  // matchar allt, trimma, kollapsa whitespace.
  const q = rawQuery
    .toLowerCase()
    .replace(/[%_\\]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (q.length < 2) return [];

  // Flera ord → alla måste matcha (AND av LIKE). Cappa antal termer.
  const terms = q.split(" ").slice(0, 5);

  return db
    .select({
      id: searchIndex.id,
      entityType: searchIndex.entityType,
      entityId: searchIndex.entityId,
      companyId: searchIndex.companyId,
      title: searchIndex.title,
      subtitle: searchIndex.subtitle,
      route: searchIndex.route,
    })
    .from(searchIndex)
    .where(and(...terms.map((t) => like(searchIndex.keywords, `%${t}%`))))
    // Prioritera primära entiteter så de inte trängs ut av många anteckningar
    .orderBy(
      sql`CASE ${searchIndex.entityType} WHEN 'company' THEN 0 WHEN 'request' THEN 1 WHEN 'property' THEN 2 WHEN 'owner' THEN 3 WHEN 'contact' THEN 4 ELSE 5 END`,
    )
    .limit(limit);
}
