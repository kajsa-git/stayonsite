"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { crmFetchJson, crmErrorMessage, swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv, normalizePhoneE164 } from "@/lib/crm/phone-links";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

type OutboxMessage = {
  id: string;
  body: string;
  status: "queued" | "sending" | "sent" | "failed";
  error: string | null;
  createdAt: string | null;
};

const STATUS_LABEL: Record<OutboxMessage["status"], { label: string; cls: string }> = {
  queued: { label: "Köad", cls: "bg-amber-100 text-amber-800" },
  sending: { label: "Skickas…", cls: "bg-blue-100 text-blue-800" },
  sent: { label: "Skickad", cls: "bg-green-100 text-green-800" },
  failed: { label: "Misslyckades", cls: "bg-red-100 text-red-800" },
};

// Köar ett iMessage/SMS i CRM:ts utkorg — Mac-agenten skickar via Messages.app
// inom ~30 s. Visar även de senaste meddelandena till numret med status.
export function SendMessageDialog({
  phone,
  ownerId,
  open,
  onOpenChange,
}: {
  phone: string;
  ownerId?: string; // kopplar utskicket till uthyraren i historik/tidslinje
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const e164 = normalizePhoneE164(phone);

  const { data: history = [], mutate } = useSWR<OutboxMessage[]>(
    open && e164 ? `/api/crm/messages?phone=${encodeURIComponent(e164)}` : null,
    swrFetcher,
    { refreshInterval: open ? 10_000 : 0 }, // plocka upp statusbyten medan dialogen är öppen
  );

  async function queueMessage() {
    if (sending || !body.trim()) return;
    setSending(true);
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: e164, body: body.trim(), ownerId }),
      });
      setBody("");
      mutate();
      toast({ title: "Köat — skickas från din Mac inom ~30 sekunder" });
    } catch (e) {
      toast({ title: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Meddelande till {formatPhoneSv(e164) ?? phone}</DialogTitle>
        </DialogHeader>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Skriv ditt meddelande…"
          autoFocus
          className="w-full text-sm border rounded px-2 py-1.5 min-h-[90px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">{body.trim().length} tecken · skickas via din Meddelanden-app</span>
          <Button size="sm" className="gap-1.5" onClick={queueMessage} disabled={sending || !body.trim() || !e164}>
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Skicka
          </Button>
        </div>
        {history.length > 0 && (
          <div className="space-y-1.5 border-t pt-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tidigare till numret</p>
            {history.map((m) => {
              const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.queued;
              return (
                <div key={m.id} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${st.cls}`} title={m.error ?? undefined}>
                    {st.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-nordic-700" title={m.body}>{m.body}</span>
                  <span className="shrink-0 text-muted-foreground">{(m.createdAt ?? "").slice(5, 16)}</span>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
