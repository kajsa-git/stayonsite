"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { OwnerOutreach, Property } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/crm/fetcher";
import { REQUEST_STATUS_LABEL as REQ_STATUS } from "@/lib/crm/request-status";

interface MatchRow {
  id: string;
  matchStatus: string;
  sentAt: string | null;
  offerRentOut: number | null;
  requestNumber: number | null;
  requestStatus: string;
  companyName: string;
  city: string | null;
}

interface Note {
  id: string;
  channel: string;
  content: string;
  createdAt: string | null;
}

const fetcher = swrFetcher;

const MATCH_STATUS: Record<string, string> = {
  suggested: "Förslag",
  sent: "Skickad",
  withdrawn: "Tillbakadraget",
  accepted: "Accepterad",
  rejected: "Avböjd",
};

// Samma härledning som i matchningsvyn: villkor stämplas bara vid skick, så
// stämplade villkor utan sentAt = tillbakadraget erbjudande.
function matchDisplayStatus(h: MatchRow): string {
  return h.matchStatus === "suggested" && h.offerRentOut != null && !h.sentAt ? "withdrawn" : h.matchStatus;
}

// Kontaktrunda-pipeline mot uthyrare.
const OPEN_STEPS: { value: string; label: string }[] = [
  { value: "ej_kontaktad", label: "Ej kontaktad" },
  { value: "kontaktad", label: "Kontaktad" },
  { value: "i_dialog", label: "I dialog" },
];
const STATUS_LABEL: Record<string, string> = {
  ej_kontaktad: "Ej kontaktad",
  kontaktad: "Kontaktad",
  i_dialog: "I dialog",
  bekraftad: "Bekräftad",
  nej: "Nej",
};
const STATUS_BADGE: Record<string, string> = {
  ej_kontaktad: "bg-nordic-100 text-nordic-600 border-nordic-200",
  kontaktad: "bg-amber-100 text-amber-800 border-amber-300",
  i_dialog: "bg-blue-100 text-blue-800 border-blue-300",
  bekraftad: "bg-green-100 text-green-800 border-green-300",
  nej: "bg-rose-100 text-rose-700 border-rose-300",
};
const TERMINAL = ["bekraftad", "nej"];
const isOpen = (s: string) => !TERMINAL.includes(s);

// "Anteckning" först och FÖRVALD (samma princip som företagskortets anteckningar):
// en snabbnotis ska inte råka loggas som samtal — kontaktkanal väljs aktivt.
const CHANNELS = [
  { value: "anteckning", label: "Anteckning" },
  { value: "samtal", label: "Samtal" },
  { value: "mejl", label: "Mejl" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "messenger", label: "Messenger" },
  { value: "sms", label: "SMS" },
  { value: "annat", label: "Annat" },
];

const FOLLOWUP_REASONS = ["Kolla pris", "Tillgänglighet", "Nyckelvisning", "Få bilder", "Bekräfta antal bäddar"];
const FIELD_CLS = "w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function PropertyHistory({ property }: { property: Property }) {
  const propertyId = property.id;
  const { data: history = [] } = useSWR<MatchRow[]>(`/api/crm/properties/${propertyId}/matches`, fetcher);
  const { data: notes = [], mutate } = useSWR<Note[]>(`/api/crm/properties/${propertyId}/notes`, fetcher);
  const { data: rounds = [], mutate: mutateRounds } = useSWR<OwnerOutreach[]>(
    `/api/crm/properties/${propertyId}/outreach`,
    fetcher,
  );

  const [channel, setChannel] = useState("anteckning");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const openRound = rounds.find((r) => isOpen(r.status)) ?? null;
  const concluded = rounds.filter((r) => TERMINAL.includes(r.status));

  async function patchRound(id: string, patch: Partial<OwnerOutreach>, successMsg?: string) {
    const res = await fetch(`/api/crm/outreach/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast({ title: "Kunde inte spara", variant: "destructive" });
      return;
    }
    mutateRounds();
    if (successMsg) toast({ title: successMsg });
  }

  async function startRound() {
    const res = await fetch(`/api/crm/properties/${propertyId}/outreach`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!res.ok) {
      toast({ title: "Kunde inte starta", variant: "destructive" });
      return;
    }
    mutateRounds();
    toast({ title: "Uthyrarkontakt startad" });
  }

  async function deleteRound(id: string) {
    if (!window.confirm("Ta bort den här uthyrarkontakten? Detta går inte att ångra.")) return;
    const res = await fetch(`/api/crm/outreach/${id}`, { method: "DELETE" });
    if (res.ok) {
      mutateRounds();
      toast({ title: "Borttagen" });
    } else {
      toast({ title: "Kunde inte ta bort", variant: "destructive" });
    }
  }

  async function addNote() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/properties/${propertyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, content: content.trim() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setContent("");
      mutate();
      toast({ title: "Kontakt loggad" });
    } catch {
      toast({ title: "Kunde inte spara kontakten", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeNote(id: string) {
    if (!window.confirm("Ta bort den här loggposten? Detta går inte att ångra.")) return;
    try {
      const res = await fetch(`/api/crm/property-notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: "Borttagen" });
    } catch {
      toast({ title: "Kunde inte ta bort", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Uthyrarkontakt */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Uthyrarkontakt</h3>
          {!openRound && (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={startRound}>
              <Plus className="h-3 w-3" /> Ny uthyrarkontakt
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Håll koll på nästa kontakt med uthyraren.</p>

        {openRound ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pågående</p>
            <OpenRoundCard round={openRound} onPatch={patchRound} onDelete={deleteRound} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Ingen pågående kontakt. Starta en när du ska höra av dig till uthyraren.</p>
        )}

        {/* Avslutade */}
        {concluded.length > 0 && (
          <details className="pt-1">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Avslutade kontakter ({concluded.length})</summary>
            <div className="mt-3 flex flex-col gap-2">
            {concluded.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-sm group">
                <span className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border ${STATUS_BADGE[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground">
                    {r.concludedAt ? format(new Date(r.concludedAt), "d MMM yyyy", { locale: sv }) : ""}
                  </span>
                  {r.note && <span className="block text-nordic-800 whitespace-pre-wrap">{r.note}</span>}
                </span>
                <button
                  onClick={() => deleteRound(r.id)}
                  className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-700 shrink-0"
                  title="Ta bort"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            </div>
          </details>
        )}
      </div>

      {/* Kontaktlogg */}
      <section className="flex flex-col gap-3 border-t pt-5" aria-label="Kontaktlogg">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold">Kontaktlogg</h3>
          <span className="text-xs text-muted-foreground">{notes.length} {notes.length === 1 ? "post" : "poster"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Kontaktkanal" className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }}
            placeholder="Skriv en anteckning…"
            aria-label="Ny kontaktanteckning"
            className="h-10 min-w-[12rem] flex-1 rounded-md border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <Button variant="outline" onClick={addNote} disabled={!content.trim() || saving}>{saving ? "Sparar…" : "Logga"}</Button>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen kontakt loggad ännu.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.slice(0, showAllNotes ? undefined : 2).map((note) => <NoteEntry key={note.id} note={note} onRemove={removeNote} />)}
            {notes.length > 2 && <button type="button" onClick={() => setShowAllNotes((value) => !value)} className="self-start text-sm font-medium text-primary-600 hover:underline" aria-expanded={showAllNotes}>
              {showAllNotes ? "Visa färre loggposter" : `Visa alla ${notes.length} loggposter`}
            </button>}
          </div>
        )}
      </section>

      <details className="border-t pt-5">
        <summary className="cursor-pointer text-sm font-semibold">Förfrågningshistorik ({history.length})</summary>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Objektet har inte föreslagits ännu.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {history.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                <span>#{h.requestNumber} {h.companyName}{h.city && <span className="text-muted-foreground"> · {h.city}</span>}</span>
                <span className="text-xs text-muted-foreground">{MATCH_STATUS[matchDisplayStatus(h)] ?? h.matchStatus} · {REQ_STATUS[h.requestStatus] ?? h.requestStatus}</span>
              </div>
            ))}
          </div>
        )}
      </details>
    </div>
  );
}

function NoteEntry({ note, onRemove }: { note: Note; onRemove: (id: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const long = note.content.length > 200 || note.content.split("\n").length > 4;
  return (
    <article className="rounded-lg bg-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{CHANNELS.find((c) => c.value === note.channel)?.label ?? note.channel}{note.createdAt ? ` · ${format(new Date(note.createdAt), "d MMM yyyy HH:mm", { locale: sv })}` : ""}</span>
        <button type="button" onClick={() => onRemove(note.id)} className="flex size-7 shrink-0 items-center justify-center rounded hover:bg-red-50 hover:text-red-700" aria-label="Ta bort loggpost" title="Ta bort loggpost"><Trash2 className="size-3.5" /></button>
      </div>
      <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${long && !expanded ? "line-clamp-3" : ""}`}>{note.content}</p>
      {long && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 text-sm font-medium text-primary-600 hover:underline" aria-expanded={expanded}>{expanded ? "Visa mindre" : "Visa hela anteckningen"}</button>}
    </article>
  );
}

function OpenRoundCard({
  round,
  onPatch,
  onDelete,
}: {
  round: OwnerOutreach;
  onPatch: (id: string, patch: Partial<OwnerOutreach>, successMsg?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [date, setDate] = useState(round.nextFollowUpDate ?? "");
  const [time, setTime] = useState(round.nextFollowUpTime ?? "");
  const [reason, setReason] = useState(round.nextFollowUpReason ?? "");
  const [note, setNote] = useState(round.note ?? "");

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4">
      {/* Pipeline: öppna steg */}
      <div className="flex flex-wrap gap-1">
        {OPEN_STEPS.map((step) => (
          <button
            key={step.value}
            type="button"
            onClick={() => onPatch(round.id, { status: step.value }, `Status: ${step.label}`)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              round.status === step.value
                ? "bg-amber-200 border-amber-300 text-amber-900 font-medium"
                : "bg-white border-input text-muted-foreground hover:bg-amber-50"
            }`}
          >
            {step.label}
          </button>
        ))}
        <span className="mx-1 self-center text-muted-foreground">→</span>
        <button
          type="button"
          onClick={() => onPatch(round.id, { status: "bekraftad", note: note.trim() || null }, "Bekräftad — avslutad")}
          className="text-xs px-2.5 py-1 rounded-full border border-green-300 bg-white text-green-800 hover:bg-green-50 inline-flex items-center gap-1"
        >
          <Check className="h-3 w-3" /> Bekräftad
        </button>
        <button
          type="button"
          onClick={() => onPatch(round.id, { status: "nej", note: note.trim() || null }, "Nej — avslutad")}
          className="text-xs px-2.5 py-1 rounded-full border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1"
        >
          <X className="h-3 w-3" /> Nej
        </button>
      </div>

      {/* Nästa uppföljning */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`follow-up-date-${round.id}`} className="text-xs font-medium text-muted-foreground">Nästa uppföljning</label>
          <input
            id={`follow-up-date-${round.id}`}
            type="date"
            className={FIELD_CLS}
            value={date}
            onChange={(e) => { setDate(e.target.value); if (!e.target.value) setTime(""); onPatch(round.id, { nextFollowUpDate: e.target.value || null }); }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`follow-up-time-${round.id}`} className="text-xs font-medium text-muted-foreground">Tid</label>
          <input
            id={`follow-up-time-${round.id}`}
            type="time"
            className={FIELD_CLS}
            value={time}
            disabled={!date}
            onChange={(e) => { setTime(e.target.value); onPatch(round.id, { nextFollowUpTime: e.target.value || null }); }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`follow-up-reason-${round.id}`} className="text-xs font-medium text-muted-foreground">Anledning</label>
          <input
            id={`follow-up-reason-${round.id}`}
            className={FIELD_CLS}
            placeholder="T.ex. Kolla pris"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => onPatch(round.id, { nextFollowUpReason: reason.trim() || null })}
          />
        </div>
      </div>
      <details>
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Snabbval för anledning</summary>
        <div className="mt-2 flex flex-wrap gap-1">
        {FOLLOWUP_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setReason(r); onPatch(round.id, { nextFollowUpReason: r }); }}
            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
              reason === r ? "bg-amber-200 border-amber-300 text-amber-900" : "bg-white border-input text-muted-foreground hover:bg-amber-100"
            }`}
          >
            {r}
          </button>
        ))}
        </div>
      </details>

      <textarea
        className={`${FIELD_CLS} min-h-[44px] resize-y`}
        placeholder="Anteckning (sparas på kontakten)"
        aria-label="Anteckning på uthyrarkontakten"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => onPatch(round.id, { note: note.trim() || null })}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Startad {round.startedAt ? format(new Date(round.startedAt), "d MMM yyyy", { locale: sv }) : "—"}
        </span>
        <button onClick={() => onDelete(round.id)} className="text-[11px] text-muted-foreground hover:text-red-700 inline-flex items-center gap-1">
          <Trash2 className="h-3 w-3" /> Ta bort
        </button>
      </div>
    </div>
  );
}
