"use client";

import type { ReportCounts, ReportWeek } from "@/lib/crm/weekly-report-data";

export function WeeklyReportChart({ weeks, counts, selectedWeekId, onSelectWeek }: {
  weeks: ReportWeek[];
  counts: ReportCounts[];
  selectedWeekId: string;
  onSelectWeek: (id: string) => void;
}) {
  const maximum = Math.max(1, ...counts.flatMap((count) => [count.properties, count.requests]));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-nordic-800">
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-teal-700" />Boenden (vänster stapel)</span>
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-blue-700" />Förfrågningar (höger stapel)</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-12" role="group" aria-label="Välj vecka i diagrammet">
        {weeks.map((week, index) => {
          const count = counts[index];
          const selected = selectedWeekId === week.id;
          return (
            <button
              key={week.id}
              type="button"
              aria-pressed={selected}
              aria-label={`Vecka ${week.weekNumber}, ${week.year}: ${count.properties} boenden och ${count.requests} förfrågningar${week.isCurrent ? ", pågående vecka" : ""}`}
              onClick={() => onSelectWeek(week.id)}
              className={`min-w-0 cursor-pointer rounded-lg border px-1 pb-2 pt-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700 focus-visible:ring-offset-2 ${selected ? "border-nordic-700 bg-nordic-100" : "border-transparent hover:border-nordic-200 hover:bg-nordic-100"}`}
            >
              <span aria-hidden="true" className="flex h-36 items-end justify-center gap-1.5">
                <ChartBar value={count.properties} maximum={maximum} color="bg-teal-700" />
                <ChartBar value={count.requests} maximum={maximum} color="bg-blue-700" />
              </span>
              <span aria-hidden="true" className="mt-2 block text-xs font-semibold text-nordic-900">v. {week.weekNumber}</span>
              <span aria-hidden="true" className="block text-xs text-nordic-500">{week.year}</span>
              <span aria-hidden="true" className={`mt-1 block min-h-4 text-[11px] ${week.isCurrent ? "font-semibold text-blue-800" : "text-nordic-500"}`}>
                {week.isCurrent ? "Pågår" : selected ? "Vald" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-nordic-500">Klicka på en vecka för att se fördelningen per ort. Alla staplar använder samma skala.</p>
    </div>
  );
}

function ChartBar({ value, maximum, color }: { value: number; maximum: number; color: string }) {
  return (
    <span className="flex w-5 max-w-[40%] flex-col items-center justify-end">
      <span className="mb-1 text-xs font-medium tabular-nums text-nordic-800">{value}</span>
      <span className={`block w-full rounded-t-sm ${color}`} style={{ height: `${(value / maximum) * 116}px` }} />
    </span>
  );
}
