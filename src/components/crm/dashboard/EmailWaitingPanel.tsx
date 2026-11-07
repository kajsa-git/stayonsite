"use client";

// Mejl-panelen i Min dag. Bakgrundssynken hämtar nya Gmail-mejl var 15:e minut och
// kopplar dem till företag och uthyrare; här syns trådar där kunden eller uthyraren
// skrev sist och du inte har svarat. Svarar du (här, på kortet eller direkt i Gmail)
// försvinner tråden av sig själv vid nästa synk. Under trådarna: okända avsändare på
// ett känt företags domän, att koppla som ny kontakt eller ignorera.
import { toast } from "@/components/ui/use-toast";
import { EmailComposeModal } from "@/components/crm/email/EmailComposeModal";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { OwnerQuickDialog } from "./OwnerQuickDialog";

export interface WaitingThreadRow {
  key: string;
  gmailThreadId: string | null;
  latestId: string;
  subject: string;
  fromEmail: string;
  fromName: string | null;
  preview: string;
  sentAt: string;
  messageCount: number;
  unreadIds: string[];
  companyId: string | null;
  companyName: string | null;
  contactName: string | null;
  ownerId: string | null;
  ownerName: string | null;
}

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

interface WaitingData {
  threads: WaitingThreadRow[];
  suggestions: SenderSuggestionRow[];
  status: { lastRunAt: string | null; lastSuccessAt: string | null; lastError: string | null };
}

function timeLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function replySubject(subject: string): string {
  return /^\s*(re|sv|aw|odp):/i.test(subject) ? subject : `Re: ${subject}`;
}

export function EmailWaitingPanel() {
  const router = useRouter();
  const { data, mutate } = useSWR<WaitingData>("/api/crm/emails/waiting", swrFetcher, { refreshInterval: 60000 });
  const threads = data?.threads ?? [];
  const suggestions = data?.suggestions ?? [];
  const status = data?.status;
  const [collapsed, setCollapsed] = useState(false);
  const [replyTo, setReplyTo] = useState<WaitingThreadRow | null>(null);
  const [ownerCardFor, setOwnerCardFor] = useState<string | null>(null);
  const [chosenCompany, setChosenCompany] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("crm_email_panel_collapsed") === "1") setCollapsed(true);
    } catch {
      /* lagring kan vara blockerad */
    }
  }, []);
  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("crm_email_panel_collapsed", next ? "1" : "0");
      } catch {
        /* lagring kan vara blockerad */
      }
      return next;
    });
  }

  if (!data) return null;
  const syncFailed = Boolean(status?.lastError);
  if (threads.length === 0 && suggestions.length === 0 && !syncFailed) return null;

  async function markHandled(row: WaitingThreadRow) {
    setBusy(row.key);
    try {
      await crmFetchJson("/api/crm/emails/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: row.unreadIds }),
      });
      await mutate();
    } catch (e) {
      toast({ title: "Kunde inte markera som hanterad", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  async function syncNow() {
    setBusy("sync");
    try {
      const result = await crmFetchJson<{ imported?: number; linked?: number; suggested?: number }>("/api/cron/email-sync");
      await mutate();
      const found = (result.imported ?? 0) + (result.linked ?? 0);
      toast({ title: found ? `${found} nya mejl kopplade` : "Inga nya kundmejl" });
    } catch (e) {
      await mutate();
      toast({ title: "Synken misslyckades", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  async function resolveSuggestion(s: SenderSuggestionRow, action: "link" | "ignore") {
    const companyId = chosenCompany[s.id] ?? s.companies[0]?.id;
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
          description: result.syncError
            ? "Mejlen hämtas vid nästa synk."
            : result.synced ? `${result.synced} mejl kopplade till kortet.` : undefined,
        });
      }
    } catch (e) {
      toast({ title: "Kunde inte spara", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  const btn = "text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40 transition-colors";
  const total = threads.length + suggestions.length;

  return (
    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
          aria-expanded={!collapsed}
          title={collapsed ? "Visa mejl" : "Fäll ihop"}
        >
          <ChevronDown className={`h-4 w-4 text-emerald-800 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
          <span>📧</span>
          <h2 className="text-sm font-semibold text-nordic-900">Mejl</h2>
          {total > 0 && <span className="text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full px-2 py-0.5">{total}</span>}
          <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline truncate">
            {collapsed ? "Klicka för att visa" : "Kundmejl som väntar på svar — hämtas från Gmail var 15:e minut"}
          </span>
        </button>
        <span className="text-[11px] text-muted-foreground shrink-0 hidden md:inline">
          {status?.lastSuccessAt ? `Synkat ${timeLabel(status.lastSuccessAt)}` : ""}
        </span>
        <button className={btn} onClick={syncNow} disabled={busy === "sync"} title="Hämta nya mejl från Gmail nu">
          {busy === "sync" ? "Synkar…" : "↻ Synka nu"}
        </button>
      </div>

      <div className={collapsed ? "hidden" : "mt-3 space-y-2"}>
        {syncFailed && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800" role="alert">
            Senaste mejlsynken misslyckades: {status?.lastError}{" "}
            <a href="/api/auth/signin" className="underline font-medium">Logga in igen</a> om Gmail-behörigheten har gått ut.
          </div>
        )}

        {threads.map((t) => {
          const who = t.ownerName && !t.companyName
            ? `${t.ownerName} · uthyrare`
            : t.companyName
              ? `${t.contactName ?? t.fromName ?? t.fromEmail} · ${t.companyName}`
              : t.fromName ?? t.fromEmail;
          return (
            <div key={t.key} className="rounded-lg bg-white border p-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-medium text-sm">{who}</span>
                {t.ownerName && t.companyName && <span className="text-[11px] text-muted-foreground">även uthyrare</span>}
                <span className="text-[11px] text-muted-foreground ml-auto">{timeLabel(t.sentAt)}</span>
              </div>
              <p className="text-sm font-semibold text-nordic-900 mt-0.5 truncate">
                {t.subject}
                {t.messageCount > 1 && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">({t.messageCount} i tråden)</span>}
              </p>
              {t.preview && <p className="text-sm text-nordic-800 mt-0.5 line-clamp-3 break-words">{t.preview}</p>}
              <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-dashed">
                <button
                  className="text-[11px] px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold transition-colors"
                  onClick={() => setReplyTo(t)}
                >
                  ↩ Svara
                </button>
                {t.companyId && (
                  <button className={btn} onClick={() => router.push(`/crm/company/${t.companyId}`)}>
                    Öppna företag
                  </button>
                )}
                {t.ownerId && (
                  <button className={btn} onClick={() => setOwnerCardFor(t.ownerId)}>
                    👤 Uthyrarkort
                  </button>
                )}
                {t.gmailThreadId && (
                  <a
                    className={btn}
                    href={`https://mail.google.com/mail/u/0/#all/${t.gmailThreadId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Öppna i Gmail
                  </a>
                )}
                <button className={btn} disabled={busy === t.key} onClick={() => markHandled(t)} title="Tas bort ur listan utan att du svarar">
                  ✓ Hanterad
                </button>
              </div>
            </div>
          );
        })}

        {suggestions.length > 0 && (
          <div className="pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Nya avsändare från kända företag
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => {
                const selected = chosenCompany[s.id] ?? s.companies[0]?.id;
                return (
                  <div key={s.id} className="rounded-lg bg-white border border-dashed p-3">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-medium text-sm">{s.name ?? s.email}</span>
                      {s.name && <span className="text-xs text-muted-foreground">{s.email}</span>}
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {s.messageCount > 1 ? `${s.messageCount} mejl · ` : ""}{timeLabel(s.lastSeenAt)}
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
                          onChange={(e) => setChosenCompany((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        >
                          {s.companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      )}
                      <button
                        className="text-[11px] px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold disabled:opacity-40 transition-colors"
                        disabled={busy === s.id || !selected}
                        onClick={() => resolveSuggestion(s, "link")}
                      >
                        {s.companies.length > 1 ? "Koppla som kontakt" : `Koppla till ${s.companies[0]?.name}`}
                      </button>
                      <button className={btn} disabled={busy === s.id} onClick={() => resolveSuggestion(s, "ignore")}>
                        Ignorera
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {replyTo && (
        <EmailComposeModal
          open
          defaultTo={replyTo.fromEmail}
          defaultSubject={replySubject(replyTo.subject)}
          threadId={replyTo.gmailThreadId ?? undefined}
          companyId={replyTo.companyId ?? undefined}
          ownerId={replyTo.ownerId ?? undefined}
          onClose={() => setReplyTo(null)}
          onSent={() => {
            setReplyTo(null);
            mutate();
          }}
        />
      )}
      {ownerCardFor && (
        <OwnerQuickDialog
          ownerId={ownerCardFor}
          open
          onOpenChange={(o) => {
            if (!o) setOwnerCardFor(null);
          }}
        />
      )}
    </div>
  );
}
