"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/crm/fetcher";
import { REQUEST_STATUS_LABEL as STATUS_LABEL } from "@/lib/crm/request-status";
import { landlordMatchStatusText, type LandlordMatchStatus } from "@/lib/crm/landlord-match-status";

interface OpenRequest {
  id: string;
  requestNumber: number | null;
  companyId: string;
  companyName: string;
  city: string | null;
  status: string;
  persons: number | null;
  budgetMax: number | null;
}

const fetcher = swrFetcher;

export function MatchToRequestModal({
  propertyId,
  propertyAddress,
  open,
  onClose,
}: {
  propertyId: string;
  propertyAddress: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const { data: requests = [] } = useSWR<OpenRequest[]>(
    open ? `/api/crm/open-requests?q=${encodeURIComponent(q)}` : null,
    fetcher
  );

  async function match(requestId: string) {
    setBusyId(requestId);
    try {
      const res = await fetch("/api/crm/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, propertyId }),
      });
      if (res.ok) {
        const result = await res.json() as { landlordNotification: LandlordMatchStatus };
        setMatched((s) => new Set(s).add(requestId));
        setMessages((s) => ({ ...s, [requestId]: landlordMatchStatusText(result.landlordNotification) }));
      } else if (res.status === 409) {
        setMatched((s) => new Set(s).add(requestId));
        setMessages((s) => ({ ...s, [requestId]: "Redan matchad – se matchningsvyn för utskicksstatus." }));
      } else {
        setMessages((s) => ({ ...s, [requestId]: "Kunde inte matcha bostaden." }));
      }
    } catch {
      setMessages((s) => ({ ...s, [requestId]: "Kunde inte kontrollera resultatet. Se matchningsvyn innan du försöker igen." }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Matcha {propertyAddress ?? "bostaden"} mot förfrågan</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">När du matchar skickas mejl och sms till husägaren med företagets behov. Uppgifter som saknas anges som inte angivna.</p>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Sök företag eller ort…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Inga utestående förfrågningar.</p>
          ) : (
            requests.map((r) => {
              const done = matched.has(r.id);
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 border rounded-lg p-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      #{r.requestNumber} {r.companyName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {[
                        STATUS_LABEL[r.status] ?? r.status,
                        r.city,
                        r.persons && `${r.persons} pers.`,
                        r.budgetMax && `≤ ${r.budgetMax.toLocaleString("sv-SE")} kr`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {messages[r.id] && <p className="mt-1 text-xs" role="status">{messages[r.id]}</p>}
                  </div>
                  <button
                    onClick={() => match(r.id)}
                    disabled={done || busyId === r.id}
                    className={`text-xs px-2.5 py-1.5 rounded-md border shrink-0 transition-colors ${
                      done
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {done ? (
                      <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Matchad</span>
                    ) : busyId === r.id ? (
                      "…"
                    ) : (
                      "Matcha"
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
