"use client";

// Svar-panelen i Min dag: inkommande iMessage/SMS som Mac-agenten läst in ur
// chat.db (endast kända CRM-nummer). Ett kort per avsändare (senaste svaret).
// Härifrån: öppna JA-flödet (uthyrare), uthyrarkortet/företaget, svara direkt
// eller markera läst. Hela panelen är fällbar (läget sparas i localStorage).
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { OwnerQuickDialog } from "./OwnerQuickDialog";
import { PublishFlowDialog } from "./PublishFlowDialog";

export interface InboxRow {
  id: string;
  fromPhone: string;
  body: string;
  service: string | null;
  sentAt: string;
  isRead: boolean;
  ownerId: string | null;
  contactId: string | null;
  companyId: string | null;
  ownerName: string | null;
  contactName: string | null;
  companyName: string | null;
  repliedTo: { body: string; sentAt: string | null } | null;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function RepliesPanel({ onDraftCreated }: { onDraftCreated?: () => void }) {
  const router = useRouter();
  const { data, mutate } = useSWR<InboxRow[]>("/api/crm/inbox?unread=1", swrFetcher, { refreshInterval: 15000 });
  const rows = data ?? [];
  const [publishFor, setPublishFor] = useState<InboxRow | null>(null);
  const [ownerCardFor, setOwnerCardFor] = useState<InboxRow | null>(null);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  // Hela panelen fällbar — läget minns mellan sidladdningar.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("crm_replies_collapsed") === "1") setCollapsed(true);
  }, []);
  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("crm_replies_collapsed", next ? "1" : "0");
      return next;
    });
  }

  // Ett kort per avsändare: senaste olästa visas, resten prickas av i klump.
  // Hela tråden finns på uthyrarsidan/i Messages — Min dag ska bara visa "senaste läget".
  const groups = useMemo(() => {
    const byPhone = new Map<string, { latest: InboxRow; ids: string[] }>();
    for (const r of rows) {
      const g = byPhone.get(r.fromPhone);
      if (g) g.ids.push(r.id);
      else byPhone.set(r.fromPhone, { latest: r, ids: [r.id] }); // rows är sorterade nyast först
    }
    return [...byPhone.values()];
  }, [rows]);

  if (groups.length === 0) return null;

  async function markRead(ids: string[]) {
    try {
      await Promise.all(
        ids.map((id) =>
          crmFetchJson(`/api/crm/inbox/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          }),
        ),
      );
      mutate();
    } catch (e) {
      toast({ title: "Kunde inte markera som läst", description: crmErrorMessage(e), variant: "destructive" });
    }
  }

  // Skickar direkt (köas → Mac-agenten skickar inom ~30 s, aldrig 21–08) och
  // markerar HELA avsändarens olästa som hanterade — ett klick, klart.
  async function sendReply(row: InboxRow, ids: string[]) {
    if (!replyText.trim() || busy) return;
    setBusy(true);
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: row.fromPhone,
          body: replyText.trim(),
          ownerId: row.ownerId ?? undefined,
          contactId: row.contactId ?? undefined,
        }),
      });
      setReplyFor(null);
      setReplyText("");
      await markRead(ids).catch(() => undefined); // svaret är viktigast — läst-markeringen får inte stoppa flödet
      toast({ title: "Svar skickas inom ~30 sek via Messages" });
    } catch (e) {
      toast({ title: "Kunde inte skicka", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  const btn = "text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40 transition-colors";

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      <button
        onClick={toggleCollapsed}
        className="flex items-center gap-2 w-full text-left"
        aria-expanded={!collapsed}
        title={collapsed ? "Visa svar" : "Fäll ihop"}
      >
        <ChevronDown className={`h-4 w-4 text-blue-800 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        <span>💬</span>
        <h2 className="text-sm font-semibold text-nordic-900">Svar</h2>
        <span className="text-xs font-bold text-blue-800 bg-blue-100 rounded-full px-2 py-0.5">{groups.length}</span>
        <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline">
          {collapsed
            ? "Klicka för att visa"
            : "Inkommande SMS från kända kontakter — läses in automatiskt från din Mac"}
        </span>
      </button>
      <div className={`space-y-2 ${collapsed ? "hidden" : "mt-3"}`}>
        {groups.map(({ latest: r, ids }) => {
          const who = r.ownerName
            ? `${r.ownerName} · uthyrare`
            : r.companyName
              ? `${r.contactName ?? r.companyName} · ${r.companyName}`
              : formatPhoneSv(r.fromPhone);
          return (
            <div key={r.id} className="rounded-lg bg-white border p-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-medium text-sm">{who}</span>
                <span className="text-[11px] text-muted-foreground ml-auto">{timeLabel(r.sentAt)}</span>
              </div>
              {r.repliedTo && (
                <p
                  className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1"
                  title={r.repliedTo.body}
                >
                  ↳ Svar på ditt SMS{r.repliedTo.sentAt ? ` ${r.repliedTo.sentAt.slice(5, 16)}` : ""}: ”{r.repliedTo.body}”
                </p>
              )}
              <p className="text-sm text-nordic-800 mt-1 whitespace-pre-wrap break-words line-clamp-4">{r.body}</p>
              {ids.length > 1 && (
                <button
                  className="text-[11px] text-muted-foreground italic mt-0.5 underline decoration-dotted"
                  onClick={() => {
                    if (r.ownerId) router.push(`/crm/uthyrare/${r.ownerId}`);
                    else if (r.companyId) router.push(`/crm/company/${r.companyId}`);
                  }}
                  title="Hela tråden finns på uthyrarsidan"
                >
                  +{ids.length - 1} äldre {ids.length - 1 === 1 ? "oläst" : "olästa"} — se hela tråden
                </button>
              )}
              <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-dashed">
                {r.ownerId && (
                  <button
                    className="text-[11px] px-2 py-0.5 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold transition-colors"
                    onClick={() => setPublishFor(r)}
                  >
                    🚀 Publicera & länka
                  </button>
                )}
                {r.ownerId && (
                  <button className={btn} onClick={() => setOwnerCardFor(r)}>
                    👤 Uthyrarkort
                  </button>
                )}
                {r.companyId && (
                  <button className={btn} onClick={() => router.push(`/crm/company/${r.companyId}`)}>
                    Öppna företag
                  </button>
                )}
                <button
                  className={btn}
                  onClick={() => {
                    setReplyFor(replyFor === r.id ? null : r.id);
                    setReplyText("");
                  }}
                >
                  ↩ Svara
                </button>
                <button className={btn} onClick={() => markRead(ids)}>
                  ✓ Läst{ids.length > 1 ? ` (${ids.length})` : ""}
                </button>
              </div>
              {replyFor === r.id && (
                <div className="mt-2 space-y-1.5">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder={`Svar till ${who}…`}
                    className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <div className="flex gap-1.5">
                    <button
                      className="text-[11px] px-2 py-1 rounded border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold disabled:opacity-40 transition-colors"
                      disabled={busy || !replyText.trim()}
                      onClick={() => sendReply(r, ids)}
                    >
                      Skicka
                    </button>
                    <button className={btn} onClick={() => setReplyFor(null)}>
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {publishFor && (
        <PublishFlowDialog
          ownerId={publishFor.ownerId!}
          ownerName={publishFor.ownerName}
          ownerPhone={publishFor.fromPhone}
          open
          onOpenChange={(o) => {
            if (!o) setPublishFor(null);
          }}
          onDrafted={onDraftCreated}
        />
      )}
      {ownerCardFor && (
        <OwnerQuickDialog
          ownerId={ownerCardFor.ownerId!}
          open
          onOpenChange={(o) => {
            if (!o) setOwnerCardFor(null);
          }}
        />
      )}
    </div>
  );
}
