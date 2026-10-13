import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import { addDaysYmd } from "./date";
import * as schema from "./schema";
import { companies, owners, properties, requests } from "./schema";
import { buildWeeklyReport, reportWeeks } from "./weekly-report-data";

export async function computeWeeklyReport(options?: {
  db?: LibSQLDatabase<typeof schema>;
  now?: Date;
  includeCurrent?: boolean;
}) {
  const db = options?.db ?? defaultDb;
  const now = options?.now ?? new Date();
  const includeCurrent = options?.includeCurrent ?? true;
  // Fetch one extra UTC day: a Swedish Monday starts on the preceding UTC day.
  // Exact week boundaries are then applied in Europe/Stockholm by the aggregator.
  const earliest = addDaysYmd(reportWeeks(now, includeCurrent)[0].startDate, -1);
  const inWindow = (column: typeof properties.createdAt | typeof requests.createdAt) =>
    sql`datetime(${column}) >= datetime(${earliest}) AND datetime(${column}) <= datetime(${now.toISOString()})`;

  const [propertyRows, requestRows] = await Promise.all([
    db.select({ id: properties.id, createdAt: properties.createdAt, city: properties.city,
      address: properties.address, ownerName: owners.name })
      .from(properties).leftJoin(owners, sql`${properties.ownerId} = ${owners.id}`)
      .where(inWindow(properties.createdAt)),
    db.select({ id: requests.id, createdAt: requests.createdAt, city: requests.city,
      requestNumber: requests.requestNumber, companyName: companies.name })
      .from(requests).leftJoin(companies, sql`${requests.companyId} = ${companies.id}`)
      .where(inWindow(requests.createdAt)),
  ]);
  return buildWeeklyReport({ properties: propertyRows, requests: requestRows, now, includeCurrent });
}
