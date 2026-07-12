"use client";

// Kundlänk-panelen i matchningsvyn: skapa/dela/återkalla förfrågans
// erbjudandelänk (/erbjudande/<token>) och se uppdragsbekräftelsens status.
// Länken är kapabiliteten — återkallning är därför en (lätt) destruktiv åtgärd
// och kräver bekräftelse.

import { ShareLinkButton } from "@/components/crm/property/ShareLinkButton";
import { toast } from "@/components/ui/use-toast";
import { swrFetcher } from "@/lib/crm/fetcher";
import type { ShareLink } from "@/lib/crm/schema";
import { offerLinkSms } from "@/lib/crm/sms-templates";
import { Copy, Eye, Link as LinkIcon, ShieldCheck, ShieldQuestion, Undo2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface PanelData {
  links: ShareLink[];
  agreement: { acceptedName: string; acceptedAt: string; version: string } | null;
}

export function OfferLinkPanel({ requestId, contactName }: { requestId: string; contactName?: string | null }) {
  const { data, mutate } = useSWR<PanelData>(`/api/crm/share-links?requestId=${requestId}`, swrFetcher);
  const [working, setWorking] = useState(false);

  const tenantLink = data?.links.find((l) => l.audience === "tenant" && !l.matchId && !l.revokedAt) ?? null;

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
    try {
      await navigator.clipboard.writeText(offerLinkSms(contactName, tenantLink.token));
      toast({ title: "SMS-text kopierad (länk utan https — leveranssäkert)" });
    } catch {
      toast({ title: "Kunde inte kopiera", variant: "destructive" });
    }
  }

  return (
    <div className="bg-white rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Kundens länk</h2>
        {data?.agreement ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
            <ShieldCheck className="h-3 w-3" />
            Uppdragsbekräftelse godkänd av {data.agreement.acceptedName} {data.agreement.acceptedAt.slice(0, 10)}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"
            title="Kunden godkänner uppdragsbekräftelsen första gången länken öppnas — före dess visas inget erbjudande."
          >
            <ShieldQuestion className="h-3 w-3" />
            Uppdragsbekräftelse ej godkänd
          </span>
        )}
      </div>

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
    </div>
  );
}
