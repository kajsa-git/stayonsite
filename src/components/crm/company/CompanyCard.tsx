"use client";
import { AgreementStatusPanel } from "@/components/crm/AgreementStatusPanel";
import { CompanyHeader } from "./CompanyHeader";
import { CompanyInfo } from "./CompanyInfo";
import { ContactsList } from "./ContactsList";
import { FollowUpModal } from "./FollowUpModal";
import { NotesPanel } from "./NotesPanel";
import { RequestsList } from "./RequestsList";
import { RequestForm, type RequestFormData } from "./RequestForm";
import { EmailThread } from "@/components/crm/email/EmailThread";
import { useCompany } from "@/hooks/crm/useCompany";
import { RatingControl } from "../RatingControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { crmFetch, crmErrorMessage } from "@/lib/crm/fetcher";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Company, Request } from "@/lib/crm/schema";
import { LOST_REASONS } from "@/lib/crm/lost-reasons";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarClock, CheckCircle2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";


const CLOSED_STATUSES = ["invoiced", "lost", "archived"];

interface CompanyCardProps {
  companyId: string;
  activeRequestId?: string | null;
}

export function CompanyCard({ companyId, activeRequestId }: CompanyCardProps) {
  const router = useRouter();
  const { company, mutate } = useCompany(companyId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [quickBusy, setQuickBusy] = useState(false);
  // Efter Fakturera/Nej: fråga vad som ska hända med återkomsten — varje beslut
  // ska också landa i ett medvetet återkomstläge (sätt/flytta/ta bort/behåll).
  const [followUpPrompt, setFollowUpPrompt] = useState<"won" | "nej" | null>(null);

  // Purely visual: which request is highlighted ("Vald"). Status actions work per-card regardless.
  const selectedRequestId = selectedId ?? activeRequestId ?? null;

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
    const updated = await res.json().catch(() => null);
    mutate();
    router.refresh(); // re-fetch server-rendered queue list in work mode
    toast({
      title:
        status === "invoiced" && updated?.fortnoxInvoiceNumber
          ? `Fakturautkast ${updated.fortnoxInvoiceNumber} skapat`
          : status
            ? "Status uppdaterad"
            : "Sparat",
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
    if (!active.length) return;
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
    if (!open.length) return;
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

  return (
    // pb på mobil: den fasta beslutsraden längst ner får inte täcka sista innehållet.
    <div className="pb-24 md:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CompanyHeader company={company} primaryContact={primaryContact} />
        <div className="shrink-0 pt-1">
          <RatingControl value={company.rating} onChange={handleRating} label="Kund-skattning" />
        </div>
      </div>
      <CompanyInfo company={company} onSave={handleSaveField} />

      {/* Uppdragsbekräftelsen — gäller företaget i 12 mån, signeras via kundlänken */}
      <div className="mb-6">
        <AgreementStatusPanel kind="company" id={company.id} contactName={primaryContact?.name} />
      </div>

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

          {/* Beslutsknapparna — riktiga knappstorlekar även på desktop, det här
              är kortets viktigaste yta. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {hasActiveRequests && (
              <button
                onClick={handleBulkWon}
                disabled={quickBusy}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-green-300 bg-green-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-40"
                title="Markera alla aktiva förfrågningar som vunna och flytta dem till Avtal"
              >
                ✓ Till avtal
              </button>
            )}
            {hasOpenRequests && (
              <button
                onClick={() => setQuickAction(quickAction === "nej" ? null : "nej")}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                title="Stäng alla öppna förfrågningar"
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

        <div className="self-start rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3" /> Senaste avslut
          </span>
          <p className="text-sm font-medium text-nordic-800">
            {lastClosed ? format(new Date(lastClosed), "d MMM yyyy", { locale: sv }) : "—"}
          </p>
        </div>
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
        {hasActiveRequests && (
          <button
            onClick={handleBulkWon}
            disabled={quickBusy}
            className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-green-600 text-sm font-semibold text-white disabled:opacity-40"
          >
            ✓ Fakturera
          </button>
        )}
        {hasOpenRequests && (
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
          <ContactsList
            contacts={company.contacts ?? []}
            companyId={companyId}
            onAdd={handleAddContact}
            onUpdate={handleUpdateContact}
            onDelete={handleDeleteContact}
          />
          <RequestsList
            requests={company.requests ?? []}
            companyId={companyId}
            activeRequestId={selectedRequestId}
            onNewRequest={() => setRequestForm({ open: true, request: null })}
            onEditRequest={(r) => setRequestForm({ open: true, request: r })}
            onSelectRequest={setSelectedId}
            onMatch={handleMatch}
            onStatusChange={handleStatusChange}
          />
        </div>
        <div className="space-y-8">
          <NotesPanel
            notes={company.notes ?? []}
            companyId={companyId}
            onAdd={handleAddNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
          <EmailThread
            companyId={companyId}
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
