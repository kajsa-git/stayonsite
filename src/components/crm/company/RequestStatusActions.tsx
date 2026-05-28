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
  const [modal, setModal] = useState<"lost" | "archive" | null>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [busy, setBusy] = useState(false);

  const isIncoming = request.status === "incoming";
  const isMatching = request.status === "matching";
  const isWon = request.status === "won";
  if (!isIncoming && !isMatching && !isWon) return null;

  async function run(status: string, extra?: Record<string, unknown>) {
    setBusy(true);
    await onStatusChange(request.id, status, extra);
    setBusy(false);
    setModal(null);
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
            onClick={() => run("invoiced")}
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
