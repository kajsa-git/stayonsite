"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Wallet, Target, Building2 } from "lucide-react";

const TEAL = "#14b8a6";
const GREEN = "#16a34a";
const ACCENT = "#ff6300";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Overview {
  kpis: {
    pipelineValue: number;
    pipelineCount: number;
    wonValueYear: number;
    wonValueTotal: number;
    wonCount: number;
    lostCount: number;
    winRate: number | null;
    marginPotential: number;
    objectsPriced: number;
    totalProperties: number;
  };
  funnel: { incoming: number; matching: number; won: number };
  revenueByMonth: { month: string; won: number; pipeline: number }[];
  byCity: { city: string; pipeline: number; won: number; margin: number }[];
  topPipeline: { requestNumber: number | null; companyName: string; city: string | null; value: number }[];
  topMargin: { id: string; address: string | null; city: string | null; margin: number }[];
}

function krCompact(n: number): string {
  if (!n) return "0 kr";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1e6).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} Mkr`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1000).toLocaleString("sv-SE")} tkr`;
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}
function krFull(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

export function OverviewView() {
  const router = useRouter();
  const { data, isLoading } = useSWR<Overview>("/api/crm/overview", fetcher, { refreshInterval: 30000 });
  const loading = isLoading && !data;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="h-7 w-40 rounded bg-nordic-100 animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-4 space-y-3">
              <div className="h-3 w-24 rounded bg-nordic-100 animate-pulse" />
              <div className="h-7 w-28 rounded bg-nordic-100 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-72 rounded-xl border bg-white animate-pulse" />
      </div>
    );
  }

  const k = data?.kpis;
  if (!k) return null;

  const monthData = data!.revenueByMonth;
  const hasMonthData = monthData.some((m) => m.won > 0 || m.pipeline > 0);
  const funnelMax = Math.max(data!.funnel.incoming, data!.funnel.matching, data!.funnel.won, 1);
  const funnelStages = [
    { label: "Inkommande", value: data!.funnel.incoming, color: "bg-purple-400" },
    { label: "Matchning", value: data!.funnel.matching, color: "bg-amber-400" },
    { label: "Vunnet", value: data!.funnel.won, color: "bg-green-500" },
  ];
  const cityMax = Math.max(...data!.byCity.map((c) => c.pipeline + c.won), 1);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-nordic-900">Översikt</h1>
        <p className="text-sm text-muted-foreground mt-1">Pipeline och affärer — så mycket ligger och väntar.</p>
      </div>

      {/* KPI-kort */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Pipeline-värde"
          value={krCompact(k.pipelineValue)}
          sub={`${k.pipelineCount} aktiva förfrågning${k.pipelineCount === 1 ? "" : "ar"}`}
          tone="teal"
        />
        <Kpi
          icon={<Wallet className="h-4 w-4" />}
          label="Vunnet i år"
          value={krCompact(k.wonValueYear)}
          sub={`${k.wonCount} vunna affärer totalt`}
          tone="green"
        />
        <Kpi
          icon={<Target className="h-4 w-4" />}
          label="Vinstandel"
          value={k.winRate == null ? "–" : `${Math.round(k.winRate * 100)} %`}
          sub={`${k.wonCount} vunna · ${k.lostCount} förlorade`}
          tone="slate"
        />
        <Kpi
          icon={<Building2 className="h-4 w-4" />}
          label="Marginalpotential / mån"
          value={krCompact(k.marginPotential)}
          sub={`${k.objectsPriced} av ${k.totalProperties} objekt prissatta`}
          tone="accent"
        />
      </div>

      {/* Intäkt & pipeline per månad */}
      <div className="rounded-xl border bg-white p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-nordic-900">Intäkt & pipeline per månad</h2>
          <Legend />
        </div>
        {hasMonthData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece9e4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a8a8a" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={krCompact} tick={{ fontSize: 11, fill: "#8a8a8a" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip formatter={(v: number) => krFull(v)} cursor={{ fill: "#f5f5f4" }} />
              <Bar dataKey="won" name="Vunnet" fill={GREEN} radius={[3, 3, 0, 0]} />
              <Bar dataKey="pipeline" name="Pipeline" fill={TEAL} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="Inga affärer loggade ännu. Vinn en förfrågan och fyll i affärsvärdet — så fylls den här grafen." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline-tratt */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-nordic-900 mb-4">Pipeline-tratt</h2>
          <div className="space-y-3">
            {funnelStages.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-nordic-700">{s.label}</span>
                  <span className="font-semibold tabular-nums text-nordic-900">{s.value}</span>
                </div>
                <div className="h-7 rounded-md bg-nordic-100 overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-md transition-all`}
                    style={{ width: `${Math.max((s.value / funnelMax) * 100, s.value > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per stad */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-nordic-900 mb-4">Affärsvärde per stad</h2>
          {data!.byCity.length === 0 ? (
            <EmptyChart text="Ingen orts-data ännu." />
          ) : (
            <div className="space-y-2.5">
              {data!.byCity.map((c) => {
                const total = c.pipeline + c.won;
                return (
                  <div key={c.city}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-nordic-700 truncate">{c.city}</span>
                      <span className="tabular-nums text-muted-foreground">{krCompact(total)}</span>
                    </div>
                    <div className="h-4 rounded bg-nordic-100 overflow-hidden flex">
                      {c.won > 0 && <div className="h-full" style={{ width: `${(c.won / cityMax) * 100}%`, background: GREEN }} />}
                      {c.pipeline > 0 && <div className="h-full" style={{ width: `${(c.pipeline / cityMax) * 100}%`, background: TEAL }} />}
                    </div>
                    {c.margin > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        + {krCompact(c.margin)}/mån i objektmarginal
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Närmaste att stänga */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-nordic-900 mb-3">Närmaste att stänga</h2>
          {data!.topPipeline.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Inga aktiva förfrågningar.</p>
          ) : (
            <ul className="divide-y">
              {data!.topPipeline.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate">
                    {p.requestNumber != null && <span className="text-muted-foreground">#{p.requestNumber} </span>}
                    {p.companyName}
                    {p.city && <span className="text-muted-foreground"> · {p.city}</span>}
                  </span>
                  <span className="font-semibold tabular-nums text-nordic-900 shrink-0 ml-3">{krCompact(p.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Objekt med störst marginal */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-nordic-900 mb-3">Objekt med störst marginal</h2>
          {data!.topMargin.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Inga prissatta objekt (fyll i pris ut på objekten).</p>
          ) : (
            <ul className="divide-y">
              {data!.topMargin.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2 text-sm cursor-pointer hover:bg-nordic-50 -mx-2 px-2 rounded"
                  onClick={() => router.push(`/crm/properties?id=${p.id}`)}
                >
                  <span className="truncate">
                    {p.address ?? "(adress saknas)"}
                    {p.city && <span className="text-muted-foreground"> · {p.city}</span>}
                  </span>
                  <span className="font-semibold tabular-nums shrink-0 ml-3" style={{ color: ACCENT }}>
                    {krCompact(p.margin)}/mån
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RebuildIndexButton />
    </div>
  );
}

function RebuildIndexButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function rebuild() {
    setState("loading");
    try {
      const res = await fetch("/api/crm/search-index/rebuild", { method: "POST" });
      const data = await res.json();
      if (data.ok) setState("done");
      else setState("error");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <div className="mt-10 pt-6 border-t flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        Om Cmd+K-sökningen inte hittar objekt eller kontakter — synka sökindexet.
      </p>
      <button
        onClick={rebuild}
        disabled={state === "loading"}
        className="text-xs px-3 py-1.5 rounded border border-input bg-white text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0 ml-4"
      >
        {state === "loading" ? "Bygger om…" : state === "done" ? "✓ Klart" : state === "error" ? "Fel — försök igen" : "Synka sökindex"}
      </button>
    </div>
  );
}

const TONES: Record<string, { ring: string; icon: string; value: string }> = {
  teal: { ring: "border-l-teal-500", icon: "text-teal-600", value: "text-nordic-900" },
  green: { ring: "border-l-green-500", icon: "text-green-600", value: "text-nordic-900" },
  slate: { ring: "border-l-nordic-400", icon: "text-nordic-600", value: "text-nordic-900" },
  accent: { ring: "border-l-[#ff6300]", icon: "text-[#ff6300]", value: "text-nordic-900" },
};

function Kpi({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div className={`rounded-xl border border-l-4 ${t.ring} bg-white p-4`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <span className={t.icon}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold tabular-nums ${t.value}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: GREEN }} /> Vunnet
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TEAL }} /> Pipeline
      </span>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-44 flex items-center justify-center text-center">
      <p className="text-sm text-muted-foreground max-w-xs">{text}</p>
    </div>
  );
}
