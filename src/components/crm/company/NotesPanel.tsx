"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Note } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const CHANNELS = [
  { value: "samtal", label: "Samtal" },
  { value: "mejl", label: "Mejl" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "möte", label: "Möte" },
  { value: "annat", label: "Annat" },
];

const CHANNEL_ICONS: Record<string, string> = {
  samtal: "📞",
  mejl: "📧",
  whatsapp: "💬",
  möte: "🤝",
  annat: "📝",
};

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
        {part}
      </a>
    ) : (
      part
    )
  );
}

interface Props {
  notes: Note[];
  companyId: string;
  onAdd: (channel: string, content: string) => Promise<void>;
}

export function NotesPanel({ notes, companyId, onAdd }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [channel, setChannel] = useState("samtal");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );
  const latest = sorted[0];
  const rest = sorted.slice(1);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await onAdd(channel, content.trim());
    setContent("");
    setSaving(false);
  }

  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
        Anteckningar
      </span>

      {/* New note form */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => (
                <SelectItem key={c.value} value={c.value} className="text-xs">
                  {CHANNEL_ICONS[c.value]} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <textarea
          className="w-full text-sm border rounded-lg px-3 py-2 min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Skriv en anteckning…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
          }}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={!content.trim() || saving}>
            Spara (⌘↵)
          </Button>
        </div>
      </div>

      {/* Latest note */}
      {latest && (
        <div className="bg-white rounded-lg border p-3 text-sm mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{CHANNEL_ICONS[latest.channel] ?? "📝"} {latest.channel}</span>
            <span>·</span>
            <span>
              {latest.createdAt
                ? format(new Date(latest.createdAt), "d MMM yyyy HH:mm", { locale: sv })
                : ""}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-nordic-900">{linkify(latest.content)}</p>
        </div>
      )}

      {/* Expanded history */}
      {rest.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 mb-2"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Dölj" : `Visa ${rest.length} till`}
          </Button>

          {expanded && (
            <div className="space-y-2">
              {rest.map((note) => (
                <div key={note.id} className="bg-white rounded-lg border p-3 text-sm opacity-75">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>{CHANNEL_ICONS[note.channel] ?? "📝"} {note.channel}</span>
                    <span>·</span>
                    <span>
                      {note.createdAt
                        ? format(new Date(note.createdAt), "d MMM yyyy HH:mm", { locale: sv })
                        : ""}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{linkify(note.content)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Inga anteckningar ännu.</p>
      )}
    </div>
  );
}
