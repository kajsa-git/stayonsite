import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { companies, properties, requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const OPEN = ["incoming", "matching"];

function monthsBetween(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (isNaN(+d1) || isNaN(+d2)) return null;
  const m = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  return m > 0 ? m : null;
}

export async function GET() {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [reqRows, propRows] = await Promise.all([
    db
      .select({
        id: requests.id,
        status: requests.status,
        monthlyValue: requests.monthlyValue,
        budgetMax: requests.budgetMax,
        duration: requests.projectDurationMonths,
        startDate: requests.startDate,
        endDate: requests.endDate,
        city: requests.city,
        requestNumber: requests.requestNumber,
        companyId: requests.companyId,
        companyName: companies.name,
        statusChangedAt: requests.statusChangedAt,
        createdAt: requests.createdAt,
      })
      .from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id)),
    db
      .select({
        id: properties.id,
        address: properties.address,
        city: properties.city,
        rentIn: properties.rentIn,
        rentOut: properties.rentOut,
      })
      .from(properties),
  ]);

  type Req = (typeof reqRows)[number];
  const now = new Date();
  const year = now.getFullYear();

  // Förväntat affärsvärde per förfrågan: månadsbelopp × projektlängd.
  const valueOf = (r: Req) => {
    const monthly = r.monthlyValue ?? r.budgetMax ?? 0;
    const dur = r.duration ?? monthsBetween(r.startDate, r.endDate) ?? 1;
    return monthly * dur;
  };

  // ---- 12-månadersserie ----
  const months: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(year, now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: d.toLocaleDateString("sv-SE", { month: "short" }) });
  }
  const monthIdx = new Map(months.map((m, i) => [m.key, i] as const));
  const revenueByMonth = months.map((m) => ({ month: m.label, won: 0, pipeline: 0 }));

  // ---- KPI:er + funnel + per stad ----
  let pipelineValue = 0;
  let pipelineCount = 0;
  let wonValueTotal = 0;
  let wonValueYear = 0;
  let wonCount = 0;
  let lostCount = 0;
  const funnel = { incoming: 0, matching: 0, won: 0 };

  type CityAgg = { city: string; pipeline: number; won: number; margin: number };
  const cityMap = new Map<string, CityAgg>();
  const ensureCity = (raw?: string | null): CityAgg => {
    const city = (raw ?? "").trim() || "Okänd ort";
    let e = cityMap.get(city);
    if (!e) {
      e = { city, pipeline: 0, won: 0, margin: 0 };
      cityMap.set(city, e);
    }
    return e;
  };

  const topPipeline: { requestNumber: number | null; companyName: string; city: string | null; value: number }[] = [];

  for (const r of reqRows) {
    if (r.status === "incoming") funnel.incoming++;
    if (r.status === "matching") funnel.matching++;
    if (r.status === "won") funnel.won++;

    const v = valueOf(r);
    if (OPEN.includes(r.status)) {
      pipelineValue += v;
      pipelineCount++;
      ensureCity(r.city).pipeline += v;
      topPipeline.push({ requestNumber: r.requestNumber, companyName: r.companyName, city: r.city, value: v });
      const mk = (r.createdAt ?? "").slice(0, 7);
      const idx = monthIdx.get(mk);
      if (idx != null) revenueByMonth[idx].pipeline += v;
    } else if (r.status === "won") {
      wonValueTotal += v;
      wonCount++;
      ensureCity(r.city).won += v;
      const when = r.statusChangedAt ?? r.createdAt ?? "";
      if (when.slice(0, 4) === String(year)) wonValueYear += v;
      const idx = monthIdx.get(when.slice(0, 7));
      if (idx != null) revenueByMonth[idx].won += v;
    } else if (r.status === "lost") {
      lostCount++;
    }
  }

  // ---- Objektsbankens marginalpotential ----
  let marginPotential = 0;
  let objectsPriced = 0;
  const topMargin: { id: string; address: string | null; city: string | null; margin: number }[] = [];
  for (const p of propRows) {
    if (p.rentIn != null && p.rentOut != null) {
      const margin = p.rentOut - p.rentIn;
      marginPotential += margin;
      objectsPriced++;
      ensureCity(p.city).margin += margin;
      topMargin.push({ id: p.id, address: p.address, city: p.city, margin });
    }
  }

  topPipeline.sort((a, b) => b.value - a.value);
  topMargin.sort((a, b) => b.margin - a.margin);
  const byCity = [...cityMap.values()]
    .sort((a, b) => b.pipeline + b.won + b.margin - (a.pipeline + a.won + a.margin))
    .slice(0, 8);

  const decided = wonCount + lostCount;

  return NextResponse.json({
    kpis: {
      pipelineValue,
      pipelineCount,
      wonValueYear,
      wonValueTotal,
      wonCount,
      lostCount,
      winRate: decided > 0 ? wonCount / decided : null,
      marginPotential,
      objectsPriced,
      totalProperties: propRows.length,
    },
    funnel,
    revenueByMonth,
    byCity,
    topPipeline: topPipeline.slice(0, 6),
    topMargin: topMargin.slice(0, 6),
  });
}
