"use client";

import { PhoneActions } from "@/components/crm/PhoneActions";
import type { Contact, Request } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Mail, MessageSquare, Pencil, Phone, User } from "lucide-react";
import { RequestStatusActions } from "./RequestStatusActions";
import { REQUEST_STATUS_LABEL as STATUS_LABELS } from "@/lib/crm/request-status";
import { hasMoveInContractSent, hasSignedMoveInContract } from "@/lib/crm/move-checklists";
import { formatRequestSearchAreas } from "@/lib/crm/request-search-areas";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { parseWebRequestNote } from "@/lib/crm/request-notes";
import type { ReactNode } from "react";

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
  contact?: Contact | null;
  isActive?: boolean;
  compact?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (request: Request) => void;
  onMatch?: (id: string) => void;
  onStatusChange?: (requestId: string, status: string | null, extra?: Record<string, unknown>) => Promise<void>;
}

export function RequestCard({ request, contact, isActive, compact, onSelect, onEdit, onMatch, onStatusChange }: Props) {
  const colorClass = STATUS_COLORS[request.status] ?? STATUS_COLORS.incoming;
  const searchAreas = formatRequestSearchAreas(request);
  const webNote = parseWebRequestNote(request.notes);
  const contactName = contact?.name ?? null;
  const contactPhone = contact?.phone ?? webNote?.phone ?? null;
  const contactEmail = contact?.email ?? webNote?.email ?? null;
  const noteText = webNote ? webNote.remainingNote : request.notes;
  const showContactPanel = !compact && (
    !!webNote?.message ||
    !!contactName ||
    !!contactPhone ||
    !!contactEmail
  );
  const contractStatus =
    request.status === "won"
      ? hasSignedMoveInContract(request.moveInChecklist)
        ? "Signerat"
        : hasMoveInContractSent(request.moveInChecklist)
          ? "Skickat"
          : "Ej skickat"
      : null;

  if (compact) {
    const summary = [
      [request.street, request.postalCode, request.city].filter(Boolean).join(" ") || request.addressQuery || request.city,
      request.monthlyValue ? `${request.monthlyValue.toLocaleString("sv-SE")} kr` : null,
      contractStatus ? `Avtal: ${contractStatus.toLowerCase()}` : null,
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
          {searchAreas && (
            <div className="col-span-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-amber-800">
                Sökområden
              </span>
              <p className="mt-0.5 text-sm font-medium text-amber-950 whitespace-pre-wrap break-words">
                {searchAreas}
              </p>
            </div>
          )}
          {!searchAreas && <Field label="Ort" value={request.city} />}
          <Field label="Postnummer" value={request.postalCode} />
          <Field label="Gata / plats" value={request.street} />
          {!searchAreas && <Field label="Adressökning" value={request.addressQuery} />}
          {showContactPanel && (
            <ContactPanel
              title={webNote ? "Kontakt från webben" : "Kontakt"}
              source={webNote?.source}
              page={webNote?.page}
              formType={webNote?.formType}
              name={contactName}
              phone={contactPhone}
              email={contactEmail}
              message={webNote?.message}
            />
          )}
          <Field label="Antal" value={request.persons?.toString()} />
          <Field label="Boendetyp" value={request.accommodationType} />
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
          <Field
            label="Krav"
            value={[
              request.parkingRequired ? "parkering" : null,
              request.kitchenRequired ? "kök" : null,
              request.laundryRequired ? "tvätt" : null,
            ].filter(Boolean).join(", ") || undefined}
          />
          <Field label="Projekt-id faktura" value={request.billingProjectId ?? request.requestNumber?.toString()} />
          <Field label="Avtal" value={contractStatus} />
          {request.lostReason && <Field label="Anledning" value={request.lostReason} />}
          {noteText && (
            <div className="col-span-2">
              <Field label={webNote ? "Övrig anteckning" : "Anteckning"} value={noteText} />
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

function ContactPanel({
  title,
  source,
  page,
  formType,
  name,
  phone,
  email,
  message,
}: {
  title: string;
  source?: string | null;
  page?: string | null;
  formType?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
}) {
  const phoneLabel = formatPhoneSv(phone) ?? phone;
  const meta = [source, page, formType].filter(Boolean).join(" · ");

  return (
    <div className="col-span-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-900">
          {title}
        </span>
        {meta && (
          <span className="max-w-full truncate text-[11px] text-sky-800/70">
            {meta}
          </span>
        )}
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {name && (
          <ContactValue icon={<User className="h-3.5 w-3.5" />} label="Namn">
            <span className="break-words text-sm font-semibold text-nordic-900">{name}</span>
          </ContactValue>
        )}
        {phone && (
          <ContactValue icon={<Phone className="h-3.5 w-3.5" />} label="Telefon">
            <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5">
              <a
                href={`tel:${phone}`}
                className="break-words text-sm font-semibold text-nordic-900 underline-offset-2 hover:text-primary-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {phoneLabel}
              </a>
              <PhoneActions phone={phone} />
            </span>
          </ContactValue>
        )}
        {email && (
          <ContactValue icon={<Mail className="h-3.5 w-3.5" />} label="E-post">
            <a
              href={`mailto:${email}`}
              className="break-all text-sm font-semibold text-nordic-900 underline-offset-2 hover:text-primary-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {email}
            </a>
          </ContactValue>
        )}
        {message && (
          <div className="rounded-md border border-sky-100 bg-white px-2.5 py-2 sm:col-span-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-sky-900/70">
              <MessageSquare className="h-3.5 w-3.5" />
              Meddelande
            </span>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-nordic-900">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactValue({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border border-sky-100 bg-white px-2.5 py-2">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-sky-900/70">
        {icon}
        {label}
      </span>
      <div className="mt-0.5 min-w-0">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  const multiline = value.includes("\n");
  if (multiline) {
    return (
      <div>
        <span className="text-xs text-muted-foreground">{label}: </span>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{value}</p>
      </div>
    );
  }

  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}: </span>
      <span className="break-words text-sm">{value}</span>
    </div>
  );
}
