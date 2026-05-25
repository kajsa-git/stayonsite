"use client";

import { Badge } from "@/components/ui/badge";
import type { Request } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  incoming: "Inkommen",
  matching: "Matchar",
  invoiced: "Fakturerad",
  lost: "Nej tack",
  archived: "Arkiverad",
};

const STATUS_COLORS: Record<string, string> = {
  incoming: "bg-blue-50 border-blue-200 text-blue-800",
  matching: "bg-amber-50 border-amber-200 text-amber-800",
  invoiced: "bg-green-50 border-green-200 text-green-800",
  lost: "bg-red-50 border-red-200 text-red-800",
  archived: "bg-gray-50 border-gray-200 text-gray-500",
};

interface Props {
  request: Request;
  isActive?: boolean;
}

export function RequestCard({ request, isActive }: Props) {
  const colorClass = STATUS_COLORS[request.status] ?? STATUS_COLORS.incoming;

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden ${isActive ? "ring-2 ring-primary-500" : ""}`}
    >
      <div className={`px-4 py-2 flex items-center justify-between ${colorClass}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold">#{request.requestNumber}</span>
          <span className="text-xs font-semibold">{STATUS_LABELS[request.status]}</span>
        </div>
        <span className="text-xs">
          {request.createdAt
            ? format(new Date(request.createdAt), "d MMM yyyy", { locale: sv })
            : ""}
        </span>
      </div>
      <div className="bg-white px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <Field label="Ort" value={request.city} />
        <Field label="Antal" value={request.persons?.toString()} />
        <Field
          label="Period"
          value={
            request.startDate
              ? `${request.startDate}${request.endDate ? ` → ${request.endDate}` : ""}`
              : undefined
          }
        />
        <Field
          label="Månadsv."
          value={
            request.monthlyValue
              ? `${request.monthlyValue.toLocaleString("sv-SE")} kr`
              : undefined
          }
        />
        {request.lostReason && <Field label="Anledning" value={request.lostReason} />}
        {request.notes && (
          <div className="col-span-2">
            <Field label="Anteckning" value={request.notes} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}: </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
