"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { Property } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const REQ_STATUS: Record<string, string> = {
  incoming: "Inkommen",
  matching: "Matchar",
  won: "Vunnen",
  invoiced: "Fakturerad",
  lost: "Nej tack",
  archived: "Arkiverad",
};
const MATCH_STATUS: Record<string, string> = {
  suggested: "Förslag",
  sent: "Skickad",
  accepted: "Accepterad",
  rejected: "Avböjd",
};

const CHANNELS = [
  { value: "samtal", label: "📞 Samtal" },
  { value: "mejl", label: "📧 Mejl" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "messenger", label: "💬 Messenger" },
  { value: "sms", label: "✉️ SMS" },
  { value: "annat", label: "📝 Annat" },
];

const FOLLOWUP_REASONS = ["Kolla pris", "Tillgänglighet", "Nyckelvisning", "Få bilder", "Bekräfta antal bäddar"];
const FIELD_CLS = "w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function PropertyHistory({
  property,
  onUpdate,
}: {
  property: Property;
  onUpdate: (data: Partial<Property>) => Promise<void>;
}) {
  const propertyId = property.id;
  const { data: history = [] } = useSWR<MatchRow[]>(`/api/crm/properties/${propertyId}/matches`, fetcher);
  const { data: notes = [], mutate } = useSWR<Note[]>(`/api/crm/properties/${propertyId}/notes`, fetcher);

  const [channel, setChannel] = useState("samtal");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Följ upp uthyrare (sammanslaget med kontaktloggen)
  const [date, setDate] = useState(property.ownerFollowUpDate ?? "");
  const [reason, setReason] = useState(property.ownerFollowUpReason ?? "");
  const [fuNote, setFuNote] = useState(property.ownerFollowUpNote ?? "");
  const [fuSaving, setFuSaving] = useState(false);

  useEffect(() => {
    setDate(property.ownerFollowUpDate ?? "");
    setReason(property.ownerFollowUpReason ?? "");
    setFuNote(property.ownerFollowUpNote ?? "");
  }, [property.id, property.ownerFollowUpDate, property.ownerFollowUpReason, property.ownerFollowUpNote]);

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
    try {
      const res = await fetch(`/api/crm/property-notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: "Borttagen" });
    } catch {
      toast({ title: "Kunde inte ta bort", variant: "destructive" });
    }
  }

  async function saveFollowUp() {
    setFuSaving(true);
    await onUpdate({
      ownerFollowUpDate: date || null,
      ownerFollowUpReason: reason.trim() || null,
      ownerFollowUpNote: fuNote.trim() || null,
    });
    setFuSaving(false);
    toast({ title: "Uppföljning sparad" });
  }

  async function clearFollowUp() {
    setFuSaving(true);
    setDate("");
    setReason("");
    setFuNote("");
    await onUpdate({ ownerFollowUpDate: null, ownerFollowUpReason: null, ownerFollowUpNote: null });
    setFuSaving(false);
    toast({ title: "Uppföljning rensad" });
  }

  return (
    <div className="space-y-5">
      {/* Nästa uppföljning av uthyrare */}
      <div className="space-y-2">
        <p className="text-xs text-amber-800 uppercase tracking-wide font-medium">Nästa uppföljning</p>
        <p className="text-[11px] text-amber-800/80 -mt-1">För sourcing/relationsvård — funkar även utan aktiv förfrågan.</p>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Datum">
            <input type="date" className={FIELD_CLS} value={date} onChange={(e) => setDate(e.target.value)} />
          </Labeled>
          <Labeled label="Anledning">
            <input className={FIELD_CLS} placeholder="T.ex. Kolla pris" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Labeled>
        </div>
        <div className="flex flex-wrap gap-1">
          {FOLLOWUP_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
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
          placeholder="Anteckning (valfri)"
          value={fuNote}
          onChange={(e) => setFuNote(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          {property.ownerFollowUpDate && (
            <Button variant="ghost" size="sm" onClick={clearFollowUp} disabled={fuSaving}>
              Rensa
            </Button>
          )}
          <Button size="sm" onClick={saveFollowUp} disabled={fuSaving || !date}>
            {fuSaving ? "Sparar…" : "Spara uppföljning"}
          </Button>
        </div>
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

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
