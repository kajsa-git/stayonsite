"use client";

import { Button } from "@/components/ui/button";
import type { Contact, Request } from "@/lib/crm/schema";
import { Plus } from "lucide-react";
import { RequestCard } from "./RequestCard";

interface Props {
  requests: (Request & { matchCount?: number })[];
  contacts?: Contact[];
  companyId: string;
  activeRequestId?: string | null;
  onNewRequest: () => void;
  onEditRequest?: (request: Request) => void;
  onSelectRequest?: (id: string) => void;
  onMatch?: (id: string) => void;
  onStatusChange?: (requestId: string, status: string | null, extra?: Record<string, unknown>) => Promise<void>;
}

const OPEN_STATUSES = ["incoming", "matching", "won"];

export function RequestsList({ requests, contacts = [], companyId, activeRequestId, onNewRequest, onEditRequest, onSelectRequest, onMatch, onStatusChange }: Props) {
  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );
  const open = sorted.filter((r) => OPEN_STATUSES.includes(r.status));
  const closed = sorted.filter((r) => !OPEN_STATUSES.includes(r.status));
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
          {open.map((r) => renderCard(r))}

          {open.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Inga aktiva förfrågningar.</p>
          )}

          {closed.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Avslutade ({closed.length})
              </span>
              {closed.map((r) => renderCard(r, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
