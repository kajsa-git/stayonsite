"use client";

// Nya avsändare från kända företag: okända adresser på ett kunddomän som mejlsynken
// hittat. Administration, inte brådskande — därför här på Företag-sidan, hopfällt till
// en rad, och inte i Min dag. Koppla = ny kontakt på företaget (+ trådarna hämtas
// direkt); Ignorera = adressen föreslås aldrig igen.
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

export interface SenderSuggestionRow {
  id: string;
  email: string;
  name: string | null;
  domain: string;
  messageCount: number;
  lastSubject: string | null;
  lastSnippet: string | null;
  lastSeenAt: string;
  companies: { id: string; name: string }[];
}

export const SENDER_SUGGESTIONS_ANCHOR = "nya-avsandare";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", month: "short", day: "numeric" });
}

export function SenderSuggestionsPanel() {
  const { data, mutate } = useSWR<SenderSuggestionRow[]>("/api/crm/emails/sender-suggestions", swrFetcher);
  const rows = data ?? [];
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // Länken från Min dag öppnar panelen direkt.
  useEffect(() => {
    if (window.location.hash === `#${SENDER_SUGGESTIONS_ANCHOR}`) setOpen(true);
  }, []);

  if (rows.length === 0) return null;

  async function resolve(s: SenderSuggestionRow, action: "link" | "ignore") {
    const companyId = chosen[s.id] ?? s.companies[0]?.id;
    setBusy(s.id);
    try {
      const result = await crmFetchJson<{ synced?: number; syncError?: string }>(`/api/crm/emails/sender-suggestions/${s.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "link" ? { action, companyId } : { action }),
      });
      await mutate();
      if (action === "link") {
        const company = s.companies.find((c) => c.id === companyId)?.name ?? "företaget";
        toast({
          title: `${s.name ?? s.email} är nu kontakt på ${company}`,
          description: result.syncError ? "Mejlen hämtas vid nästa synk." : result.synced ? `${result.synced} mejl kopplade till kortet.` : undefined,
        });
      }
    } catch (e) {
      toast({ title: "Kunde inte spara", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  const btn = "text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40 transition-colors";

  return (
    <div id={SENDER_SUGGESTIONS_ANCHOR} className="mb-4 rounded-xl border border-dashed border-nordic-300 bg-white p-3">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 w-full text-left" aria-expanded={open}>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
        <span className="text-sm font-medium text-nordic-900">Nya avsändare från kända företag</span>
        <span className="text-xs font-bold text-nordic-700 bg-nordic-100 rounded-full px-2 py-0.5">{rows.length}</span>
        <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline">
          Personer som mejlat från en kunds domän men inte finns som kontakt
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {rows.map((s) => {
            const selected = chosen[s.id] ?? s.companies[0]?.id;
            return (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-medium text-sm">{s.name ?? s.email}</span>
                  {s.name && <span className="text-xs text-muted-foreground">{s.email}</span>}
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {s.messageCount > 1 ? `${s.messageCount} mejl · ` : ""}senast {timeLabel(s.lastSeenAt)}
                  </span>
                </div>
                {s.lastSubject && <p className="text-sm text-nordic-900 mt-0.5 truncate">{s.lastSubject}</p>}
                {s.lastSnippet && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">{s.lastSnippet}</p>}
                <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-dashed">
                  {s.companies.length > 1 && (
                    <select
                      aria-label="Välj företag"
                      className="text-[11px] h-6 rounded border border-input bg-white px-1"
                      value={selected}
                      onChange={(e) => setChosen((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    >
                      {s.companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                  <button
                    className="text-[11px] px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold disabled:opacity-40 transition-colors"
                    disabled={busy === s.id || !selected}
                    onClick={() => resolve(s, "link")}
                  >
                    {s.companies.length > 1 ? "Koppla som kontakt" : `Koppla till ${s.companies[0]?.name}`}
                  </button>
                  <button className={btn} disabled={busy === s.id} onClick={() => resolve(s, "ignore")}>
                    Ignorera
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
