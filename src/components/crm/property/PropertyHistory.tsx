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
  accepted: "Accepterad",
  rejected: "Avböjd",
};

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

const CHANNELS = [
  { value: "samtal", label: "📞 Samtal" },
  { value: "mejl", label: "📧 Mejl" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "messenger", label: "💬 Messenger" },
  { value: "sms", label: "✉️ SMS" },
  { value: "annat", label: "📝 Annat" },
  // Ren anteckning på objektet — ingen kontakt har skett (Kajsas önskan 2026-08-01).
  { value: "anteckning", label: "🗒 Anteckning" },
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

  const [channel, setChannel] = useState("samtal");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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
    <div className="space-y-5">
      {/* Uthyrarkontakt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-amber-800 uppercase tracking-wide font-medium">Uthyrarkontakt</p>
          {!openRound && (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={startRound}>
              <Plus className="h-3 w-3" /> Ny uthyrarkontakt
            </Button>
          )}
        </div>
        <p className="text-[11px] text-amber-800/80 -mt-1">Bekräfta med uthyraren: pris, tillgänglighet, vill hyra ut?</p>

        {openRound ? (
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Pågående</p>
            <OpenRoundCard round={openRound} onPatch={patchRound} onDelete={deleteRound} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Ingen pågående kontakt. Starta en när du ska höra av dig till uthyraren.</p>
        )}

        {/* Avslutade */}
        {concluded.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Avslutade</p>
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
        )}
      </div>

      {/* Kontaktlogg */}
      <div className="border-t border-amber-200 pt-4">
        <p className="text-xs text-amber-800 uppercase tracking-wide font-medium mb-1.5">Kontaktlogg</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {CHANNELS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setChannel(c.value)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                channel === c.value
                  ? "border-amber-300 bg-amber-100 text-amber-900"
                  : "border-input bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }}
            placeholder="T.ex. 'Frågat om tillgänglighet 25 maj'"
            className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button onClick={addNote} disabled={!content.trim() || saving} className="text-xs px-2.5 rounded-md border border-input hover:bg-muted disabled:opacity-40">
            {saving ? "Sparar…" : "Logga"}
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Ingen kontakt loggad ännu.</p>
        ) : (
          <div className="space-y-1.5">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-sm group">
                <span className="text-xs text-muted-foreground shrink-0 min-w-[88px] pt-0.5">
                  {n.createdAt ? format(new Date(n.createdAt), "d MMM HH:mm", { locale: sv }) : ""}
                </span>
                <span className="flex-1 whitespace-pre-wrap">{n.content}</span>
                <button onClick={() => removeNote(n.id)} className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-700 shrink-0">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Förfrågningshistorik */}
      <div className="border-t border-amber-200 pt-4">
        <p className="text-xs text-amber-800 uppercase tracking-wide font-medium mb-1.5">
          Förfrågningshistorik ({history.length})
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Objektet har inte föreslagits ännu.</p>
        ) : (
          <div className="space-y-1.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-2 text-sm border rounded-lg px-2.5 py-1.5 bg-white">
                <span className="truncate">
                  #{h.requestNumber} {h.companyName}
                  {h.city && <span className="text-muted-foreground"> · {h.city}</span>}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {MATCH_STATUS[h.matchStatus] ?? h.matchStatus} · {REQ_STATUS[h.requestStatus] ?? h.requestStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
  const [reason, setReason] = useState(round.nextFollowUpReason ?? "");
  const [note, setNote] = useState(round.note ?? "");

  return (
    <div className="rounded-lg border bg-white p-3 space-y-3">
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
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Nästa uppföljning</label>
          <input
            type="date"
            className={FIELD_CLS}
            value={date}
            onChange={(e) => { setDate(e.target.value); onPatch(round.id, { nextFollowUpDate: e.target.value || null }); }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Anledning</label>
          <input
            className={FIELD_CLS}
            placeholder="T.ex. Kolla pris"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => onPatch(round.id, { nextFollowUpReason: reason.trim() || null })}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
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

      <textarea
        className={`${FIELD_CLS} min-h-[44px] resize-y`}
        placeholder="Anteckning (sparas på kontakten)"
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
