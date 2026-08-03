// Öppna förfrågningar (någon söker boende) — för omvänd matchning från ett objekt.
// Delas av /api/crm/open-requests och MCP-verktyget crm_open_requests.
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { companies, requests } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export interface OpenRequestSummary {
  id: string;
  requestNumber: number | null;
  companyId: string;
  companyName: string;
  city: string | null;
  status: string;
  persons: number | null;
  budgetMax: number | null;
}

export async function listOpenRequests(opts?: {
  q?: string;
  limit?: number;
  db?: DB;
}): Promise<OpenRequestSummary[]> {
  const db = opts?.db ?? defaultDb;
  const q = opts?.q?.trim();
  const limit = opts?.limit ?? 50;

  const conds = [inArray(requests.status, ["incoming", "matching"])];
  if (q) {
    const pat = `%${q}%`;
    conds.push(or(like(companies.name, pat), like(requests.city, pat))!);
  }

  return db
    .select({
      id: requests.id,
      requestNumber: requests.requestNumber,
      companyId: requests.companyId,
      companyName: companies.name,
      city: requests.city,
      status: requests.status,
      persons: requests.persons,
      budgetMax: requests.budgetMax,
    })
    .from(requests)
    .innerJoin(companies, eq(requests.companyId, companies.id))
    .where(and(...conds))
    .orderBy(desc(requests.createdAt))
    .limit(limit);
}
