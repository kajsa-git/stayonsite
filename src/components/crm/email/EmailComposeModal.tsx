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
import { useState, useEffect } from "react";

interface ContactOption {
  id: string;
  name?: string | null;
  email: string;
}

interface Props {
  open: boolean;
  defaultTo?: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  contacts?: ContactOption[];
  onClose: () => void;
  onSent: () => void;
}

export function EmailComposeModal({ open, defaultTo, companyId, contactId, ownerId, contacts = [], onClose, onSent }: Props) {
  const [to, setTo] = useState(defaultTo ?? "");
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synka "till"-fältet när man väljer kontakt från pickern
  useEffect(() => {
    if (!open) return;
    setTo(defaultTo ?? "");
    setSelectedContactId(contactId ?? "");
    setSubject("");
    setBody("");
    setError(null);
  }, [open, defaultTo, contactId]);

  function handleSelectContact(c: ContactOption) {
    setTo(c.email);
    setSelectedContactId(c.id);
  }

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body: body.trim(),
          companyId,
          contactId: selectedContactId || contactId,
          ownerId,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error === "resend_error" ? "Kunde inte skicka mejlet. Kontrollera att RESEND_API_KEY är satt i Vercel." : "Fel vid sändning.");
        return;
      }
      onSent();
      onClose();
    } finally {
      setSending(false);
    }
  }

  const hasMultipleContacts = contacts.length > 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !sending && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Skriv mejl</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Kontaktpicker — visas bara om det finns flera kontakter med e-post */}
          {hasMultipleContacts && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Välj kontakt</label>
              <div className="flex flex-wrap gap-1.5">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectContact(c)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      to === c.email
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-input bg-white text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {c.name ? `${c.name}` : c.email}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Till</label>
            <Input
              value={to}
              onChange={(e) => { setTo(e.target.value); setSelectedContactId(""); }}
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
