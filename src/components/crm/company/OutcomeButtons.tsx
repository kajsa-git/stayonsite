"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Request } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { useState } from "react";

const LOST_REASONS = [
  "För dyrt",
  "Hittade boende själv",
  "Projektet skjuts upp",
  "Projektet avbröt",
  "Kontakt förlorad",
  "Valde konkurrent",
  "Övrigt",
];

interface Props {
  activeRequest: Request | null;
  companyId: string;
  onStatusChange: (requestId: string, status: string, extra?: Record<string, unknown>) => Promise<void>;
  onFollowUp: (date: string, reason: string) => Promise<void>;
  onNavigateToMatching: (requestId: string) => void;
}

export function OutcomeButtons({
  activeRequest,
  companyId,
  onStatusChange,
  onFollowUp,
  onNavigateToMatching,
}: Props) {
  const [modal, setModal] = useState<"followup" | "invoice" | "lost" | null>(null);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [followUpReason, setFollowUpReason] = useState("");
  const [monthlyValue, setMonthlyValue] = useState("");
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);

  const disabled = !activeRequest;

  async function handleFollowUp() {
    if (!followUpDate) return;
    await onFollowUp(format(followUpDate, "yyyy-MM-dd"), followUpReason);
    setModal(null);
    setFollowUpDate(undefined);
    setFollowUpReason("");
  }

  async function handleInvoice() {
    if (!activeRequest) return;
    await onStatusChange(activeRequest.id, "invoiced", {
      monthlyValue: parseFloat(monthlyValue) || undefined,
    });
    setModal(null);
    setMonthlyValue("");
  }

  async function handleLost() {
    if (!activeRequest) return;
    await onStatusChange(activeRequest.id, "lost", { lostReason });
    setModal(null);
  }

  async function handleArchive() {
    if (!activeRequest) return;
    await onStatusChange(activeRequest.id, "archived");
  }

  const BTN = "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold rounded-xl transition-all";

  return (
    <>
      <div className="flex gap-2 mt-4">
        <button
          className={`${BTN} bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          disabled={disabled}
          onClick={() => activeRequest && onNavigateToMatching(activeRequest.id)}
          title="F1"
        >
          <span className="text-lg">🏠</span>
          <span>F1 Matcha</span>
        </button>
        <button
          className={`${BTN} bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200`}
          onClick={() => setModal("followup")}
          title="F2"
        >
          <span className="text-lg">📅</span>
          <span>F2 Återkom</span>
        </button>
        <button
          className={`${BTN} bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          disabled={disabled}
          onClick={() => setModal("invoice")}
          title="F3"
        >
          <span className="text-lg">✅</span>
          <span>F3 Fakturerad</span>
        </button>
        <button
          className={`${BTN} bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          disabled={disabled}
          onClick={() => setModal("lost")}
          title="F4"
        >
          <span className="text-lg">❌</span>
          <span>F4 Nej tack</span>
        </button>
        <button
          className={`${BTN} bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          disabled={disabled}
          onClick={handleArchive}
          title="F5"
        >
          <span className="text-lg">📦</span>
          <span>F5 Arkivera</span>
        </button>
      </div>

      {/* F2 Follow-up modal */}
      <Dialog open={modal === "followup"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Återkom — välj datum</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={followUpDate}
            onSelect={setFollowUpDate}
            locale={sv}
            className="rounded-md border mx-auto"
          />
          <div className="space-y-1">
            <Label htmlFor="reason">Anledning (valfri)</Label>
            <Input
              id="reason"
              placeholder="T.ex. väntar på beslut, kvartalsbyte…"
              value={followUpReason}
              onChange={(e) => setFollowUpReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModal(null)}>Avbryt</Button>
            <Button onClick={handleFollowUp} disabled={!followUpDate}>Spara</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* F3 Invoice modal */}
      <Dialog open={modal === "invoice"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Markera som fakturerad</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="monthly">Månadsersättning (kr)</Label>
            <Input
              id="monthly"
              type="number"
              placeholder="T.ex. 14500"
              value={monthlyValue}
              onChange={(e) => setMonthlyValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModal(null)}>Avbryt</Button>
            <Button onClick={handleInvoice}>Fakturerad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* F4 Lost modal */}
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
            <Button variant="destructive" onClick={handleLost}>Markera som förlorad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
