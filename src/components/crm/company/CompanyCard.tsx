"use client";
import { AgreementStatusPanel } from "@/components/crm/AgreementStatusPanel";
import { CompanyHeader } from "./CompanyHeader";
import { CaseDrafts } from "./CaseDrafts";
import { CompanyInfo } from "./CompanyInfo";
import { ContactsList } from "./ContactsList";
import { FollowUpModal } from "./FollowUpModal";
import { NotesPanel } from "./NotesPanel";
import { RequestsList } from "./RequestsList";
import { RequestForm, type RequestFormData } from "./RequestForm";
import { EmailThread } from "@/components/crm/email/EmailThread";
import { useCompany } from "@/hooks/crm/useCompany";
import { usePageTrail } from "@/components/crm/layout/PageTrail";
import { useQueue } from "@/contexts/crm/QueueContext";
import { RatingControl } from "../RatingControl";
import { ReviewRequestSnippet } from "../ReviewRequestSnippet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { crmFetch, crmErrorMessage, swrFetcher } from "@/lib/crm/fetcher";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Company, Email, Request } from "@/lib/crm/schema";
import { LOST_REASONS } from "@/lib/crm/lost-reasons";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarClock, CheckCircle2, MapPin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatRequestSearchAreas } from "@/lib/crm/request-search-areas";
import { REQUEST_STATUS_LABEL } from "@/lib/crm/request-status";
import useSWR from "swr";


const CLOSED_STATUSES = ["invoiced", "lost", "archived"];
const SEARCH_AREA_STATUSES = ["incoming", "matching"];

interface CompanyCardProps {
  companyId: string;
  activeRequestId?: string | null;
  workMode?: boolean;
}

export function CompanyCard({ companyId, activeRequestId, workMode }: CompanyCardProps) {
  const router = useRouter();
  const { company, mutate } = useCompany(companyId);
  const queue = useQueue();
  usePageTrail(
    company
      ? [
          ...(queue ? [{ label: `${queue.label} · ${queue.currentIndex + 1} av ${queue.total}` }] : []),
          { label: company.name },
        ]
      : null,
    company ? { kind: "company", label: company.name, href: `/crm/company/${company.id}` } : undefined,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRequestChoices, setShowRequestChoices] = useState(false);
  const { data: caseEmails = [] } = useSWR<Email[]>(workMode ? `/api/crm/emails?companyId=${encodeURIComponent(companyId)}` : null, swrFetcher);
  const { data: caseSms = [] } = useSWR<{ body: string; sentAt: string; direction: string }[]>(workMode ? `/api/crm/inbox?companyId=${encodeURIComponent(companyId)}&limit=1` : null, swrFetcher, { refreshInterval: 15000 });
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [requestForm, setRequestForm] = useState<{ open: boolean; request: Request | null }>({
    open: false,
    request: null,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [quickAction, setQuickAction] = useState<"nej" | null>(null);
  // Mobil-beslutsradens "Nej" skrollar hit — anledningsvalet öppnas i panelen.
  const followUpPanelRef = useRef<HTMLDivElement>(null);
  const requestsRef = useRef<HTMLDivElement>(null);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [quickBusy, setQuickBusy] = useState(false);
  // Efter Fakturera/Nej: fråga vad som ska hända med återkomsten — varje beslut
  // ska också landa i ett medvetet återkomstläge (sätt/flytta/ta bort/behåll).
  const [followUpPrompt, setFollowUpPrompt] = useState<"won" | "nej" | null>(null);

  // Purely visual: which request is highlighted ("Vald"). Status actions work per-card regardless.
  const openRequestOptions = (company?.requests ?? []).filter((r) => ["incoming", "matching", "won"].includes(r.status));
  const selectedRequestId = selectedId ?? activeRequestId ?? (workMode && openRequestOptions.length === 1 ? openRequestOptions[0].id : null);

  function notifyError(e: unknown) {
    toast({ title: crmErrorMessage(e), variant: "destructive" });
  }

  async function handleMatch(requestId: string) {
    const req = company?.requests?.find((r) => r.id === requestId);
    // Move incoming → matching so the request lands in the matching queue
    if (req && req.status === "incoming") {
      try {
        await crmFetch(`/api/crm/requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "matching" }),
        });
        mutate();
        router.refresh();
        toast({ title: "Förfrågan flyttad till matchning" });
      } catch (e) {
        notifyError(e);
        return; // navigera inte vidare om flytten misslyckades
      }
    }
    router.push(`/crm/matching/${requestId}`);
  }

  async function handleSaveField(field: keyof Company, value: string | string[]): Promise<boolean> {
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast({ title: j.message ?? j.error ?? "Kunde inte spara", variant: "destructive" });
        return false;
      }
      mutate();
      toast({ title: "Sparat" });
      return true;
    } catch {
      toast({ title: "Kunde inte spara", variant: "destructive" });
      return false;
    }
  }

  async function handleAddContact(data: { name?: string | null; phone?: string | null; email?: string | null; isPrimary?: boolean | null }) {
    try {
      await crmFetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, ...data }),
      });
      mutate();
      toast({ title: "Kontakt sparad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleUpdateContact(contactId: string, data: object) {
    try {
      await crmFetch(`/api/crm/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      mutate();
      toast({ title: "Kontakt uppdaterad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleDeleteContact(contactId: string) {
    try {
      await crmFetch(`/api/crm/contacts/${contactId}`, { method: "DELETE" });
      mutate();
      toast({ title: "Kontakt borttagen" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleStatusChange(requestId: string, status: string | null, extra?: Record<string, unknown>) {
    const body = status ? { status, ...extra } : { ...extra };
    const res = await fetch(`/api/crm/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast({ title: err?.message ?? "Kunde inte uppdatera status", variant: "destructive" });
      throw new Error(err?.error ?? "status_update_failed");
    }
    await res.json().catch(() => null);
    mutate();
    router.refresh(); // re-fetch server-rendered queue list in work mode
    toast({
      title: status ? "Status uppdaterad" : "Sparat",
    });
  }

  async function handleRating(rating: number | null) {
    try {
      await crmFetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      mutate();
      toast({ title: "Skattning sparad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleFollowUp(date: string, reason: string, time: string) {
    try {
      await crmFetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: date, followUpReason: reason, followUpTime: time }),
      });
      mutate();
      router.refresh(); // re-fetch server-rendered queue list in work mode
      toast({ title: "Återkomst sparad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleAddNote(channel: string, content: string) {
    try {
      await crmFetch("/api/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, channel, content }),
      });
      mutate();
      toast({ title: "Anteckning sparad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleUpdateNote(noteId: string, content: string) {
    try {
      await crmFetch(`/api/crm/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      mutate();
      toast({ title: "Anteckning uppdaterad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      await crmFetch(`/api/crm/notes/${noteId}`, { method: "DELETE" });
      mutate();
      toast({ title: "Anteckning borttagen" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleSaveRequest(data: RequestFormData, requestId?: string) {
    try {
      if (requestId) {
        await crmFetch(`/api/crm/requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await crmFetch("/api/crm/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, status: "incoming", ...data }),
        });
      }
      mutate();
      toast({ title: requestId ? "Förfrågan sparad" : "Förfrågan skapad" });
    } catch (e) {
      notifyError(e);
    }
  }

  async function handleClearFollowUp() {
    try {
      await crmFetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: null, followUpTime: null, followUpReason: null }),
      });
      mutate();
      router.refresh();
      toast({ title: "Återkomst borttagen" });
    } catch (e) {
      notifyError(e);
    }
  }

  // Skicka en status-PATCH och returnera om den lyckades (kastar aldrig).
  async function patchStatusOk(requestId: string, body: object): Promise<boolean> {
    try {
      const res = await fetch(`/api/crm/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function handleBulkWon() {
    const active = (company?.requests ?? []).filter((r) => r.status === "incoming" || r.status === "matching");
    const open = (company?.requests ?? []).filter((r) => ["incoming", "matching", "won"].includes(r.status));
    if (active.length !== 1 || open.length !== 1) return;
    setQuickBusy(true);
    try {
      const results = await Promise.all(active.map((r) => patchStatusOk(r.id, { status: "won" })));
      mutate();
      router.refresh();
      const failed = results.filter((ok) => !ok).length;
      if (failed > 0) {
        toast({ title: `${failed} av ${active.length} kunde inte markeras`, variant: "destructive" });
      } else {
        import("canvas-confetti").then((mod) =>
          mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#ff6300", "#ffd700", "#22c55e", "#3b82f6"] }),
        );
        toast({ title: "🎉 Vunnen — avtal nästa!" });
        setFollowUpPrompt("won");
      }
    } finally {
      setQuickBusy(false);
    }
  }

  async function handleBulkLost(reason: string) {
    const open = (company?.requests ?? []).filter((r) => ["incoming", "matching", "won"].includes(r.status));
    if (open.length !== 1) return;
    setQuickBusy(true);
    try {
      const results = await Promise.all(open.map((r) => patchStatusOk(r.id, { status: "lost", lostReason: reason })));
      mutate();
      router.refresh();
      const failed = results.filter((ok) => !ok).length;
      if (failed > 0) {
        toast({ title: `${failed} av ${open.length} kunde inte stängas`, variant: "destructive" });
      } else {
        toast({ title: "Förfrågningar stängda" });
        setFollowUpPrompt("nej");
      }
    } finally {
      setQuickAction(null);
      setQuickBusy(false);
    }
  }

  async function handleDeleteCompany() {
    setDeleting(true);
    try {
      await crmFetch(`/api/crm/companies/${companyId}`, { method: "DELETE" });
      router.push("/crm/foretag");
      router.refresh();
    } catch (e) {
      notifyError(e);
    } finally {
      setDeleting(false);
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Laddar…
      </div>
    );
  }

  const lastClosed =
    (company.requests ?? [])
      .filter((r) => CLOSED_STATUSES.includes(r.status) && r.statusChangedAt)
      .map((r) => r.statusChangedAt as string)
      .sort()
      .pop() ?? null;

  const primaryContact =
    (company.contacts ?? []).find((c) => c.isPrimary) ?? (company.contacts ?? [])[0] ?? null;

  const hasActiveRequests = (company.requests ?? []).some(
    (r) => r.status === "incoming" || r.status === "matching"
  );
  const hasOpenRequests = (company.requests ?? []).some((r) =>
    ["incoming", "matching", "won"].includes(r.status)
  );
  const hasSeveralOpenRequests = (company.requests ?? []).filter((r) => ["incoming", "matching", "won"].includes(r.status)).length > 1;
  function chooseRequest() {
    setShowRequestChoices(true);
    requestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const recent = [
    ...caseEmails.map((message) => ({ at: message.sentAt, label: message.direction === "in" ? "Mejl från kunden" : "Mejl till kunden", body: message.body })),
    ...caseSms.map((message) => ({ at: message.sentAt, label: message.direction === "in" ? "SMS från kunden" : "SMS till kunden", body: message.body })),
    ...(company.notes ?? []).filter((note) => note.createdAt).map((note) => ({ at: note.createdAt!, label: `Logg · ${note.channel}`, body: note.content })),
  ].filter((entry) => !Number.isNaN(new Date(entry.at).getTime())).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
  const searchAreaRequests = (company.requests ?? [])
    .filter((r) => SEARCH_AREA_STATUSES.includes(r.status) || r.id === selectedRequestId)
    .filter((r) => formatRequestSearchAreas(r))
    .sort((a, b) => {
      if (a.id === selectedRequestId) return -1;
      if (b.id === selectedRequestId) return 1;
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });

  return (
    // pb på mobil: den fasta beslutsraden längst ner får inte täcka sista innehållet.
    <div className="pb-24 md:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CompanyHeader company={company} primaryContact={primaryContact} compact={workMode} />
        {!workMode && <div className="shrink-0 pt-1">
          <RatingControl value={company.rating} onChange={handleRating} label="Kund-skattning" />
        </div>}
      </div>
      {workMode ? (
        <details className="mb-4 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Företagsuppgifter och uppdragsavtal</summary>
          <div className="mt-3 flex flex-col gap-3"><CompanyInfo company={company} onSave={handleSaveField} /><RatingControl value={company.rating} onChange={handleRating} label="Kund-skattning" /><ReviewRequestSnippet name={primaryContact?.name} variant="company" /><AgreementStatusPanel kind="company" id={company.id} contactName={primaryContact?.name} /></div>
        </details>
      ) : (
        <><CompanyInfo company={company} onSave={handleSaveField} /><div className="mb-6"><AgreementStatusPanel kind="company" id={company.id} contactName={primaryContact?.name} /></div></>
      )}

      {/* Company-level dates + snabbval. Avslutsdatumet är bara en upplysning —
          det får en liten ruta; beslutsytan (återkomsten) tar platsen. */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-6">
        <div ref={followUpPanelRef} className="rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2.5">
          <span className="text-xs font-medium uppercase tracking-wide text-amber-800">Återkomst</span>

          {company.followUpDate ? (
            <>
              <p className="text-sm font-medium text-amber-900">
                {company.followUpDate}
                {company.followUpTime && <span className="font-normal"> kl. {company.followUpTime}</span>}
              </p>
              {company.followUpReason && (
                <p className="text-xs text-amber-800/80 mt-0.5">{company.followUpReason}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">Ingen bokad återkomst</p>
          )}
          {workMode && recent && (
            <details className="mt-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Senaste registrerade: {recent.label} · {format(new Date(recent.at), "d MMM HH:mm", { locale: sv })}</summary>
              <p className="mt-1 whitespace-pre-wrap break-words text-nordic-800">{recent.body}</p>
            </details>
          )}
          {workMode && <CaseDrafts contacts={company.contacts ?? []} />}

          {/* Beslutsknapparna — riktiga knappstorlekar även på desktop, det här
              är kortets viktigaste yta. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {hasSeveralOpenRequests && (
              <button onClick={chooseRequest} className="inline-flex h-9 items-center rounded-md border border-input bg-white px-3 text-sm font-semibold hover:bg-muted">
                Välj förfrågan
              </button>
            )}
            {hasActiveRequests && !hasSeveralOpenRequests && (
              <button
                onClick={handleBulkWon}
                disabled={quickBusy}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-green-300 bg-green-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-40"
                title="Flytta förfrågan till avtal"
              >
                ✓ Till avtal
              </button>
            )}
            {hasOpenRequests && !hasSeveralOpenRequests && (
              <button
                onClick={() => setQuickAction(quickAction === "nej" ? null : "nej")}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                title="Stäng förfrågan"
              >
                ✕ Nej
              </button>
            )}
            <button
              onClick={() => setFollowUpOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
            >
              <CalendarClock className="h-4 w-4" />
              {company.followUpDate ? "Flytta återkomst" : "Sätt återkomst"}
            </button>
            {company.followUpDate && (
              <button
                onClick={handleClearFollowUp}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-white px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Ta bort återkomst
              </button>
            )}
          </div>

          {/* Nej — inline anledningsval */}
          {quickAction === "nej" && (
            <div className="mt-2 pt-2 border-t border-amber-200 space-y-1.5">
              <p className="text-[11px] font-medium text-red-800">Varför stängs förfrågan?</p>
              <div className="flex flex-wrap gap-1">
                {LOST_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setLostReason(r)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      lostReason === r
                        ? "border-red-400 bg-red-100 text-red-800 font-semibold"
                        : "border-input bg-white text-muted-foreground hover:bg-red-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleBulkLost(lostReason)}
                  disabled={quickBusy}
                  className="text-[11px] px-2 py-0.5 rounded border border-red-400 bg-red-600 text-white hover:bg-red-700 font-semibold disabled:opacity-40"
                >
                  Ja, stäng
                </button>
                <button
                  onClick={() => setQuickAction(null)}
                  className="text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-muted"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>

        {!workMode && <div className="self-start rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3" /> Senaste avslut
          </span>
          <p className="text-sm font-medium text-nordic-800">
            {lastClosed ? format(new Date(lastClosed), "d MMM yyyy", { locale: sv }) : "—"}
          </p>
        </div>}
      </div>

      {/* Efter Fakturera/Nej: återkomsten ska inte bli hängande av bara farten —
          fråga uttryckligen: sätt/flytta, ta bort eller behåll. */}
      {followUpPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
          onClick={() => setFollowUpPrompt(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-nordic-900">
              {followUpPrompt === "won" ? "Flyttat till avtal ✓" : "Förfrågningarna är stängda"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {company.followUpDate
                ? `Återkomsten ${company.followUpDate} ligger kvar — vad ska hända med den?`
                : "Vill du boka en återkomst på företaget?"}
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setFollowUpPrompt(null);
                  setFollowUpOpen(true);
                }}
                className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
              >
                <CalendarClock className="h-4 w-4" />
                {company.followUpDate ? "Flytta återkomsten" : "Sätt återkomst"}
              </button>
              {company.followUpDate && (
                <button
                  onClick={() => {
                    setFollowUpPrompt(null);
                    handleClearFollowUp();
                  }}
                  className="flex min-h-11 w-full items-center justify-center rounded-md border border-input bg-white text-sm font-medium text-nordic-800 transition-colors hover:bg-muted"
                >
                  Ta bort återkomsten
                </button>
              )}
              <button
                onClick={() => setFollowUpPrompt(null)}
                className="flex min-h-11 w-full items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:text-nordic-900"
              >
                {company.followUpDate ? "Behåll som den är" : "Ingen återkomst behövs"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobil beslutsrad: varje kort i kön ska landa i ett beslut — återkomst,
          fakturering eller nej — och på mobil ska det vara ett tumtryck bort,
          inte en skrollning upp till panelen. Ligger ovanför MobileTabBar (h-14). */}
      <div
        className="md:hidden fixed inset-x-0 z-40 flex gap-2 border-t bg-white/95 px-3 py-2 backdrop-blur"
        style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => setFollowUpOpen(true)}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 text-sm font-semibold text-amber-900"
        >
          <CalendarClock className="h-4 w-4" />
          Återkomst
        </button>
        {hasSeveralOpenRequests && (
          <button onClick={chooseRequest} className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-input bg-white text-sm font-semibold">
            Välj förfrågan
          </button>
        )}
        {hasActiveRequests && !hasSeveralOpenRequests && (
          <button
            onClick={handleBulkWon}
            disabled={quickBusy}
            className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-green-600 text-sm font-semibold text-white disabled:opacity-40"
          >
            ✓ Till avtal
          </button>
        )}
        {hasOpenRequests && !hasSeveralOpenRequests && (
          <button
            onClick={() => {
              setQuickAction("nej");
              followUpPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-red-300 bg-red-50 text-sm font-semibold text-red-700"
          >
            ✕ Nej
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {!workMode && <ContactsList contacts={company.contacts ?? []} companyId={companyId} onAdd={handleAddContact} onUpdate={handleUpdateContact} onDelete={handleDeleteContact} />}
          <div ref={requestsRef}><RequestsList
            requests={company.requests ?? []}
            contacts={company.contacts ?? []}
            companyId={companyId}
            activeRequestId={selectedRequestId}
            focusOnly={workMode}
            chooseOnly={showRequestChoices}
            onNewRequest={() => setRequestForm({ open: true, request: null })}
            onEditRequest={(r) => setRequestForm({ open: true, request: r })}
            onSelectRequest={(id) => { setSelectedId(id); setShowRequestChoices(false); }}
            onMatch={handleMatch}
            onStatusChange={handleStatusChange}
          /></div>
          {workMode && (
            <details className="mb-6 text-sm"><summary className="cursor-pointer text-muted-foreground">Kontakter ({(company.contacts ?? []).length})</summary><div className="mt-3"><ContactsList contacts={company.contacts ?? []} companyId={companyId} onAdd={handleAddContact} onUpdate={handleUpdateContact} onDelete={handleDeleteContact} /></div></details>
          )}
        </div>
        <div className="space-y-8">
          {!workMode && <SearchAreasPanel
            requests={searchAreaRequests}
            activeRequestId={selectedRequestId}
            onSelect={setSelectedId}
          />}
          <NotesPanel
            notes={company.notes ?? []}
            companyId={companyId}
            compact={workMode}
            onAdd={handleAddNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
          <EmailThread
            companyId={companyId}
            compact={workMode}
            contactId={primaryContact?.id}
            defaultTo={primaryContact?.email ?? undefined}
            contacts={(company.contacts ?? []).filter((c) => c.email)}
          />
        </div>
      </div>

      {/* Farlig zon: radera företag */}
      <div className="mt-8 pt-4 border-t flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Radering tar bort företaget och alla dess förfrågningar, kontakter och anteckningar permanent.
        </p>
        <button
          onClick={() => { setDeleteConfirm(""); setDeleteOpen(true); }}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Ta bort företag
        </button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(o) => !o && !deleting && setDeleteOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort {company.name}?</DialogTitle>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">Detta går inte att ångra. Följande raderas permanent:</p>
            <ul className="text-sm list-disc pl-5 text-nordic-800">
              <li>Företaget <strong>{company.name}</strong></li>
              <li>{(company.requests ?? []).length} förfrågningar</li>
              <li>{(company.contacts ?? []).length} kontakter</li>
              <li>{(company.notes ?? []).length} anteckningar</li>
            </ul>
            <div className="space-y-1 pt-1">
              <label className="text-xs text-muted-foreground">
                Skriv företagsnamnet för att bekräfta:
              </label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={company.name}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={deleting || deleteConfirm.trim() !== company.name.trim()}
            >
              {deleting ? "Tar bort…" : "Ta bort permanent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FollowUpModal
        open={followUpOpen}
        initialDate={company.followUpDate}
        initialReason={company.followUpReason}
        initialTime={company.followUpTime}
        onClose={() => setFollowUpOpen(false)}
        onSave={handleFollowUp}
      />

      <RequestForm
        open={requestForm.open}
        request={requestForm.request}
        onClose={() => setRequestForm({ open: false, request: null })}
        onSubmit={handleSaveRequest}
      />
    </div>
  );
}

function SearchAreasPanel({
  requests,
  activeRequestId,
  onSelect,
}: {
  requests: Request[];
  activeRequestId?: string | null;
  onSelect: (id: string) => void;
}) {
  if (requests.length === 0) return null;

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50/70 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-amber-700" />
        <span className="text-xs font-medium uppercase tracking-wide text-amber-800">
          Sökområden att leta i
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((request) => {
          const areas = formatRequestSearchAreas(request);
          if (!areas) return null;
          const isActive = request.id === activeRequestId;

          return (
            <button
              key={request.id}
              type="button"
              onClick={() => onSelect(request.id)}
              className={`w-full rounded-md border bg-white px-3 py-2 text-left transition-colors hover:bg-amber-100/70 ${
                isActive ? "border-amber-500 ring-2 ring-amber-200" : "border-amber-200"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                  {request.requestNumber ? `#${request.requestNumber}` : "Förfrågan"} · {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                </span>
                {isActive && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                    Vald
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-amber-950 whitespace-pre-wrap break-words">
                {areas}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
