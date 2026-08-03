// Företagskortet: företaget + kontakter + förfrågningar (med förslagsräknare) +
// anteckningar i ett svar. Delas av /api/crm/companies/[id] GET och MCP-verktyget
// crm_get_company — en implementation.
import { eq, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { companies, contacts, matches, notes, requests, type Company, type Contact, type Note, type Request } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export type CompanyDetail = Company & {
  contacts: Contact[];
  requests: (Request & { matchCount: number })[];
  notes: Note[];
};

export async function getCompanyDetail(id: string, opts?: { db?: DB }): Promise<CompanyDetail | null> {
  const db = opts?.db ?? defaultDb;

  const [company] = await db.select().from(companies).where(eq(companies.id, id));
  if (!company) return null;

  const [companyContacts, companyRequests, companyNotes] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.companyId, id)),
    db.select().from(requests).where(eq(requests.companyId, id)),
    db.select().from(notes).where(eq(notes.companyId, id)),
  ]);

  // Attach proposal (match) counts per request
  const requestIds = companyRequests.map((r) => r.id);
  let matchCounts: Record<string, number> = {};
  if (requestIds.length) {
    const rows = await db
      .select({ requestId: matches.requestId })
      .from(matches)
      .where(inArray(matches.requestId, requestIds));
    matchCounts = rows.reduce((acc, r) => {
      acc[r.requestId] = (acc[r.requestId] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  const requestsWithCounts = companyRequests.map((r) => ({ ...r, matchCount: matchCounts[r.id] ?? 0 }));

  return { ...company, contacts: companyContacts, requests: requestsWithCounts, notes: companyNotes };
}
