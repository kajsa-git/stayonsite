// Dashboard-aggregatet för CRM-översikten. Delas av /api/crm/overview och
// MCP-verktyget crm_overview — en implementation.
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { companies, requests } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

function monthsBetween(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (isNaN(+d1) || isNaN(+d2)) return null;
  const m = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  return m > 0 ? m : null;
}

export interface OverviewPeriod {
  won: number;
  wonValue: number;
  lost: number;
  newCompanies: number;
  newRequests: number;
}

export interface Overview {
  generatedAt: string;
  ongoing: { count: number; estimatedValue: number };
  periods: { week: OverviewPeriod; month: OverviewPeriod };
}

export async function computeOverview(opts?: { db?: DB; now?: Date }): Promise<Overview> {
  const db = opts?.db ?? defaultDb;
  const now = opts?.now ?? new Date();

  const [reqRows, companyRows] = await Promise.all([
    db
      .select({
        status: requests.status,
        monthlyValue: requests.monthlyValue,
        budgetMax: requests.budgetMax,
        duration: requests.projectDurationMonths,
        startDate: requests.startDate,
        endDate: requests.endDate,
        statusChangedAt: requests.statusChangedAt,
        createdAt: requests.createdAt,
      })
      .from(requests),
    db.select({ createdAt: companies.createdAt }).from(companies),
  ]);

  // Periodgränser i svensk tid (vilken vecka/månad vi är i). Jämförs mot lagrade
  // tidsstämplar på datum-prefix (YYYY-MM-DD) — robust mot UTC vs lokal lagring.
  const sthlm = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Stockholm" }));
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const startMonthStr = `${sthlm.getFullYear()}-${String(sthlm.getMonth() + 1).padStart(2, "0")}-01`;
  const dow = (sthlm.getDay() + 6) % 7; // 0 = måndag
  const monday = new Date(sthlm);
  monday.setDate(sthlm.getDate() - dow);
  const startWeekStr = ymd(monday);
  const day10 = (ts: string | null | undefined) => (ts ?? "").slice(0, 10);

  // Pågående affärer = öppna förfrågningar (incoming/matching).
  // Uppskattat ordervärde = budgetMax × projektlängd (faller tillbaka på datum-spann, annars 1 mån).
  const openDeals = reqRows.filter((r) => r.status === "incoming" || r.status === "matching");
  const ongoing = {
    count: openDeals.length,
    estimatedValue: openDeals.reduce((sum, r) => {
      const months = r.duration && r.duration > 0 ? r.duration : monthsBetween(r.startDate, r.endDate) ?? 1;
      return sum + (r.budgetMax ?? 0) * months;
    }, 0),
  };

  // Nyckeltal för en period (allt med datum >= start). "Stängd affär" = vunnen/fakturerad (ja).
  function periodStats(start: string): OverviewPeriod {
    const won = reqRows.filter(
      (r) => (r.status === "won" || r.status === "invoiced") && day10(r.statusChangedAt) >= start,
    );
    const lost = reqRows.filter((r) => r.status === "lost" && day10(r.statusChangedAt) >= start);
    return {
      won: won.length,
      wonValue: won.reduce((sum, r) => sum + (r.monthlyValue ?? 0), 0),
      lost: lost.length,
      newCompanies: companyRows.filter((c) => day10(c.createdAt) >= start).length,
      newRequests: reqRows.filter((r) => day10(r.createdAt) >= start).length,
    };
  }

  return {
    generatedAt: now.toISOString(),
    ongoing,
    periods: {
      week: periodStats(startWeekStr),
      month: periodStats(startMonthStr),
    },
  };
}
