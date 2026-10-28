"use client";

import { Button } from "@/components/ui/button";
import type { Contact, Request } from "@/lib/crm/schema";
import { REQUEST_STATUS_LABEL } from "@/lib/crm/request-status";
import { Plus } from "lucide-react";
import { RequestCard } from "./RequestCard";

interface Props {
  requests: (Request & { matchCount?: number })[];
  contacts?: Contact[];
  companyId: string;
  activeRequestId?: string | null;
  focusOnly?: boolean;
  chooseOnly?: boolean;
  onNewRequest: () => void;
  onEditRequest?: (request: Request) => void;
  onSelectRequest?: (id: string) => void;
  onMatch?: (id: string) => void;
  onStatusChange?: (requestId: string, status: string | null, extra?: Record<string, unknown>) => Promise<void>;
}

const OPEN_STATUSES = ["incoming", "matching", "won"];

export function RequestsList({ requests, contacts = [], companyId, activeRequestId, focusOnly, chooseOnly, onNewRequest, onEditRequest, onSelectRequest, onMatch, onStatusChange }: Props) {
  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );
  const open = sorted.filter((r) => OPEN_STATUSES.includes(r.status));
  const closed = sorted.filter((r) => !OPEN_STATUSES.includes(r.status));
  const focused = focusOnly ? open.find((r) => r.id === activeRequestId) : null;
  const choosing = !!focusOnly && open.length > 1 && (!!chooseOnly || !focused);
  const visibleOpen = choosing ? [] : focused ? [focused] : open;
  const otherOpen = !choosing && focused ? open.filter((r) => r.id !== focused.id) : [];
  const primaryContact = contacts.find((c) => c.isPrimary) ?? contacts[0] ?? null;
  const contactsById = new Map(contacts.map((c) => [c.id, c]));

  function renderCard(r: Request & { matchCount?: number }, compact = false) {
    const requestContact = r.contactId ? contactsById.get(r.contactId) ?? primaryContact : primaryContact;

    return (
      <RequestCard
        key={r.id}
        request={r}
        contact={requestContact}
        compact={compact}
        isActive={r.id === activeRequestId}
        onSelect={onSelectRequest}
        onEdit={onEditRequest}
        onMatch={onMatch}
        onStatusChange={onStatusChange}
      />
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Förfrågningar ({requests.length})
        </span>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={onNewRequest}>
          <Plus className="h-3 w-3" /> Ny förfrågan
        </Button>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Inga förfrågningar ännu.</p>
      ) : (
        <div className="space-y-3">
          {choosing && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Välj förfrågan att arbeta med</p>
              {open.map((request) => (
                <button key={request.id} type="button" onClick={() => onSelectRequest?.(request.id)} className="rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-muted">
                  {request.requestNumber != null ? `#${request.requestNumber} · ` : ""}{request.city ? `${request.city} · ` : ""}{REQUEST_STATUS_LABEL[request.status] ?? request.status}
                </button>
              ))}
            </div>
          )}
          {visibleOpen.map((r) => renderCard(r))}

          {otherOpen.length > 0 && (
            <details>
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Visa övriga förfrågningar ({otherOpen.length})</summary>
              <div className="mt-2 flex flex-col gap-3">{otherOpen.map((r) => renderCard(r))}</div>
            </details>
          )}

          {open.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Inga aktiva förfrågningar.</p>
          )}

          {closed.length > 0 && (focusOnly ? (
            <details>
              <summary className="cursor-pointer text-xs text-muted-foreground">Avslutade ({closed.length})</summary>
              <div className="mt-2 flex flex-col gap-2">{closed.map((r) => renderCard(r, true))}</div>
            </details>
          ) : (
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avslutade ({closed.length})</span>
              {closed.map((r) => renderCard(r, true))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
