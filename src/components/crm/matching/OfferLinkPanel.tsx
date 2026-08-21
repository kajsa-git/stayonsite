"use client";

// Affärspanelen i matchningsvyn: kundens resa som milstolpar (länk skapad →
// öppnad → uppdragsbekräftelse → erbjudande ute → accept) med en "Nästa steg"-
// rad i klartext, plus skapa/dela/återkalla förfrågans erbjudandelänk
// (/erbjudande/<token>). Länken är kapabiliteten — återkallning är därför en
// (lätt) destruktiv åtgärd och kräver bekräftelse.

import { EmailComposeModal } from "@/components/crm/email/EmailComposeModal";
import { ShareLinkButton } from "@/components/crm/property/ShareLinkButton";
import { toast } from "@/components/ui/use-toast";
import { swrFetcher } from "@/lib/crm/fetcher";
import type { Contact, ShareLink } from "@/lib/crm/schema";
import { offerEmailHtml, offerLinkSms, tenantAvtalSms } from "@/lib/crm/sms-templates";
import { Copy, Eye, Link as LinkIcon, Mail, Undo2 } from "lucide-react";
import { Fragment, useState } from "react";
import useSWR from "swr";

export interface AgreementStatus {
  acceptedName: string;
  acceptedAt: string;
  version: string;
  validUntil: string; // 12 mån från signering
  valid: boolean; // rätt version + inom giltighetstiden
  currentVersion: string;
}

interface PanelData {
  links: ShareLink[];
  agreement: AgreementStatus | null;
}

export function OfferLinkPanel({
  requestId,
  companyId,
  city,
  contactName,
  sentCount = 0,
  hasAccepted = false,
}: {
  requestId: string;
  companyId: string;
  city?: string | null;
  contactName?: string | null;
  // Antal skickade erbjudanden på förfrågan — utan något visar kundlänken bara
  // uppdragsbekräftelsen + en väntsida.
  sentCount?: number;
  // Något förslag accepterat (eller förfrågan vunnen) — sista milstolpen.
  hasAccepted?: boolean;
}) {
  const { data, mutate } = useSWR<PanelData>(`/api/crm/share-links?requestId=${requestId}`, swrFetcher);
  // Kontakter för mejlutskicket — mottagare + kontaktväljare i mejlmodalen.
  const { data: company } = useSWR<{ contacts: Contact[] }>(`/api/crm/companies/${companyId}`, swrFetcher);
  const [working, setWorking] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const tenantLink = data?.links.find((l) => l.audience === "tenant" && !l.matchId && !l.revokedAt) ?? null;
  const contacts = (company?.contacts ?? []).filter((c) => c.email);
  const primaryEmail = (contacts.find((c) => c.isPrimary) ?? contacts[0])?.email ?? "";

  // Milstolparna härleds ur data som redan finns: länken, dess visningar,
  // uppdragsbekräftelsen, skickade erbjudanden och accept. "Var är vi?" ska
  // gå att svara på utan att läsa någon brödtext.
  const opened = (tenantLink?.viewCount ?? 0) > 0;
  const agreementValid = !!data?.agreement?.valid;
  const needsResign = !!data?.agreement && !data.agreement.valid;
  const milestones = [
    {
      label: "Länk skapad",
      done: !!tenantLink,
      title: tenantLink ? "Kundens länk är aktiv" : "Kunden har ingen aktiv länk",
    },
    {
      label: "Öppnad av kund",
      done: opened,
      title: tenantLink?.lastViewedAt
        ? `Öppnad ${tenantLink.viewCount} ggr — senast ${tenantLink.lastViewedAt.slice(0, 16).replace("T", " ")}`
        : "Kunden har inte öppnat länken ännu",
    },
    {
      label: "Uppdragsbekräftelse",
      done: agreementValid,
      title: agreementValid
        ? `Godkänd av ${data!.agreement!.acceptedName} · giltig till ${data!.agreement!.validUntil}`
        : needsResign
          ? "Behöver omsigneras — gaten visas igen i länken"
          : "Kunden godkänner uppdragsbekräftelsen första gången länken öppnas",
    },
    {
      label: "Erbjudande ute",
      done: sentCount > 0,
      title: sentCount > 0 ? `${sentCount} skickade erbjudanden syns i länken` : "Inget erbjudande skickat ännu",
    },
    {
      label: "Accept",
      done: hasAccepted,
      title: hasAccepted ? "Kunden har accepterat" : "Väntar på kundens ja",
    },
  ];
  const currentIdx = milestones.findIndex((m) => !m.done);
  const nextStep =
    currentIdx === -1
      ? "Kunden har accepterat — affären ligger för fakturering."
      : currentIdx === 0
        ? "Skapa kundlänken och dela den — där godkänner kunden uppdragsbekräftelsen och ser sina förslag."
        : currentIdx === 1
          ? "Kunden har inte öppnat sin länk — påminn via SMS eller mejl."
          : currentIdx === 2
            ? needsResign
              ? "Uppdragsbekräftelsen behöver omsigneras — be kunden öppna länken igen."
              : "Kunden har öppnat länken men inte godkänt uppdragsbekräftelsen ännu."
            : currentIdx === 3
              ? "Prisa & skicka erbjudandet på ett förslag nedan — objektet dyker upp i kundens länk direkt."
              : "Erbjudande ute — väntar på kundens svar. När de tackar ja: tryck Accept på förslaget.";

  async function createLink() {
    setWorking(true);
    try {
      const res = await fetch("/api/crm/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, audience: "tenant" }),
      });
      if (!res.ok) {
        toast({ title: "Kunde inte skapa länken", variant: "destructive" });
        return;
      }
      mutate();
      toast({ title: "Kundlänk skapad" });
    } catch {
      toast({ title: "Kunde inte skapa länken", variant: "destructive" });
    } finally {
      setWorking(false);
    }
  }

  async function revokeLink() {
    if (!tenantLink) return;
    if (!window.confirm("Återkalla kundlänken? Kunden kan inte längre öppna sidan förrän du skapar en ny länk.")) {
      return;
    }
    setWorking(true);
    try {
      const res = await fetch(`/api/crm/share-links/${tenantLink.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ title: "Kunde inte återkalla länken", variant: "destructive" });
        return;
      }
      mutate();
      toast({ title: "Länken återkallad" });
    } finally {
      setWorking(false);
    }
  }

  async function copySmsText() {
    if (!tenantLink) return;
    // Copy efter läge: inget erbjudande skickat ⇒ avtals-SMS (lovar inget objekt/pris),
    // annars erbjudande-SMS. Samma länk i båda — sidan växlar själv.
    const text =
      sentCount === 0 ? tenantAvtalSms(contactName, tenantLink.token) : offerLinkSms(contactName, tenantLink.token);
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title:
          sentCount === 0
            ? "Avtals-SMS kopierad — erbjudande-texten används när förslaget är skickat"
            : "SMS-text kopierad (länk utan https — leveranssäkert)",
      });
    } catch {
      toast({ title: "Kunde inte kopiera", variant: "destructive" });
    }
  }

  return (
    <div className="bg-white rounded-xl border p-4 space-y-3">
      <h2 className="text-sm font-semibold">Affären med kunden</h2>

      <div className="flex flex-wrap items-center gap-1">
        {milestones.map((ms, i) => (
          <Fragment key={ms.label}>
            {i > 0 && <span className="text-[10px] text-nordic-300">›</span>}
            <span
              title={ms.title}
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                ms.done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : i === currentIdx
                    ? "border-blue-300 bg-blue-50 text-blue-800 ring-1 ring-blue-200"
                    : "border-input bg-white text-muted-foreground"
              }`}
            >
              {ms.done ? "✓ " : ""}
              {ms.label}
            </span>
          </Fragment>
        ))}
      </div>

      <p className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-900">
        <span className="font-semibold">Nästa steg:</span> {nextStep}
      </p>

      {tenantLink ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ShareLinkButton
              path={`/erbjudande/${tenantLink.token}`}
              title="Ert boendeförslag — StayOnSite"
              text="Här är ert boendeförslag från StayOnSite:"
              label="Dela kundlänk"
            />
            <button
              onClick={copySmsText}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-muted transition-colors"
              title="Kopiera färdig SMS-text med www-länk (utan https — kommer förbi operatörsfiltren)"
            >
              <Copy className="h-4 w-4" /> SMS-text
            </button>
            <button
              onClick={() => setEmailOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-muted transition-colors"
              title="Skriv mejl med länken i den interna klienten (förifyllt)"
            >
              <Mail className="h-4 w-4" /> Mejl
            </button>
            <button
              onClick={revokeLink}
              disabled={working}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors ml-auto"
            >
              <Undo2 className="h-4 w-4" /> Återkalla
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {tenantLink.lastViewedAt
              ? `Öppnad ${tenantLink.viewCount} ggr — senast ${tenantLink.lastViewedAt.slice(0, 16).replace("T", " ")}`
              : "Inte öppnad ännu"}
            {tenantLink.createdAt ? ` · skapad ${tenantLink.createdAt.slice(0, 10)}` : ""}
          </p>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Kunden får en personlig sida med skickade förslag, sitt pris och uppdragsbekräftelsen —
            aldrig adress, uthyrare eller inpris.
          </p>
          <button
            onClick={createLink}
            disabled={working}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <LinkIcon className="h-4 w-4" /> {working ? "Skapar…" : "Skapa kundlänk"}
          </button>
        </div>
      )}

      {tenantLink && (
        <EmailComposeModal
          open={emailOpen}
          companyId={companyId}
          contacts={contacts.map((c) => ({ id: c.id, name: c.name, email: c.email! }))}
          defaultTo={primaryEmail}
          defaultSubject={city ? `Boende – ${city}` : "Boendeförslag – StayOnSite"}
          defaultBody={offerEmailHtml(contactName, city, tenantLink.token)}
          onClose={() => setEmailOpen(false)}
          onSent={() => setEmailOpen(false)}
        />
      )}
    </div>
  );
}
