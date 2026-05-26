"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";

type CompanyFilter = "all" | "active" | "followup" | "no_followup";

const FILTERS: { value: CompanyFilter; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "active", label: "Aktiva förfrågningar" },
  { value: "followup", label: "Återkomst idag/försenad" },
  { value: "no_followup", label: "Saknar återkomst" },
];

interface Row {
  id: string;
  name: string;
  orgNr: string | null;
  leadSource: string | null;
  followUpDate: string | null;
  requestCount: number;
  openRequestCount: number;
  primaryContactName: string | null;
  primaryContactPhone: string | null;
}

const LEAD_SOURCE: Record<string, string> = {
  kallt: "Kallt samtal",
  webb: "Webb",
  befintlig: "Befintlig kund",
  referens: "Referens",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CompanyTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CompanyFilter>("all");
  const today = new Date().toISOString().split("T")[0];

  const { data: rows = [], isLoading } = useSWR<Row[]>(
    `/api/crm/companies?summary=1&limit=500&q=${encodeURIComponent(search)}`,
    fetcher
  );
  const loading = isLoading && rows.length === 0;

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return rows.filter((r) => r.openRequestCount > 0);
      case "followup":
        return rows.filter((r) => r.followUpDate && r.followUpDate <= today);
      case "no_followup":
        return rows.filter((r) => !r.followUpDate);
      default:
        return rows;
    }
  }, [rows, filter, today]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-3 border-b bg-white shrink-0 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Sök företag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filter === f.value
                  ? "bg-nordic-800 text-white border-nordic-800"
                  : "bg-white text-nordic-700 border-input hover:bg-nordic-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} företag</span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-nordic-50 text-left text-[11px] text-muted-foreground uppercase tracking-wide">
              <tr className="border-b border-nordic-200">
                <Th className="w-12" />
                <Th>Företag</Th>
                <Th>Org.nr</Th>
                <Th>Lead-källa</Th>
                <Th>Huvudkontakt</Th>
                <Th className="text-right">Förfrågningar</Th>
                <Th>Återkomst</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-nordic-100">
                    <td colSpan={7} className="px-4 py-3"><div className="h-5 w-full rounded bg-nordic-100 animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground italic">Inga företag.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    tabIndex={0}
                    onClick={() => router.push(`/crm/company/${c.id}`)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/crm/company/${c.id}`); } }}
                    className="border-t border-nordic-100 hover:bg-nordic-50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
                  >
                    <Td>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-nordic-700 text-white text-[11px] font-bold">{initials(c.name)}</span>
                    </Td>
                    <Td className="font-semibold text-nordic-900">{c.name}</Td>
                    <Td className="font-mono text-xs text-nordic-600">{c.orgNr || "–"}</Td>
                    <Td className="text-nordic-600">{c.leadSource ? (LEAD_SOURCE[c.leadSource] ?? c.leadSource) : "–"}</Td>
                    <Td className="text-nordic-600">
                      {c.primaryContactName ? (
                        <span>{c.primaryContactName}{c.primaryContactPhone && <span className="text-muted-foreground"> · {c.primaryContactPhone}</span>}</span>
                      ) : "–"}
                    </Td>
                    <Td className="text-right">
                      {c.openRequestCount > 0 ? (
                        <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 rounded-full px-2.5 py-0.5">{c.openRequestCount} aktiva</span>
                      ) : c.requestCount > 0 ? (
                        <span className="inline-block text-xs font-medium text-nordic-600 bg-nordic-100 rounded-full px-2.5 py-0.5">{c.requestCount} st</span>
                      ) : <span className="text-muted-foreground">–</span>}
                    </Td>
                    <Td>
                      {c.followUpDate ? (
                        <span className={c.followUpDate <= today ? "text-amber-700 font-medium" : "text-nordic-600"}>{c.followUpDate}</span>
                      ) : <span className="text-muted-foreground">–</span>}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-semibold whitespace-nowrap ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 whitespace-nowrap ${className}`}>{children}</td>;
}
