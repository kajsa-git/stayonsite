"use client";

// Uthyrarens kontaktlogg direkt från förslagskortet — läs tidigare kontakt och
// logga ny (telefon/SMS/mejl) utan att lämna matchningsvyn. Samma logg som på
// objektkortet (crm_property_notes via /api/crm/properties/[id]/notes).

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { useState } from "react";
import useSWR from "swr";

interface Note {
  id: string;
  channel: string;
  content: string;
  createdAt: string | null;
}

const CHANNELS = ["Telefon", "SMS", "Mejl", "Övrigt"];

export function LandlordLogDialog({
  propertyId,
  propertyAddress,
  ownerName,
  ownerPhone,
  onClose,
}: {
  propertyId: string | null;
  propertyAddress?: string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  onClose: () => void;
}) {
  const { data: notes = [], mutate } = useSWR<Note[]>(
    propertyId ? `/api/crm/properties/${propertyId}/notes` : null,
    swrFetcher
  );
  const [channel, setChannel] = useState("Telefon");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!propertyId || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/properties/${propertyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channel.toLowerCase(), content: content.trim() }),
      });
      if (!res.ok) {
        toast({ title: "Kunde inte spara anteckningen", variant: "destructive" });
        return;
      }
      setContent("");
      mutate();
      toast({ title: "Kontakt loggad" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!propertyId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kontaktlogg — {ownerName ?? "uthyrare"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          {[propertyAddress, ownerPhone ? formatPhoneSv(ownerPhone) : null].filter(Boolean).join(" · ")}
        </p>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  channel === c
                    ? "border-primary-300 bg-primary-50 text-primary-800"
                    : "border-input bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Vad sas? T.ex. 'Ringde om visning — återkommer imorgon'"
            rows={2}
          />
          <Button onClick={addNote} disabled={saving || !content.trim()} size="sm">
            {saving ? "Sparar…" : "Logga kontakt"}
          </Button>
        </div>

        <div className="space-y-2 border-t pt-3">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Ingen kontakt loggad ännu.</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="text-sm">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {(n.createdAt ?? "").slice(0, 16)} · {n.channel}
                </span>
                <p className="text-nordic-800">{n.content}</p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
