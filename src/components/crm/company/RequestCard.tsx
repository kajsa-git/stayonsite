"use client";

import type { Request } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { RequestStatusActions } from "./RequestStatusActions";
import { REQUEST_STATUS_LABEL as STATUS_LABELS } from "@/lib/crm/request-status";

const STATUS_COLORS: Record<string, string> = {
  incoming: "bg-blue-50 border-blue-200 text-blue-800",
  matching: "bg-amber-50 border-amber-200 text-amber-800",
  won: "bg-green-50 border-green-300 text-green-800",
  invoiced: "bg-emerald-50 border-emerald-200 text-emerald-700",
  lost: "bg-red-50 border-red-200 text-red-800",
  archived: "bg-gray-50 border-gray-200 text-gray-500",
};

interface Props {
  request: Request & { matchCount?: number };
  isActive?: boolean;
  compact?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (request: Request) => void;
  onMatch?: (id: string) => void;
  onStatusChange?: (requestId: string, status: string, extra?: Record<string, unknown>) => Promise<void>;
}

export function RequestCard({ request, isActive, compact, onSelect, onEdit, onMatch, onStatusChange }: Props) {
  const colorClass = STATUS_COLORS[request.status] ?? STATUS_COLORS.incoming;

  if (compact) {
    const summary = [
      [request.street, request.postalCode, request.city].filter(Boolean).join(" ") || request.addressQuery || request.city,
      request.monthlyValue ? `${request.monthlyValue.toLocaleString("sv-SE")} kr` : null,
      request.lostReason,
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <div
        onClick={() => onSelect?.(request.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${colorClass} ${
          onSelect ? "cursor-pointer hover:shadow-sm" : ""
        } ${isActive ? "ring-2 ring-offset-1 ring-nordic-900" : ""}`}
      >
        <span className="font-mono font-bold shrink-0">#{request.requestNumber}</span>
        <span className="font-semibold shrink-0">{STATUS_LABELS[request.status]}</span>
        {summary && <span className="opacity-70 truncate">{summary}</span>}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(request);
            }}
            className="ml-auto h-5 w-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors shrink-0"
            title="Redigera förfrågan"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(request.id)}
      className={`rounded-xl border-2 overflow-hidden transition-all ${
        onSelect ? "cursor-pointer hover:shadow-md" : ""
      } ${isActive ? "ring-2 ring-offset-2 ring-nordic-900 shadow-md" : "opacity-90 hover:opacity-100"}`}
    >
      <div className={`px-4 py-2 flex items-center justify-between ${colorClass}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold">#{request.requestNumber}</span>
          <span className="text-xs font-semibold">{STATUS_LABELS[request.status]}</span>
          {isActive && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-nordic-900 text-white px-1.5 py-0.5 rounded">
              Vald
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">
            {request.createdAt
              ? format(new Date(request.createdAt), "d MMM yyyy", { locale: sv })
              : ""}
          </span>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(request);
              }}
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
              title="Redigera förfrågan"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="bg-white px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <Field label="Ort" value={request.city} />
          <Field label="Postnummer" value={request.postalCode} />
          <Field label="Gata / plats" value={request.street} />
          <Field label="Adressökning" value={request.addressQuery} />
          <Field label="Antal" value={request.persons?.toString()} />
          <Field
            label="Sovrum"
            value={
              request.bedroomsFrom || request.bedroomsTo
                ? `${request.bedroomsFrom ?? "?"}–${request.bedroomsTo ?? "?"}`
                : undefined
            }
          />
          <Field
            label="Bäddar"
            value={
              request.bedsFrom || request.bedsTo
                ? `${request.bedsFrom ?? "?"}–${request.bedsTo ?? "?"}`
                : undefined
            }
          />
          <Field
            label="Period"
            value={
              request.startDate
                ? `${request.startDate}${request.endDate ? ` → ${request.endDate}` : ""}`
                : undefined
            }
          />
          <Field
            label="Projekttid"
            value={request.projectDurationMonths ? `${request.projectDurationMonths} mån` : undefined}
          />
          <Field
            label="Budget"
            value={
              request.budgetMax
                ? `${request.budgetMax.toLocaleString("sv-SE")} kr/mån`
                : undefined
            }
          />
          <Field label="Projekt-id faktura" value={request.billingProjectId ?? request.requestNumber?.toString()} />
          {request.lostReason && <Field label="Anledning" value={request.lostReason} />}
          {request.notes && (
            <div className="col-span-2">
              <Field label="Anteckning" value={request.notes} />
            </div>
          )}
        </div>
        {onStatusChange && onMatch && (
          <RequestStatusActions request={request} onStatusChange={onStatusChange} onMatch={onMatch} />
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
