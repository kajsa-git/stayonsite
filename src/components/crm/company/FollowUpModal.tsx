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
  onClose: () => void;
  onSave: (date: string, reason: string) => Promise<void>;
}

export function FollowUpModal({ open, initialDate, initialReason, onClose, onSave }: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(initialDate ? new Date(initialDate) : undefined);
    setReason(initialReason ?? "");
  }, [open, initialDate, initialReason]);

  async function save() {
    if (!date) return;
    setBusy(true);
    await onSave(format(date, "yyyy-MM-dd"), reason);
    setBusy(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Återkom — välj datum</DialogTitle>
        </DialogHeader>
        <Calendar mode="single" selected={date} onSelect={setDate} locale={sv} className="rounded-md border mx-auto" />
        <div className="space-y-1">
          <Label htmlFor="reason">Anledning (valfri)</Label>
          <Input
            id="reason"
            placeholder="T.ex. väntar på beslut, kvartalsbyte…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Avbryt</Button>
          <Button onClick={save} disabled={!date || busy}>Spara återkomst</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
