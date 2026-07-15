"use client";

// Delningsdialog för uthyrarens uppdragsavtal (steg 1 på förslagskortet).
// Skapar/återanvänder den fristående ägarlänken och låter Kajsa skicka den direkt:
// SMS (sms: till uthyrarens nummer), WhatsApp (wa.me), kopiera text, eller mejl via
// interna klienten. Uthyraren ser BARA avtalet — inga affärsvillkor.

import { EmailComposeModal } from "@/components/crm/email/EmailComposeModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { formatPhoneSv, smsHref, whatsappHref } from "@/lib/crm/phone-links";
import { landlordAvtalStandaloneSms, landlordAvtalEmailHtml } from "@/lib/crm/sms-templates";
import { Copy, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

export interface LandlordShareTarget {
  ownerId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
}

export function LandlordAgreementShareDialog({
  target,
  onClose,
}: {
  target: LandlordShareTarget | null;
  onClose: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  // Skapa/återanvänd länken när dialogen öppnas.
  const open = !!target;
  if (open && !token && !loading) {
    setLoading(true);
    fetch("/api/crm/share-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId: target!.ownerId }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((link) => setToken(link.token))
      .catch(() => toast({ title: "Kunde inte skapa avtalslänken", variant: "destructive" }))
      .finally(() => setLoading(false));
  }

  function close() {
    setToken(null);
    onClose();
  }

  const smsText = token ? landlordAvtalStandaloneSms(target?.ownerName, token) : "";
  const sms = target?.ownerPhone ? smsHref(target.ownerPhone) : null;
  const wa = target?.ownerPhone ? whatsappHref(target.ownerPhone) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Skicka uppdragsavtal — {target?.ownerName ?? "uthyrare"}</DialogTitle>
        </DialogHeader>

        {!token ? (
          <p className="text-sm text-muted-foreground">Skapar avtalslänk…</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Uthyraren signerar uppdragsavtalet i länken — det gäller alla deras objekt i 12 månader.
              {target?.ownerPhone ? ` ${formatPhoneSv(target.ownerPhone)}` : ""}
            </p>

            <div className="flex flex-wrap gap-2">
              {sms && (
                <a
                  href={sms}
                  onClick={() => {
                    navigator.clipboard.writeText(smsText).catch(() => {});
                    toast({ title: "Meddelandeappen öppnas — texten är kopierad att klistra in" });
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <MessageCircle className="h-4 w-4" /> SMS
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    navigator.clipboard.writeText(smsText).catch(() => {});
                    toast({ title: "WhatsApp öppnas — texten är kopierad att klistra in" });
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-[#25D366]/40 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(smsText);
                    toast({ title: "Text kopierad (www-länk utan https)" });
                  } catch {
                    toast({ title: "Kunde inte kopiera", variant: "destructive" });
                  }
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-muted"
              >
                <Copy className="h-4 w-4" /> Kopiera text
              </button>
              <button
                onClick={() => setEmailOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-muted"
                title="Skriv mejl med länken i interna klienten (förifyllt)"
              >
                <Mail className="h-4 w-4" /> Mejl
              </button>
            </div>

            <p className="break-all rounded bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
              www.stayonsite.se/uthyrare/{token}
            </p>
          </div>
        )}

        {token && (
          <EmailComposeModal
            open={emailOpen}
            ownerId={target?.ownerId}
            defaultTo={target?.ownerEmail ?? ""}
            defaultSubject="Uppdragsavtal – StayOnSite"
            defaultBody={landlordAvtalEmailHtml(target?.ownerName, token)}
            onClose={() => setEmailOpen(false)}
            onSent={() => setEmailOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
