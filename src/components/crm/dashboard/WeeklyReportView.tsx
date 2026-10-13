"use client";

import { Button } from "@/components/ui/button";
import { crmErrorMessage, swrFetcher } from "@/lib/crm/fetcher";
import type { ReportCounts, ReportKind, ReportWeek, WeeklyReport } from "@/lib/crm/weekly-report-data";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { WeeklyReportChart } from "./WeeklyReportChart";
import { REPORT_KIND_LABELS, WeeklyReportRecords, type ReportSelection } from "./WeeklyReportRecords";

const controlClass = "min-h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-nordic-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700";
const number = (value: number) => value.toLocaleString("sv-SE");
const shortDate = (value: string) => new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const weekLabel = (week: ReportWeek) => `v. ${week.weekNumber}, ${week.year}${week.isCurrent ? " · pågår" : ""}`;

export function WeeklyReportView() {
  const [includeCurrent, setIncludeCurrent] = useState(true);
  const [areaId, setAreaId] = useState("all");
  const [storedWeekId, setStoredWeekId] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "properties" | "requests">("requests");
  const [selection, setSelection] = useState<ReportSelection | null>(null);
  const { data, error, isLoading, isValidating, mutate } = useSWR<WeeklyReport>(
    `/api/crm/weekly-report?includeCurrent=${includeCurrent ? "1" : "0"}`, swrFetcher<WeeklyReport>,
    { refreshInterval: 60000, revalidateOnFocus: true },
  );

  const area = data?.areas.find((item) => item.id === areaId);
  const activeAreaId = area?.id ?? "all";
  const selectedWeek = data?.weeks.find((week) => week.id === storedWeekId) ?? data?.weeks.at(-1);
  const weekIndex = data && selectedWeek ? data.weeks.findIndex((week) => week.id === selectedWeek.id) : -1;
  const counts = data ? (area?.weeks ?? data.weeks) : [];
  const selectedCounts = counts[weekIndex];
  const totals = area?.totals ?? data?.totals;
  const areaRows = data?.areas.filter((item) => activeAreaId === "all" || item.id === activeAreaId)
    .sort((a, b) => (sort === "name" ? 0 : (b.weeks[weekIndex]?.[sort] ?? 0) - (a.weeks[weekIndex]?.[sort] ?? 0)) || a.name.localeCompare(b.name, "sv")) ?? [];
  const openRecords = (kind: ReportKind, weekId: string | null, selectedAreaId = activeAreaId) =>
    setSelection({ kind, weekId, areaId: selectedAreaId });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-nordic-900">Veckorapport</h1>
          <p className="mt-1 text-sm text-nordic-500">Nya boenden och förfrågningar per ort under de senaste 12 veckorna.</p>
        </div>
        <Button variant="outline" className="h-11 shrink-0 gap-2 bg-white" onClick={() => void mutate()} disabled={isValidating} aria-label="Uppdatera veckorapporten">
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isValidating ? "motion-safe:animate-spin" : ""}`} />
          <span className="hidden sm:inline">Uppdatera</span>
        </Button>
      </div>

      <div className="grid items-end gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5 text-sm font-medium text-nordic-800">
          <span className="block">Ort</span>
          <select className={controlClass} value={activeAreaId} onChange={(event) => setAreaId(event.target.value)} disabled={!data}>
            <option value="all">Alla orter</option>
            {data?.areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-nordic-800">
          <span className="block">Vecka för ortstabellen</span>
          <select className={controlClass} value={selectedWeek?.id ?? ""} onChange={(event) => setStoredWeekId(event.target.value)} disabled={!data}>
            {!data && <option value="">Laddar veckor…</option>}
            {data?.weeks.slice().reverse().map((week) => <option key={week.id} value={week.id}>{weekLabel(week)} · {shortDate(week.startDate)}–{shortDate(week.endDate)}</option>)}
          </select>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-nordic-800">
          <input type="checkbox" className="h-5 w-5 accent-nordic-700" checked={includeCurrent} onChange={(event) => { setIncludeCurrent(event.target.checked); setSelection(null); }} />
          Ta med pågående vecka
        </label>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-white p-5">
          <p className="text-sm font-medium text-red-800">Kunde inte hämta veckorapporten.</p>
          <p className="mt-1 text-sm text-red-800">{crmErrorMessage(error)}</p>
          <Button className="mt-3 min-h-11" variant="outline" onClick={() => void mutate()}>Försök igen</Button>
        </div>
      ) : isLoading || !data || !selectedWeek || !selectedCounts || !totals ? (
        <div role="status" className="flex min-h-64 items-center justify-center rounded-xl border bg-white text-sm text-nordic-500">Laddar veckorapporten…</div>
      ) : (
        <>
          <section aria-labelledby="selected-week-title">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="selected-week-title" className="text-lg font-semibold text-nordic-900">{area?.name ?? "Alla orter"} · {weekLabel(selectedWeek)}</h2>
              <p className="text-sm text-nordic-500">{shortDate(selectedWeek.startDate)}–{shortDate(selectedWeek.endDate)}{selectedWeek.isCurrent ? " · hittills denna vecka" : ""}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["properties", "requests", "landlordLeads"] as const).map((kind) => (
                <MetricCard key={kind} kind={kind} value={selectedCounts[kind]} previous={counts[weekIndex - 1]?.[kind]} isCurrent={selectedWeek.isCurrent} onClick={() => openRecords(kind, selectedWeek.id)} />
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4 md:p-5" aria-labelledby="trend-title">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="trend-title" className="text-lg font-semibold text-nordic-900">Jämför 12 veckor</h2>
                <p className="mt-1 text-sm text-nordic-500">{shortDate(data.weeks[0].startDate)} {data.weeks[0].year}–{shortDate(data.weeks.at(-1)!.endDate)} {data.weeks.at(-1)!.year} · {area?.name ?? "alla orter"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-sm text-nordic-800">
                <button type="button" className="min-h-11 cursor-pointer underline decoration-nordic-200 underline-offset-4 hover:decoration-nordic-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700" onClick={() => openRecords("properties", null)}>{number(totals.properties)} boenden totalt</button>
                <button type="button" className="min-h-11 cursor-pointer underline decoration-nordic-200 underline-offset-4 hover:decoration-nordic-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700" onClick={() => openRecords("requests", null)}>{number(totals.requests)} förfrågningar totalt</button>
              </div>
            </div>
            <WeeklyReportChart weeks={data.weeks} counts={counts} selectedWeekId={selectedWeek.id} onSelectWeek={setStoredWeekId} />
            <details className="mt-4 border-t pt-3">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-nordic-800">Visa veckosiffror som tabell</summary>
              <WeekTable weeks={data.weeks} counts={counts} totals={totals} onOpen={openRecords} />
            </details>
          </section>

          <section className="overflow-hidden rounded-xl border bg-white" aria-labelledby="areas-title">
            <div className="p-4 md:p-5">
              <h2 id="areas-title" className="text-lg font-semibold text-nordic-900">Fördelning per ort</h2>
              <p className="mt-1 text-sm text-nordic-500">{weekLabel(selectedWeek)} och hela perioden. Klicka på ett antal för att se posterna.</p>
            </div>
            {areaRows.length === 0 ? <p className="px-5 pb-5 text-sm text-nordic-500">Inga nya boenden, förfrågningar eller uthyrarintressen under perioden.</p> : (
              <table className="w-full table-fixed text-sm">
                <caption className="sr-only">Nya boenden och förfrågningar per ort för vald vecka och de senaste 12 veckorna</caption>
                <thead className="border-y bg-nordic-100 text-nordic-700">
                  <tr>
                    <th rowSpan={2} scope="col" className="w-[28%] px-3 text-left" aria-sort={sort === "name" ? "ascending" : "none"}><button type="button" className="min-h-11 cursor-pointer font-semibold" onClick={() => setSort("name")}>Ort{sort === "name" ? " ↑" : ""}</button></th>
                    <th colSpan={2} scope="colgroup" className="px-1 py-2 text-center font-semibold">v. {selectedWeek.weekNumber}{selectedWeek.isCurrent ? " · pågår" : ""}</th>
                    <th colSpan={2} scope="colgroup" className="px-1 py-2 text-center font-semibold">12 veckor</th>
                  </tr>
                  <tr className="text-xs">
                    <th scope="col" className="px-1 text-center" aria-sort={sort === "properties" ? "descending" : "none"}><button type="button" className="min-h-11 cursor-pointer font-medium" onClick={() => setSort("properties")}>Boenden{sort === "properties" ? " ↓" : ""}</button></th>
                    <th scope="col" className="px-1 text-center" aria-sort={sort === "requests" ? "descending" : "none"}><button type="button" className="min-h-11 cursor-pointer font-medium" onClick={() => setSort("requests")}><abbr title="Förfrågningar" className="no-underline">Förfråg.</abbr>{sort === "requests" ? " ↓" : ""}</button></th>
                    <th scope="col" className="px-1 font-medium">Boenden</th>
                    <th scope="col" className="px-1 font-medium"><abbr title="Förfrågningar" className="no-underline">Förfråg.</abbr></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {areaRows.map((item) => (
                    <tr key={item.id} className="hover:bg-nordic-100/50">
                      <th scope="row" className="break-words px-3 py-2 text-left font-medium text-nordic-900 [overflow-wrap:anywhere]">{item.name}</th>
                      {(["properties", "requests"] as const).map((kind) => <td key={kind} className="text-center"><CountButton value={item.weeks[weekIndex][kind]} label={`${REPORT_KIND_LABELS[kind]}, ${item.name}, vecka ${selectedWeek.weekNumber}`} onClick={() => openRecords(kind, selectedWeek.id, item.id)} /></td>)}
                      {(["properties", "requests"] as const).map((kind) => <td key={kind} className="text-center"><CountButton value={item.totals[kind]} label={`${REPORT_KIND_LABELS[kind]}, ${item.name}, 12 veckor`} onClick={() => openRecords(kind, null, item.id)} /></td>)}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-nordic-100 font-semibold text-nordic-900">
                  <tr>
                    <th scope="row" className="px-3 py-3 text-left">{activeAreaId === "all" ? "Totalt, unika poster" : "Totalt"}</th>
                    <td className="text-center">{number(selectedCounts.properties)}</td><td className="text-center">{number(selectedCounts.requests)}</td>
                    <td className="text-center">{number(totals.properties)}</td><td className="text-center">{number(totals.requests)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
            {data.multiAreaRequests > 0 && <p className="border-t px-4 py-3 text-sm text-nordic-500">Förfrågningar som gäller flera orter visas under varje berörd ort. Totalen räknar varje förfrågan en gång, så ortsradernas summa kan vara högre.</p>}
          </section>

          <details className="rounded-xl border bg-white p-4 text-sm text-nordic-500">
            <summary className="min-h-11 cursor-pointer font-medium text-nordic-800">Så räknas rapporten</summary>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>Varje CRM-post räknas en gång utifrån sitt registreringsdatum. Veckorna går från måndag till söndag i svensk tid. Ändringar och senare avslut flyttar inte posten till en ny vecka.</p>
              <p>Boenden är bostadsposter med adress. Poster utan adress visas separat som uthyrarintressen. Det här mäter inflödet till CRM:et, inte antalet lediga eller publicerade boenden.</p>
              <p>Ortsnamn samlas oavsett stora eller små bokstäver och vanliga namnvarianter, exempelvis Övik/Örnsköldsvik. Poster utan ort visas som ”Saknar område”.</p>
              <p>Historiken bygger på de poster och ortsuppgifter som finns i CRM:et. Äldre importer kan ligga i importveckan om ursprungligt inkomstdatum saknas.</p>
              <p>Avmarkera ”Ta med pågående vecka” för att jämföra 12 avslutade veckor.</p>
            </div>
          </details>
          <p className="text-xs text-nordic-500">Uppdaterad {new Intl.DateTimeFormat("sv-SE", { timeZone: data.timeZone, dateStyle: "short", timeStyle: "short" }).format(new Date(data.generatedAt))} · svensk tid</p>
          <WeeklyReportRecords report={data} selection={selection} onClose={() => setSelection(null)} />
        </>
      )}
    </div>
  );
}

function MetricCard({ kind, value, previous, isCurrent, onClick }: {
  kind: ReportKind; value: number; previous?: number; isCurrent: boolean; onClick: () => void;
}) {
  const difference = previous == null ? null : value - previous;
  return (
    <button type="button" aria-label={`${REPORT_KIND_LABELS[kind]}: ${value}. Visa posterna.`} onClick={onClick} className={`cursor-pointer rounded-xl border border-l-4 bg-white p-4 text-left hover:bg-nordic-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700 ${kind === "properties" ? "border-l-teal-700" : kind === "requests" ? "border-l-blue-700" : "border-l-nordic-400"}`}>
      <span className="block text-sm font-medium text-nordic-700">{REPORT_KIND_LABELS[kind]}</span>
      <span className="mt-1 block text-3xl font-bold tabular-nums text-nordic-900">{number(value)}</span>
      <span className="mt-2 block text-xs text-nordic-500">
        {isCurrent ? `Veckan pågår${previous == null ? "" : ` · förra hela veckan: ${number(previous)}`}`
          : difference == null ? "Klicka för att se posterna" : difference === 0 ? "Samma antal som föregående vecka" : `${number(Math.abs(difference))} ${difference > 0 ? "fler" : "färre"} än föregående vecka`}
      </span>
    </button>
  );
}

function CountButton({ value, label, onClick }: { value: number; label: string; onClick: () => void }) {
  return <button type="button" aria-label={`${label}: ${value}`} onClick={onClick} className="min-h-11 min-w-11 cursor-pointer rounded-md px-1 font-medium tabular-nums text-nordic-800 underline decoration-nordic-200 underline-offset-4 hover:bg-nordic-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700">{number(value)}</button>;
}

function WeekTable({ weeks, counts, totals, onOpen }: {
  weeks: ReportWeek[]; counts: ReportCounts[]; totals: ReportCounts;
  onOpen: (kind: ReportKind, weekId: string | null) => void;
}) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Antal nya boenden, förfrågningar och uthyrarintressen vecka för vecka</caption>
      <thead className="border-b text-xs text-nordic-700"><tr><th scope="col" className="py-2 text-left">Vecka</th><th scope="col">Boenden</th><th scope="col">Förfrågningar</th><th scope="col">Intressen</th></tr></thead>
      <tbody className="divide-y">
        {weeks.map((week, index) => <tr key={week.id}><th scope="row" className="py-2 text-left font-medium text-nordic-800">{weekLabel(week)}</th>{(["properties", "requests", "landlordLeads"] as const).map((kind) => <td key={kind} className="text-center"><CountButton value={counts[index][kind]} label={`${REPORT_KIND_LABELS[kind]}, vecka ${week.weekNumber}`} onClick={() => onOpen(kind, week.id)} /></td>)}</tr>)}
      </tbody>
      <tfoot className="border-t font-semibold text-nordic-900"><tr><th scope="row" className="py-3 text-left">Totalt</th><td className="text-center">{number(totals.properties)}</td><td className="text-center">{number(totals.requests)}</td><td className="text-center">{number(totals.landlordLeads)}</td></tr></tfoot>
    </table>
  );
}
