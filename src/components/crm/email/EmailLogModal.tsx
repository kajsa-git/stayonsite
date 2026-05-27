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
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  onClose: () => void;
  onLogged: () => void;
}

export function EmailLogModal({ open, companyId, contactId, ownerId, onClose, onLogged }: Props) {
  const [direction, setDirection] = useState<"out" | "in">("in");
  const [fromEmail, setFromEmail] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentAt, setSentAt] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!subject.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/crm/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          contactId,
          ownerId,
          direction,
          subject: subject.trim(),
          body: body.trim(),
          fromEmail: fromEmail.trim() || "kajsa@stayonsite.se",
          toEmail: toEmail.trim() || "",
          sentAt: new Date(sentAt).toISOString(),
        }),
      });
      setSubject("");
      setBody("");
      setFromEmail("");
      setToEmail("");
      onLogged();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Logga mejl från Gmail</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["in", "out"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  direction === d
                    ? "border-primary-300 bg-primary-50 text-primary-800"
                    : "border-input bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {d === "in" ? "↓ Inkommande" : "↑ Utgående"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Från</label>
              <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="avsändare@foretag.se" type="email" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Till</label>
              <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="mottagare@stayonsite.se" type="email" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ämne</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ämnesrad" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Meddelande</label>
            <textarea
              className="w-full text-sm border rounded-lg px-3 py-2 min-h-[120px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Klistra in mejlets innehåll…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Datum/tid</label>
            <Input type="datetime-local" value={sentAt} onChange={(e) => setSentAt(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Avbryt</Button>
          <Button onClick={handleSave} disabled={saving || !subject.trim() || !body.trim()}>
            {saving ? "Sparar…" : "Logga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
