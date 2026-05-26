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

  const { data: rows = [] } = useSWR<Row[]>(
    `/api/crm/companies?summary=1&limit=500&q=${encodeURIComponent(search)}`,
    fetcher
  );

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

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-nordic-50 z-10">
            <tr className="text-left text-[11px] text-muted-foreground uppercase tracking-wide">
              <Th>Företag</Th>
              <Th>Org.nr</Th>
              <Th>Lead-källa</Th>
              <Th>Huvudkontakt</Th>
              <Th>Förfrågningar</Th>
              <Th>Återkomst</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground italic">Inga företag.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/crm/company/${c.id}`)}
                  className="border-b hover:bg-nordic-100 cursor-pointer"
                >
                  <Td className="font-medium">{c.name}</Td>
                  <Td className="font-mono text-xs">{c.orgNr || "–"}</Td>
                  <Td>{c.leadSource ? (LEAD_SOURCE[c.leadSource] ?? c.leadSource) : "–"}</Td>
                  <Td>
                    {c.primaryContactName ? (
                      <span>
                        {c.primaryContactName}
                        {c.primaryContactPhone && (
                          <span className="text-muted-foreground"> · {c.primaryContactPhone}</span>
                        )}
                      </span>
                    ) : (
                      "–"
                    )}
                  </Td>
                  <Td>
                    {c.openRequestCount > 0 ? (
                      <span className="font-medium text-nordic-900">{c.openRequestCount} aktiva</span>
                    ) : (
                      <span className="text-muted-foreground">{c.requestCount > 0 ? `${c.requestCount} st` : "–"}</span>
                    )}
                  </Td>
                  <Td>
                    {c.followUpDate ? (
                      <span className={c.followUpDate <= today ? "text-amber-700 font-medium" : ""}>
                        {c.followUpDate}
                      </span>
                    ) : (
                      "–"
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium whitespace-nowrap">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 whitespace-nowrap ${className}`}>{children}</td>;
}
