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
import { Check, ChevronDown, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

const CHANNELS = [
  { value: "samtal", label: "Samtal" },
  { value: "mejl", label: "Mejl" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "messenger", label: "Messenger" },
  { value: "sms", label: "SMS" },
  { value: "möte", label: "Möte" },
  { value: "annat", label: "Annat" },
];

const CHANNEL_ICONS: Record<string, string> = {
  samtal: "📞",
  mejl: "📧",
  whatsapp: "💬",
  messenger: "💬",
  sms: "✉️",
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
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function NoteItem({
  note,
  onUpdate,
  onDelete,
  dimmed,
}: {
  note: Note;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  dimmed?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === note.content) {
      setEditing(false);
      setDraft(note.content);
      return;
    }
    setBusy(true);
    await onUpdate(note.id, trimmed);
    setBusy(false);
    setEditing(false);
  }

  return (
    <div className={`bg-white rounded-lg border p-3 text-sm group ${dimmed ? "opacity-75" : ""}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span>{CHANNEL_ICONS[note.channel] ?? "📝"} {note.channel}</span>
        <span>·</span>
        <span>
          {note.createdAt
            ? format(new Date(note.createdAt), "d MMM yyyy HH:mm", { locale: sv })
            : ""}
        </span>

        {!editing && (
          <div className="ml-auto flex items-center gap-1">
            {confirmDelete ? (
              <>
                <span className="text-destructive">Ta bort?</span>
                <button
                  className="h-5 w-5 flex items-center justify-center text-destructive hover:bg-red-50 rounded"
                  title="Bekräfta"
                  onClick={async () => {
                    setBusy(true);
                    await onDelete(note.id);
                  }}
                  disabled={busy}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  className="h-5 w-5 flex items-center justify-center hover:bg-muted rounded"
                  title="Avbryt"
                  onClick={() => setConfirmDelete(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  className="h-5 w-5 flex items-center justify-center hover:bg-muted rounded"
                  title="Redigera"
                  onClick={() => {
                    setDraft(note.content);
                    setEditing(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  className="h-5 w-5 flex items-center justify-center text-destructive hover:bg-red-50 rounded"
                  title="Ta bort"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            className="w-full text-sm border rounded px-2 py-1.5 min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
              if (e.key === "Escape") {
                setEditing(false);
                setDraft(note.content);
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setEditing(false);
                setDraft(note.content);
              }}
            >
              Avbryt
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={save} disabled={busy || !draft.trim()}>
              Spara
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-nordic-900">{linkify(note.content)}</p>
      )}
    </div>
  );
}

export function NotesPanel({ notes, companyId, onAdd, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [channel, setChannel] = useState("samtal");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );
  const VISIBLE_COUNT = 5;
  const visible = sorted.slice(0, VISIBLE_COUNT);
  const rest = sorted.slice(VISIBLE_COUNT);

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
          <div className="flex flex-wrap gap-1">
            {CHANNELS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setChannel(c.value)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  channel === c.value
                    ? "border-primary-300 bg-primary-50 text-primary-800"
                    : "border-input bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {CHANNEL_ICONS[c.value]} {c.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="w-full text-sm border rounded-lg px-3 py-2 min-h-[160px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
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

      {/* Recent notes (latest 5, always visible) */}
      {visible.length > 0 && (
        <div className="space-y-2">
          {visible.map((note) => (
            <NoteItem key={note.id} note={note} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* Older history (collapsed) */}
      {rest.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 my-2"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Dölj äldre" : `Visa ${rest.length} äldre`}
          </Button>

          {expanded && (
            <div className="space-y-2">
              {rest.map((note) => (
                <NoteItem key={note.id} note={note} onUpdate={onUpdate} onDelete={onDelete} dimmed />
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
