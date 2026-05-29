"use client";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Company, Request } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarClock, CheckCircle2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LOST_REASONS = ["För dyrt", "Ej passande bostad", "Hittade bättre objekt", "Övrigt"];

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
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [quickBusy, setQuickBusy] = useState(false);

  // Purely visual: which request is highlighted ("Vald"). Status actions work per-card regardless.
  const selectedRequestId = selectedId ?? activeRequestId ?? null;

  async function handleMatch(requestId: string) {
    const req = company?.requests?.find((r) => r.id === requestId);
    // Move incoming → matching so the request lands in the matching queue
    if (req && req.status === "incoming") {
      await fetch(`/api/crm/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "matching" }),
      });
      mutate();
      router.refresh();
      toast({ title: "Förfrågan flyttad till matchning" });
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
      if (!res.ok) return false;
      mutate();
      toast({ title: "Sparat" });
      return true;
    } catch {
      toast({ title: "Kunde inte spara", variant: "destructive" });
      return false;
    }
  }

  async function handleAddContact(data: { name?: string | null; phone?: string | null; email?: string | null; isPrimary?: boolean | null }) {
    await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, ...data }),
    });
    mutate();
    toast({ title: "Kontakt sparad" });
  }

  async function handleUpdateContact(contactId: string, data: object) {
    await fetch(`/api/crm/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
    toast({ title: "Kontakt uppdaterad" });
  }

  async function handleDeleteContact(contactId: string) {
    await fetch(`/api/crm/contacts/${contactId}`, { method: "DELETE" });
    mutate();
    toast({ title: "Kontakt borttagen" });
  }

  async function handleStatusChange(requestId: string, status: string, extra?: Record<string, unknown>) {
    await fetch(`/api/crm/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    mutate();
    router.refresh(); // re-fetch server-rendered queue list in work mode
    toast({ title: "Status uppdaterad" });
  }

  async function handleRating(rating: number | null) {
    await fetch(`/api/crm/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    mutate();
    toast({ title: "Skattning sparad" });
  }

  async function handleFollowUp(date: string, reason: string, time: string) {
    await fetch(`/api/crm/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: date, followUpReason: reason, followUpTime: time }),
    });
    mutate();
    router.refresh(); // re-fetch server-rendered queue list in work mode
    toast({ title: "Återkomst sparad" });
  }

  async function handleAddNote(channel: string, content: string) {
    await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, channel, content }),
    });
    mutate();
    toast({ title: "Anteckning sparad" });
  }

  async function handleUpdateNote(noteId: string, content: string) {
    await fetch(`/api/crm/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    mutate();
    toast({ title: "Anteckning uppdaterad" });
  }

  async function handleDeleteNote(noteId: string) {
    await fetch(`/api/crm/notes/${noteId}`, { method: "DELETE" });
    mutate();
    toast({ title: "Anteckning borttagen" });
  }

  async function handleSaveRequest(data: RequestFormData, requestId?: string) {
    if (requestId) {
      await fetch(`/api/crm/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/crm/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, status: "incoming", ...data }),
      });
    }
    mutate();
    toast({ title: requestId ? "Förfrågan sparad" : "Förfrågan skapad" });
  }

  async function handleClearFollowUp() {
    await fetch(`/api/crm/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: null, followUpTime: null, followUpReason: null }),
    });
    mutate();
    router.refresh();
    toast({ title: "Återkomst borttagen" });
  }

  async function handleBulkWon() {
    const active = (company?.requests ?? []).filter((r) => r.status === "incoming" || r.status === "matching");
    if (!active.length) return;
    setQuickBusy(true);
    await Promise.all(active.map((r) => fetch(`/api/crm/requests/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "won" }),
    })));
    mutate();
    router.refresh();
    setQuickBusy(false);
    import("canvas-confetti").then((mod) =>
      mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#ff6300", "#ffd700", "#22c55e", "#3b82f6"] }),
    );
    toast({ title: "🎉 Ska faktureras!" });
  }

  async function handleBulkLost(reason: string) {
    const open = (company?.requests ?? []).filter((r) => ["incoming", "matching", "won"].includes(r.status));
    if (!open.length) return;
    setQuickBusy(true);
    await Promise.all(open.map((r) => fetch(`/api/crm/requests/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "lost", lostReason: reason }),
    })));
    mutate();
    router.refresh();
    setQuickBusy(false);
    setQuickAction(null);
    toast({ title: "Förfrågningar stängda" });
  }

  async function handleDeleteCompany() {
    setDeleting(true);
    const res = await fetch(`/api/crm/companies/${companyId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/crm/foretag");
      router.refresh();
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

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <CompanyHeader company={company} primaryContact={primaryContact} />
        <div className="shrink-0 pt-1">
          <RatingControl value={company.rating} onChange={handleRating} label="Kund-skattning" />
        </div>
      </div>
      <CompanyInfo company={company} onSave={handleSaveField} />

      {/* Company-level dates + snabbval */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium uppercase tracking-wide text-amber-800">Återkomst</span>
            <div className="flex items-center gap-1">
              {/* Snabbval: Ska faktureras */}
              {(company.requests ?? []).some((r) => r.status === "incoming" || r.status === "matching") && (
                <button
                  onClick={handleBulkWon}
                  disabled={quickBusy}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 transition-colors disabled:opacity-40"
                  title="Markera alla aktiva förfrågningar som ska faktureras"
                >
                  ✓ Ska faktureras
                </button>
              )}
              {/* Snabbval: Nej */}
              {(company.requests ?? []).some((r) => ["incoming", "matching", "won"].includes(r.status)) && (
                <button
                  onClick={() => setQuickAction(quickAction === "nej" ? null : "nej")}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  title="Stäng alla öppna förfrågningar"
                >
                  ✕ Nej
                </button>
              )}
              {company.followUpDate && (
                <button
                  onClick={handleClearFollowUp}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-muted transition-colors"
                >
                  Ta bort återkomst
                </button>
              )}
              <button
                onClick={() => setFollowUpOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <CalendarClock className="h-3 w-3" />
                {company.followUpDate ? "Ändra" : "Återkom"}
              </button>
            </div>
          </div>

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

        <div className="rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="h-3 w-3" /> Senaste avslutsdatum
          </span>
          <p className="text-sm font-medium text-nordic-800">
            {lastClosed ? format(new Date(lastClosed), "d MMM yyyy", { locale: sv }) : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
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
