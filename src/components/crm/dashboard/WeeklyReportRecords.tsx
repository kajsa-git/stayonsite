"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReportKind, WeeklyReport } from "@/lib/crm/weekly-report-data";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface ReportSelection {
  kind: ReportKind;
  weekId: string | null;
  areaId: string;
}

export const REPORT_KIND_LABELS: Record<ReportKind, string> = {
  properties: "Nya boenden",
  requests: "Nya förfrågningar",
  landlordLeads: "Uthyrarintressen utan adress",
};

export function WeeklyReportRecords({ report, selection, onClose }: {
  report: WeeklyReport;
  selection: ReportSelection | null;
  onClose: () => void;
}) {
  if (!selection) return null;
  const records = report.records.filter((record) => record.kind === selection.kind
    && (!selection.weekId || record.weekId === selection.weekId)
    && (selection.areaId === "all" || record.areaIds.includes(selection.areaId)));
  const week = report.weeks.find((item) => item.id === selection.weekId);
  const area = report.areas.find((item) => item.id === selection.areaId)?.name ?? "Alla orter";
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{REPORT_KIND_LABELS[selection.kind]}: {records.length}</DialogTitle>
          <DialogDescription>
            {area} · {week ? `vecka ${week.weekNumber}, ${week.year}` : "hela perioden, 12 veckor"}. Klicka på en post för att öppna den i CRM:et.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {records.length === 0 ? <p className="py-6 text-sm text-nordic-500">Inga poster för det här urvalet.</p> : (
            <ul className="divide-y">
              {records.map((record) => (
                <li key={`${record.kind}:${record.id}`}>
                  <Link href={record.href} className="flex min-h-14 items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-nordic-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nordic-700">
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-medium text-nordic-900">{record.title}</span>
                      <span className="mt-1 block text-xs text-nordic-500">Registrerad {record.registeredDate} · {record.areaNames.join(", ")}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-nordic-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
