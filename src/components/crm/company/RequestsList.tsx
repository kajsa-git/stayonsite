"use client";

import { Button } from "@/components/ui/button";
import type { Request } from "@/lib/crm/schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { RequestCard } from "./RequestCard";

interface Props {
  requests: Request[];
  companyId: string;
  activeRequestId?: string | null;
  onNewRequest: () => void;
}

const ACTIVE_STATUSES = ["incoming", "matching"];

export function RequestsList({ requests, companyId, activeRequestId, onNewRequest }: Props) {
  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const activeRequest = sorted.find(
    (r) => r.id === activeRequestId || ACTIVE_STATUSES.includes(r.status)
  );

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
          {sorted.map((r) => (
            <RequestCard key={r.id} request={r} isActive={r.id === activeRequest?.id} />
          ))}
        </div>
      )}
    </div>
  );
}
