"use client";

import useSWR from "swr";
import { useState } from "react";
import { crmErrorMessage, swrFetcher } from "@/lib/crm/fetcher";

const fetcher = swrFetcher;

type PeriodStats = {
  won: number;
  wonValue: number;
  lost: number;
  newCompanies: number;
  newRequests: number;
};

interface Overview {
  generatedAt: string;
  ongoing: { count: number; estimatedValue: number };
  periods: { week: PeriodStats; month: PeriodStats };
}

function krCompact(n: number): string {
  if (!n) return "0 kr";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1e6).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} Mkr`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1000).toLocaleString("sv-SE")} tkr`;
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

export function OverviewView() {
  const { data, isLoading, error, mutate } = useSWR<Overview>("/api/crm/overview", fetcher, { refreshInterval: 30000 });
  const loading = isLoading && !data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-nordic-900">Översikt</h1>
        <p className="text-sm text-muted-foreground mt-1">Pågående affärer och avslut den här veckan och månaden.</p>
      </div>

      {error && !data && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="font-medium">Kunde inte ladda översikten.</span>
          <span className="text-red-700/80">{crmErrorMessage(error)}</span>
          <button
            onClick={() => mutate()}
            className="ml-auto shrink-0 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
          >
            Försök igen
          </button>
        </div>
      )}

      {/* Pågående affärer + uppskattat ordervärde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <BigStat
          label="Pågående affärer"
          value={loading ? "…" : String(data?.ongoing.count ?? 0)}
          sub="öppna förfrågningar (inkommande + matchning)"
          tone="teal"
        />
        <BigStat
          label="Uppskattat ordervärde"
          value={loading ? "…" : krCompact(data?.ongoing.estimatedValue ?? 0)}
          sub="budget × projektlängd för pågående affärer"
          tone="accent"
        />
      </div>

      {/* Vecka + månad sida vid sida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PeriodCard title="Den här veckan" p={data?.periods.week} loading={loading} />
        <PeriodCard title="Den här månaden" p={data?.periods.month} loading={loading} />
      </div>

      <RebuildIndexButton />
    </div>
  );
}

function PeriodCard({ title, p, loading }: { title: string; p?: PeriodStats; loading: boolean }) {
  const v = (n?: number) => (loading ? "…" : String(n ?? 0));
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="text-sm font-semibold text-nordic-900 mb-3">{title}</h2>

      {/* Vunna affärer (ja) med värde */}
      <div className="rounded-lg border border-green-200 bg-green-50/60 p-3 mb-3">
        <p className="text-xs uppercase tracking-wide text-green-800">Vunna affärer (ja)</p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold tabular-nums text-green-800">{v(p?.won)}</span>
          <span className="text-sm font-medium text-green-700">{loading ? "" : krCompact(p?.wonValue ?? 0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SmallStat label="Nej" value={v(p?.lost)} />
        <SmallStat label="Nya företag" value={v(p?.newCompanies)} />
        <SmallStat label="Nya förfrågningar" value={v(p?.newRequests)} />
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  teal: "border-l-teal-500",
  accent: "border-l-[#ff6300]",
};

function BigStat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: keyof typeof TONES }) {
  return (
    <div className={`rounded-xl border border-l-4 ${TONES[tone]} bg-white p-5`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-nordic-900">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-nordic-50/50 p-3 text-center">
      <p className="text-xl font-bold tabular-nums text-nordic-900">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{label}</p>
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
