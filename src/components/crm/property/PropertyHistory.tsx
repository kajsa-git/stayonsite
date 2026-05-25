"use client";

import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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

export function PropertyHistory({ propertyId }: { propertyId: string }) {
  const { data: history = [] } = useSWR<MatchRow[]>(`/api/crm/properties/${propertyId}/matches`, fetcher);
  const { data: notes = [], mutate } = useSWR<Note[]>(`/api/crm/properties/${propertyId}/notes`, fetcher);

  const [channel, setChannel] = useState("samtal");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!content.trim()) return;
    setSaving(true);
    await fetch(`/api/crm/properties/${propertyId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, content: content.trim() }),
    });
    setContent("");
    setSaving(false);
    mutate();
  }

  async function removeNote(id: string) {
    await fetch(`/api/crm/property-notes/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="space-y-5">
      {/* Förfrågningshistorik */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
          Förfrågningshistorik ({history.length})
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Objektet har inte föreslagits ännu.</p>
        ) : (
          <div className="space-y-1.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-2 text-sm border rounded-lg px-2.5 py-1.5">
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

      {/* Kontaktlogg */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Kontaktlogg (uthyrare)</p>
        <div className="flex gap-2 mb-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }}
            placeholder="T.ex. 'Frågat om tillgänglighet 25 maj'"
            className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button onClick={addNote} disabled={!content.trim() || saving} className="text-xs px-2.5 rounded-md border border-input hover:bg-muted disabled:opacity-40">
            Spara
          </button>
        </div>
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
      </div>
    </div>
  );
}
