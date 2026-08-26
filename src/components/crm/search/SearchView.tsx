"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/crm/fetcher";

interface Result {
  id: string;
  name: string;
  orgNr: string | null;
  followUpDate: string | null;
  followUpReason: string | null;
}

const STATUS_OPTIONS = [
  { value: "", label: "Alla statusar" },
  { value: "incoming", label: "Inkommen" },
  { value: "matching", label: "Matchar" },
  { value: "won", label: "Vunnen" },
  { value: "invoiced", label: "Fakturerad" },
  { value: "lost", label: "Nej tack" },
  { value: "archived", label: "Arkiverad" },
];

const fetcher = swrFetcher;
const LABEL = "text-xs font-medium text-muted-foreground uppercase tracking-wide";
const INPUT = "w-full text-sm bg-white border border-input rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function SearchView() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    city: "",
    followUpFrom: "",
    followUpTo: "",
  });

  const hasFilters = Object.values(filters).some((v) => v.trim() !== "");

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v.trim()) sp.set(k, v.trim());
    });
    return sp.toString();
  }, [filters]);

  const { data: results = [], isLoading } = useSWR<Result[]>(
    hasFilters ? `/api/crm/find?${queryString}` : null,
    fetcher
  );

  function set(field: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-nordic-900 mb-1">Sök</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Filtrera på fält — resultatet blir din arbetslista.
      </p>

      {/* Filter form */}
      <div className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3 flex flex-col gap-1">
          <label className={LABEL}>Fritext (alla fält)</label>
          <input
            className={INPUT}
            placeholder="Namn, org.nr, kontakt, anteckning, ort…"
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={LABEL}>Förfrågans status</label>
          <select className={INPUT} value={filters.status} onChange={(e) => set("status", e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={LABEL}>Ort (förfrågan)</label>
          <input className={INPUT} placeholder="Stockholm" value={filters.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={LABEL}>Återkomst från</label>
          <input type="date" className={INPUT} value={filters.followUpFrom} onChange={(e) => set("followUpFrom", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={LABEL}>Återkomst till</label>
          <input type="date" className={INPUT} value={filters.followUpTo} onChange={(e) => set("followUpTo", e.target.value)} />
        </div>
        <div className="flex items-end">
          {hasFilters && (
            <button
              onClick={() => setFilters({ q: "", status: "", city: "", followUpFrom: "", followUpTo: "" })}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Rensa filter
            </button>
          )}
        </div>
      </div>

      {/* Found set */}
      {!hasFilters ? (
        <p className="text-sm text-muted-foreground italic">Ange minst ett filter för att söka.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Söker…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Inga träffar.</p>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            {results.length} träffar
          </p>
          <div className="bg-white border rounded-lg divide-y">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/crm/company/${c.id}`)}
                className="w-full text-left px-4 py-3 hover:bg-nordic-100 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.orgNr}
                  </div>
                </div>
                {c.followUpDate && (
                  <span className="text-xs text-amber-700 shrink-0">
                    Återkomst {c.followUpDate}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
