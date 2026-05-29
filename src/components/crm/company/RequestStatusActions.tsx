"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Request } from "@/lib/crm/schema";
import { hasValidInvoiceDates } from "@/lib/crm/move-checklists";
import { Archive, Home, Receipt, X } from "lucide-react";
import { useState } from "react";

const LOST_REASONS = [
  "För dyrt",
  "Ej passande bostad",
  "Hittade bättre objekt",
  "Övrigt",
];

interface Props {
  request: Request & { matchCount?: number };
  onStatusChange: (requestId: string, status: string, extra?: Record<string, unknown>) => Promise<void>;
  onMatch: (requestId: string) => void;
}

export function RequestStatusActions({ request, onStatusChange, onMatch }: Props) {
  const [modal, setModal] = useState<"lost" | "archive" | "invoice" | null>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [busy, setBusy] = useState(false);

  // Fakturera-modalen: tvinga fram inflytt/utflytt (eller löpande) innan fakturering.
  const [startDate, setStartDate] = useState(request.startDate ?? "");
  const [endDate, setEndDate] = useState(request.endDate ?? "");
  const [ongoing, setOngoing] = useState(!!request.endDateOngoing);
  const invoiceDatesValid = hasValidInvoiceDates({ startDate, endDate, endDateOngoing: ongoing });

  const isIncoming = request.status === "incoming";
  const isMatching = request.status === "matching";
  const isWon = request.status === "won";
  if (!isIncoming && !isMatching && !isWon) return null;

  const wonMissingDates = isWon && !hasValidInvoiceDates(request);

  async function run(status: string, extra?: Record<string, unknown>) {
    setBusy(true);
    try {
      await onStatusChange(request.id, status, extra);
      setModal(null);
    } catch {
      // Felet har redan visats som toast av anroparen; håll modalen öppen.
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors";

  return (
    <div onClick={(e) => e.stopPropagation()} className="mt-3">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
        Åtgärder
      </p>
      <div className="flex flex-wrap gap-2">
        {(isIncoming || isMatching) && (
          <button
            className={`${btn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
            onClick={() => onMatch(request.id)}
          >
            <Home className="h-3.5 w-3.5" />
            {request.matchCount ? `Se ${request.matchCount} förslag` : "Leta boenden"}
          </button>
        )}

        {isWon && (
          <button
            className={`${btn} border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100`}
            onClick={() => {
              setStartDate(request.startDate ?? "");
              setEndDate(request.endDate ?? "");
              setOngoing(!!request.endDateOngoing);
              setModal("invoice");
            }}
            disabled={busy}
          >
            <Receipt className="h-3.5 w-3.5" />
            Markera fakturerad
          </button>
        )}

        {(isIncoming || isMatching) && (
          <button
            className={`${btn} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
            onClick={() => setModal("lost")}
          >
            <X className="h-3.5 w-3.5" />
            Nej tack
          </button>
        )}

        <button
          className={`${btn} border-input bg-white text-muted-foreground hover:bg-muted`}
          onClick={() => setModal("archive")}
        >
          <Archive className="h-3.5 w-3.5" />
          Arkivera
        </button>
      </div>

      {/* Mjuk varning vid Vunnen: påminn om datum (blockerar inte förrän fakturering) */}
      {wonMissingDates && (
        <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Saknar inflytt-/utflyttsdatum — fyll i innan fakturering (krävs då).
        </p>
      )}

      {/* Markera fakturerad → kräver datum */}
      <Dialog open={modal === "invoice"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fakturera förfrågan #{request.requestNumber}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ange uppdragets period innan fakturering. Detta driver in- och avflyttningslistan.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Inflytt (startdatum)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Utflytt (slutdatum)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={ongoing}
                className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-muted disabled:text-muted-foreground"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} />
            Löpande (tills vidare — inget bestämt slutdatum)
          </label>
          {!invoiceDatesValid && (
            <p className="text-[11px] text-amber-700">
              Startdatum krävs, samt slutdatum eller "löpande".
            </p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModal(null)}>Avbryt</Button>
            <Button
              onClick={() =>
                run("invoiced", {
                  startDate: startDate || null,
                  endDate: ongoing ? null : endDate || null,
                  endDateOngoing: ongoing,
                })
              }
              disabled={busy || !invoiceDatesValid}
            >
              <Receipt className="h-3.5 w-3.5 mr-1.5" />
              Markera fakturerad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nej tack → lost */}
      <Dialog open={modal === "lost"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nej tack — vad var anledningen?</DialogTitle>
          </DialogHeader>
          <Select value={lostReason} onValueChange={setLostReason}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOST_REASONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModal(null)}>Avbryt</Button>
            <Button variant="destructive" onClick={() => run("lost", { lostReason })} disabled={busy}>
              Markera förlorad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Arkivera → archived */}
      <Dialog open={modal === "archive"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arkivera förfrågan #{request.requestNumber}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Förfrågan döljs från aktiva listor. Används för spöken eller dubletter.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModal(null)}>Avbryt</Button>
            <Button onClick={() => run("archived")} disabled={busy}>Arkivera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
