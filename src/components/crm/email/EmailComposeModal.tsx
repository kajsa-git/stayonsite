"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Props {
  open: boolean;
  defaultTo?: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  onClose: () => void;
  onSent: () => void;
}

export function EmailComposeModal({ open, defaultTo, companyId, contactId, ownerId, onClose, onSent }: Props) {
  const [to, setTo] = useState(defaultTo ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: to.trim(), subject: subject.trim(), body: body.trim(), companyId, contactId, ownerId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error === "resend_error" ? "Kunde inte skicka mejlet. Kontrollera att RESEND_API_KEY är satt i Vercel." : "Fel vid sändning.");
        return;
      }
      setTo(defaultTo ?? "");
      setSubject("");
      setBody("");
      onSent();
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !sending && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Skriv mejl</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Till</label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="kontakt@foretag.se"
              type="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ämne</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ämnesrad"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Meddelande</label>
            <textarea
              className="w-full text-sm border rounded-lg px-3 py-2 min-h-[140px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Skriv ditt meddelande…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={sending}>Avbryt</Button>
          <Button onClick={handleSend} disabled={sending || !to.trim() || !subject.trim() || !body.trim()}>
            {sending ? "Skickar…" : "Skicka"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
