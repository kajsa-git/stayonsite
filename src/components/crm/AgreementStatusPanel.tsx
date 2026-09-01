"use client";

// Avtalsstatus + fristående avtalslänk på uthyrar- och företagskorten.
// Uppdragsavtalen skickas FÖRST, fristående från affärer (Kajsas modell
// 2026-07-13): signera → bevaka → skarpt kontrakt först när alla är överens.
// Visar signerat av/när, giltig till (12 mån), och flaggar utgånget/gammal version.

import { ShareLinkButton } from "@/components/crm/property/ShareLinkButton";
import { toast } from "@/components/ui/use-toast";
import { swrFetcher } from "@/lib/crm/fetcher";
import type { ShareLink } from "@/lib/crm/schema";
import { landlordAvtalStandaloneSms, tenantAvtalSms } from "@/lib/crm/sms-templates";
import { Copy, FileSignature, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface AgreementStatus {
  id: string;
  acceptedName: string;
  acceptedAt: string;
  version: string;
  validUntil: string;
  valid: boolean;
  currentVersion: string;
}

interface PanelData {
  links: ShareLink[];
  agreement: AgreementStatus | null;
  requestIds?: string[];
}

// owner: fristående uthyrarlänk (/uthyrare/<token>, ownerId-scope).
// company: kundens avtalsstatus (företagsscope); länken är förfrågans kundlänk.
export function AgreementStatusPanel({
  kind,
  id,
  contactName,
}: {
  kind: "owner" | "company";
  id: string;
  contactName?: string | null;
}) {
  const { data, mutate } = useSWR<PanelData>(
    `/api/crm/share-links?${kind === "owner" ? "ownerId" : "companyId"}=${id}`,
    swrFetcher
  );
  const [working, setWorking] = useState(false);

  const label = kind === "owner" ? "Uppdragsavtal (uthyrningsuppdrag)" : "Uppdragsbekräftelse";
  const shareLabel = kind === "owner" ? "Dela uthyrarlänk" : "Dela kundlänk";
  const createLabel = kind === "owner" ? "Skapa uthyrarlänk" : "Skapa kundlänk";
  const activeLink =
    kind === "owner"
      ? (data?.links.find((l) => l.audience === "landlord" && l.ownerId === id && !l.revokedAt) ?? null)
      : (data?.links.find((l) => l.audience === "tenant" && !l.matchId && !l.revokedAt) ?? null);
  const path = activeLink
    ? kind === "owner"
      ? `/uthyrare/${activeLink.token}`
      : `/erbjudande/${activeLink.token}`
    : null;

  async function createLink() {
    const requestId = kind === "company" ? latestRequestIdFromLinks() : null;
    if (kind === "company" && !requestId) {
      // Kundens avtalslänk är förfrågans kundlänk — utan förfrågan finns inget att länka till.
      toast({ title: "Skapa en förfrågan först — avtalslänken är kundens erbjudandelänk", variant: "destructive" });
      return;
    }
    setWorking(true);
    try {
      const res = await fetch("/api/crm/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "owner" ? { ownerId: id, audience: "landlord" } : { requestId, audience: "tenant" }),
      });
      if (!res.ok) {
        toast({ title: "Kunde inte skapa länken", variant: "destructive" });
        return;
      }
      mutate();
      toast({ title: "Avtalslänk skapad" });
    } finally {
      setWorking(false);
    }
  }

  // Företagets kundlänkar ligger per förfrågan — ta senaste förfrågans.
  function latestRequestIdFromLinks(): string | null {
    return (
      data?.links.find((l) => l.audience === "tenant" && l.requestId)?.requestId ??
      data?.requestIds?.[0] ??
      data?.links.find((l) => l.requestId)?.requestId ??
      null
    );
  }

  // Annullera signeringen — INTE samma sak som att återkalla länken (länken är
  // dörren, signeringen är avtalet). Destruktivt ⇒ explicit bekräftelse.
  async function annulSignature() {
    if (!a) return;
    if (
      !window.confirm(
        `Annullera signeringen av ${a.acceptedName} (${a.acceptedAt.slice(0, 10)})? ` +
          "Parten måste signera om via länken. Detta kan inte ångras."
      )
    ) {
      return;
    }
    setWorking(true);
    try {
      const res = await fetch(`/api/crm/agreement-acceptances/${a.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ title: "Kunde inte annullera signeringen", variant: "destructive" });
        return;
      }
      mutate();
      toast({ title: "Signeringen annullerad — gaten visas igen i länken" });
    } finally {
      setWorking(false);
    }
  }

  async function copySms() {
    if (!activeLink) return;
    // Avtals-copy, inte erbjudande-copy — lovar inget objekt/pris förrän
    // förslaget faktiskt är skickat (offerLinkSms används då, från matchningsvyn).
    const text =
      kind === "owner"
        ? landlordAvtalStandaloneSms(contactName, activeLink.token)
        : tenantAvtalSms(contactName, activeLink.token);
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "SMS-text kopierad (www-länk utan https)" });
    } catch {
      toast({ title: "Kunde inte kopiera", variant: "destructive" });
    }
  }

  const a = data?.agreement ?? null;

  return (
    <div className="bg-white rounded-xl border p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{label}</h2>
        {a?.valid ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
            <ShieldCheck className="h-3 w-3" />
            Signerat av {a.acceptedName} · giltigt till {a.validUntil}
          </span>
        ) : a ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"
            title={
              a.version !== a.currentVersion
                ? `Signerad version ${a.version}, aktuell är ${a.currentVersion}.`
                : `Gick ut ${a.validUntil}.`
            }
          >
            <ShieldQuestion className="h-3 w-3" />
            Behöver omsignering — skicka länken igen
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
            <ShieldQuestion className="h-3 w-3" />
            Ej signerat
          </span>
        )}
        {a && (
          <button
            onClick={annulSignature}
            disabled={working}
            className="text-[11px] text-red-700 underline decoration-red-300 hover:decoration-red-700 disabled:opacity-50"
            title="Tar bort signeringen — parten måste signera om via länken. Återkallning av länken gör INTE detta."
          >
            Annullera signering
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {path ? (
          <>
            <ShareLinkButton path={path} label={shareLabel} />
            <button
              onClick={copySms}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-muted transition-colors"
              title="Kopiera färdig SMS-text med www-länk"
            >
              <Copy className="h-4 w-4" /> SMS-text
            </button>
          </>
        ) : (
          <button
            onClick={createLink}
            disabled={working}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <FileSignature className="h-4 w-4" /> {working ? "Skapar…" : createLabel}
          </button>
        )}
      </div>
    </div>
  );
}
