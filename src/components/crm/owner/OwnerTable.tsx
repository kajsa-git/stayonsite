"use client";

// Uthyrarbanken: sök- och filtrerbar lista över alla uthyrare. Radklick öppnar
// uthyrarsidan (/crm/uthyrare/[id]). Samma mönster som CompanyTable.
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/crm/fetcher";
import { todayStockholm } from "@/lib/crm/date";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { PhoneActions } from "@/components/crm/PhoneActions";

type OwnerFilter = "all" | "followup" | "no_phone" | "published";

const FILTERS: { value: OwnerFilter; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "followup", label: "Återkomst idag/försenad" },
  { value: "no_phone", label: "Saknar telefon" },
  { value: "published", label: "Med publicerade" },
];

interface Row {
  id: string;
  name: string;
  ownerType: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  followUpDate: string | null;
  propertyCount: number;
  publishedCount: number | null;
  lastSmsAt: string | null;
}

const TYPE_LABEL: Record<string, string> = { privatperson: "Privat", foretag: "Företag" };

const fetcher = swrFetcher;

export function OwnerTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<OwnerFilter>("all");
  const today = todayStockholm();

  // Debounca söktexten så vi inte skjuter en 500-raders fråga per tangenttryck.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: rows = [], isLoading } = useSWR<Row[]>(
    `/api/crm/owners?limit=500&q=${encodeURIComponent(debouncedSearch)}`,
    fetcher,
  );
  const loading = isLoading && rows.length === 0;

  const filtered = useMemo(() => {
    switch (filter) {
      case "followup":
        return rows.filter((r) => r.followUpDate && r.followUpDate <= today);
      case "no_phone":
        return rows.filter((r) => !r.phone?.trim());
      case "published":
        return rows.filter((r) => (r.publishedCount ?? 0) > 0);
      default:
        return rows;
    }
  }, [rows, filter, today]);

  const open = (id: string) => router.push(`/crm/uthyrare/${id}`);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-3 border-b bg-white shrink-0 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Sök uthyrare…"
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
        <span className="text-xs text-muted-foreground">{filtered.length} uthyrare</span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden [&>div]:overflow-visible">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-nordic-100 [&_th]:h-auto [&_th]:py-2.5 [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-wide [&_th]:font-semibold [&_th]:whitespace-nowrap [&_th]:text-nordic-900">
              <TableRow className="border-b border-nordic-200 hover:bg-transparent">
                <TableHead className="w-12" />
                <TableHead>Uthyrare</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead className="text-right">Objekt</TableHead>
                <TableHead className="text-right">Publicerade</TableHead>
                <TableHead>Återkomst</TableHead>
                <TableHead>Senaste SMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:py-3 [&_td]:whitespace-nowrap">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-t border-nordic-100">
                    <TableCell colSpan={8}><div className="h-5 w-full rounded bg-nordic-100 animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="py-10 text-center text-muted-foreground italic">Inga uthyrare.</TableCell></TableRow>
              ) : (
                filtered.map((o) => (
                  <TableRow
                    key={o.id}
                    tabIndex={0}
                    onClick={() => open(o.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(o.id); } }}
                    className="even:bg-nordic-100 hover:bg-primary-50/70 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
                  >
                    <TableCell>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-nordic-700 text-white text-[11px] font-bold">{initials(o.name)}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {o.name}
                      {o.contactPerson && <span className="text-muted-foreground font-normal"> · {o.contactPerson}</span>}
                    </TableCell>
                    <TableCell className="text-foreground">{o.ownerType ? (TYPE_LABEL[o.ownerType] ?? o.ownerType) : "–"}</TableCell>
                    <TableCell className="text-foreground">
                      {o.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          {formatPhoneSv(o.phone)}
                          <PhoneActions phone={o.phone} ownerId={o.id} />
                        </span>
                      ) : "–"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">{o.propertyCount}</TableCell>
                    <TableCell className="text-right">
                      {(o.publishedCount ?? 0) > 0 ? (
                        <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 rounded-full px-2.5 py-0.5">{o.publishedCount}</span>
                      ) : <span className="text-muted-foreground">–</span>}
                    </TableCell>
                    <TableCell>
                      {o.followUpDate ? (
                        <span className={o.followUpDate <= today ? "text-amber-700 font-medium" : "text-foreground"}>{o.followUpDate}</span>
                      ) : <span className="text-muted-foreground">–</span>}
                    </TableCell>
                    <TableCell className="text-foreground">{o.lastSmsAt ? o.lastSmsAt.slice(0, 10) : <span className="text-muted-foreground">–</span>}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
