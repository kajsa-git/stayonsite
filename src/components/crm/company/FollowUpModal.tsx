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
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  initialDate?: string | null;
  initialReason?: string | null;
  initialTime?: string | null;
  onClose: () => void;
  onSave: (date: string, reason: string, time: string) => Promise<void>;
}

// Snabbval för manuella återkomster — de automatiska flödena (webbförfrågan,
// skickat erbjudande) sätter sina skäl programmatiskt och går inte via modalen.
const REASON_SUGGESTIONS = [
  "Väntar svar på erbjudande",
  "Väntar besked från beställaren",
  "Ringa upp",
  "Kolla kommande behov",
];

export function FollowUpModal({ open, initialDate, initialReason, initialTime, onClose, onSave }: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [reason, setReason] = useState("");
  const [time, setTime] = useState("08:00");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(initialDate ? new Date(initialDate) : undefined);
    setReason(initialReason ?? "");
    setTime(initialTime || "08:00");
  }, [open, initialDate, initialReason, initialTime]);

  // Skäl är obligatoriskt: en återkomst utan "varför" är bara ett datum —
  // kön ska säga vad som ska göras när dagen kommer.
  const canSave = !!date && reason.trim().length > 0;

  async function save() {
    if (!canSave) return;
    setBusy(true);
    await onSave(format(date!, "yyyy-MM-dd"), reason.trim(), time);
    setBusy(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/* max-h + scroll: kalender + skälfält ska funka på små mobilskärmar */}
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Återkomst — datum och skäl</DialogTitle>
        </DialogHeader>
        <Calendar mode="single" selected={date} onSelect={setDate} locale={sv} className="rounded-md border mx-auto" />
        <div className="space-y-1">
          <Label htmlFor="time">Klockslag</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="followup-reason">Skäl till återkomsten *</Label>
          <div className="flex flex-wrap gap-1.5">
            {REASON_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReason(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  reason === s
                    ? "border-amber-400 bg-amber-100 text-amber-900"
                    : "border-input bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Input
            id="followup-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="T.ex. 'Väntar besked om projektstart'"
            className="min-h-11"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Avbryt</Button>
          <Button onClick={save} disabled={!canSave || busy} title={!canSave ? "Välj datum och ange skäl" : undefined}>
            Spara återkomst
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
