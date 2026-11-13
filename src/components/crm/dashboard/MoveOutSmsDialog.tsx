"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson } from "@/lib/crm/fetcher";
import { hasUnfilledMoveOutSmsFields, type MoveOutRecipient } from "@/lib/crm/move-out-sms";
import { formatPhoneSv, normalizePhoneE164 } from "@/lib/crm/phone-links";
import { moveOutLandlordSms, moveOutTenantSms } from "@/lib/crm/sms-templates";
import { format, parseISO } from "date-fns";
import { enGB, sv } from "date-fns/locale";
import { Loader2, Send } from "lucide-react";
import { useId, useRef, useState } from "react";

export type MoveOutContact = { id: string; name: string | null; phone: string | null; isPrimary: boolean | null };
export type MoveOutOwner = { id: string; name: string; phone: string | null };

export function MoveOutSmsDialog({
  requestId, companyName, address, date, contacts, requestContactId, owner, recipient, onOpenChange, onQueued,
}: {
  requestId: string;
  companyName: string;
  address: string | null;
  date: string;
  contacts: MoveOutContact[];
  requestContactId: string | null;
  owner: MoveOutOwner | null;
  recipient: MoveOutRecipient;
  onOpenChange: (open: boolean) => void;
  onQueued: () => Promise<unknown>;
}) {
  const [language, setLanguage] = useState<"sv" | "en">("sv");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [texts, setTexts] = useState(() => ({
    sv: recipient === "tenant"
      ? moveOutTenantSms("sv", address, format(parseISO(date), "EEEE d MMMM yyyy", { locale: sv }))
      : moveOutLandlordSms("sv", owner?.name, address, format(parseISO(date), "EEEE d MMMM yyyy", { locale: sv })),
    en: recipient === "tenant"
      ? moveOutTenantSms("en", address, format(parseISO(date), "EEEE d MMMM yyyy", { locale: enGB }))
      : moveOutLandlordSms("en", owner?.name, address, format(parseISO(date), "EEEE d MMMM yyyy", { locale: enGB })),
  }));
  const [selectedContactId, setSelectedContactId] = useState("");
  const [phone, setPhone] = useState(recipient === "landlord" ? owner?.phone ?? "" : "");
  const [busy, setBusy] = useState(false);
  const messageId = useId();
  const submissionId = useRef<string | null>(null);
  const text = texts[language];
  const e164 = normalizePhoneE164(phone);
  const missingFields = hasUnfilledMoveOutSmsFields(text);
  const contact = contacts.find((c) => c.id === selectedContactId);
  const contactId = contact && normalizePhoneE164(contact.phone) === e164 ? contact.id : null;
  const ownerId = recipient === "landlord" && owner && normalizePhoneE164(owner.phone) === e164 ? owner.id : null;
  const valid = !!e164 && !!text.trim() && text.trim().length <= 1600 && !missingFields;
  const whatsappUrl = valid ? `https://wa.me/${e164!.slice(1)}?text=${encodeURIComponent(text.trim())}` : "";
  const sortedContacts = [...contacts].sort((a, b) =>
    Number(b.id === requestContactId) - Number(a.id === requestContactId) || Number(b.isPrimary) - Number(a.isPrimary),
  );

  async function queue() {
    if (busy || !e164 || !text.trim() || text.trim().length > 1600 || missingFields) return;
    setBusy(true);
    try {
      submissionId.current ??= crypto.randomUUID();
      const message = await crmFetchJson<{ status: string; deliveredAt: string | null }>(`/api/crm/requests/${requestId}/move-out-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: e164, contactId, ownerId, recipient, body: text.trim(), submissionId: submissionId.current }),
      });
      void onQueued().catch(() => undefined);
      if (message.status === "failed") {
        submissionId.current = null;
        toast({ title: "Sms:et kunde inte skickas", description: "Kontrollera uppgifterna och försök igen.", variant: "destructive" });
        return;
      }
      onOpenChange(false);
      toast({ title: message.status === "sent" ? (message.deliveredAt ? "Sms:et är levererat" : "Sms:et är skickat · leverans okänd") : "Sms:et är köat för skickning" });
    } catch (error) {
      void onQueued().catch(() => undefined);
      toast({ title: "Kunde inte köa sms:et", description: crmErrorMessage(error), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Utflyttningsmeddelande till {recipient === "tenant" ? "hyresgäst" : "uthyrare"} · {companyName}</DialogTitle>
          <DialogDescription>
            {recipient === "tenant" ? "Kontrollera att mottagaren är den som ska få informationen om utflytten." : `Meddelandet är ett förslag${owner ? ` till ${owner.name}` : ""} som du kan anpassa.`}
          </DialogDescription>
        </DialogHeader>
        {recipient === "tenant" && sortedContacts.length > 0 && (
          <label className="block text-sm font-medium">
            Välj sparad kontakt
            <select
              value={selectedContactId}
              onChange={(event) => {
                const id = event.target.value;
                setSelectedContactId(id);
                setPhone(contacts.find((c) => c.id === id)?.phone ?? "");
                submissionId.current = null;
              }}
              className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            >
              <option value="">Välj kontakt eller ange nummer nedan</option>
              {sortedContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || "Namn saknas"} · {formatPhoneSv(c.phone) || "nummer saknas"}{c.id === requestContactId ? " · uppdragets kontakt" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm font-medium">
          Telefonnummer
          <input
            type="tel"
            value={phone}
            onChange={(event) => {
              const next = event.target.value;
              setPhone(next);
              if (contact && normalizePhoneE164(contact.phone) !== normalizePhoneE164(next)) setSelectedContactId("");
              submissionId.current = null;
            }}
            placeholder="Ange mottagarens telefonnummer"
            className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
          />
        </label>
        {recipient === "landlord" && owner && phone && !ownerId && (
          <p className="text-xs text-amber-800">Numret skiljer sig från uthyrarens sparade nummer. Kontrollera mottagaren.</p>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Kanal</span>
          {(["sms", "whatsapp"] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setChannel(value)}
              aria-pressed={channel === value}
              className={`rounded-md border px-3 py-1 ${channel === value ? "border-orange-500 bg-orange-50 text-orange-800" : "border-input"}`}
            >
              {value === "sms" ? "SMS" : "WhatsApp"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Språk</span>
          {(["sv", "en"] as const).map((lang) => (
            <button
              type="button"
              key={lang}
              onClick={() => { setLanguage(lang); submissionId.current = null; }}
              aria-pressed={language === lang}
              className={`rounded-md border px-3 py-1 ${language === lang ? "border-orange-500 bg-orange-50 text-orange-800" : "border-input"}`}
            >
              {lang === "sv" ? "Svenska" : "English"}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor={messageId} className="block text-sm font-medium">Meddelande</label>
          <textarea
            id={messageId}
            value={text}
            onChange={(event) => {
              setTexts((previous) => ({ ...previous, [language]: event.target.value }));
              submissionId.current = null;
            }}
            rows={14}
            className="mt-1 w-full resize-y rounded-md border border-input px-3 py-2 text-sm font-normal"
          />
        </div>
        {missingFields && <p className="text-xs text-amber-800">Fyll i uppgifterna inom hakparenteser innan du skickar.</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {channel === "sms" ? `${text.trim().length}/1600 tecken · köas via din Mac kl. 08–21 svensk tid. Macen behöver vara på och uppkopplad.` : "Skicka i WhatsApp och markera sedan meddelandet som skickat här."}
          </span>
          {channel === "sms" ? (
            <Button onClick={queue} disabled={busy || !valid} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Skicka sms
            </Button>
          ) : valid ? (
            <Button asChild className="gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Send className="h-4 w-4" /> Öppna WhatsApp
              </a>
            </Button>
          ) : <Button disabled>Öppna WhatsApp</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
