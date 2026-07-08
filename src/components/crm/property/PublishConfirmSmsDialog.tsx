"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { publishedLinkSms } from "@/lib/crm/sms-templates";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Efter att ett objekt publicerats från objektvyn: fråga om uthyraren ska få
// bekräftelse-SMS med den publika länken. Texten är redigerbar och sparas som
// UTKAST i utkorgen — inget skickas förrän det godkänns i Utkast-panelen (Min dag).
// Montera komponenten villkorligt (unmount vid stängning) så mallen förifylls färsk.
export function PublishConfirmSmsDialog({
  open,
  onOpenChange,
  ownerId,
  ownerName,
  ownerPhone,
  slug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerName: string | null;
  ownerPhone: string;
  slug: string;
}) {
  const [body, setBody] = useState(() => publishedLinkSms(ownerName, slug));
  const [saving, setSaving] = useState(false);

  async function saveDraft() {
    if (saving || !body.trim()) return;
    setSaving(true);
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: ownerPhone, ownerId, draft: true, body: body.trim() }),
      });
      toast({ title: "Bekräftelse-SMS sparat som utkast — godkänn i Utkast-panelen" });
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Kunde inte spara utkastet", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Skicka bekräftelse till {ownerName ?? "uthyraren"}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Objektet är publicerat. SMS:et till {formatPhoneSv(ownerPhone) ?? ownerPhone} läggs som{" "}
          <b>utkast</b> — inget skickas förrän du godkänner det i Utkast-panelen.
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full text-sm border rounded px-2 py-1.5 min-h-[110px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-sm px-3 py-1.5 rounded-md border border-input bg-white text-muted-foreground hover:bg-nordic-100 transition-colors"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hoppa över
          </button>
          <button
            className="text-sm px-3 py-1.5 rounded-md border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold disabled:opacity-40 transition-colors"
            onClick={saveDraft}
            disabled={saving || !body.trim()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Spara som utkast"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
