"use client";

// "Att svara på" i Min dag: alla olästa SMS och mejl från kunder och uthyrare i en
// lista, en rad per person. Klicka på raden för att läsa, svara och fatta ett beslut.
// Ett svar är ingen egen etapp — varje beslut landar i funneln (ny återkomst, till
// avtal, ny förfrågan) och prickar samtidigt av personens meddelanden.
import { toast } from "@/components/ui/use-toast";
import { EmailComposeModal } from "@/components/crm/email/EmailComposeModal";
import { SENDER_SUGGESTIONS_ANCHOR } from "@/components/crm/company/SenderSuggestionsPanel";
import { crmErrorMessage, crmFetchJson } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import type { ReplyGroup, ReplyInbox as ReplyInboxData } from "@/lib/crm/reply-inbox";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OwnerQuickDialog } from "./OwnerQuickDialog";
import { PublishFlowDialog } from "./PublishFlowDialog";

const VISIBLE_ROWS = 5;

function timeLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function replySubject(subject: string): string {
  return /^\s*(re|sv|aw|odp):/i.test(subject) ? subject : `Re: ${subject}`;
}

function displayName(g: ReplyGroup): string {
  return /^\+?\d[\d\s-]+$/.test(g.name) ? formatPhoneSv(g.name) ?? g.name : g.name;
}

export interface ReplyInboxProps {
  data: ReplyInboxData | undefined;
  onChanged: () => unknown;
  /** Ligger företaget i en kolumn idag med en förfrågan som kan gå till avtal? */
  canMarkWon: (companyId: string) => boolean;
  onMarkWon: (companyId: string) => void;
  onCompanyFollowUp: (companyId: string, days: number) => Promise<void>;
  onOwnerFollowUp: (ownerId: string, days: number) => Promise<void>;
  onCreateRequest: (companyId: string) => Promise<void>;
}

export function ReplyInbox({ data, onChanged, canMarkWon, onMarkWon, onCompanyFollowUp, onOwnerFollowUp, onCreateRequest }: ReplyInboxProps) {
  const router = useRouter();
  const groups = data?.groups ?? [];
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [smsReplyFor, setSmsReplyFor] = useState<string | null>(null);
  const [smsText, setSmsText] = useState("");
  const [mailReplyFor, setMailReplyFor] = useState<ReplyGroup | null>(null);
  const [publishFor, setPublishFor] = useState<ReplyGroup | null>(null);
  const [ownerCardFor, setOwnerCardFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("crm_replies_collapsed") === "1") setCollapsed(true);
    } catch {
      /* lagring kan vara blockerad */
    }
  }, []);
  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("crm_replies_collapsed", next ? "1" : "0");
      } catch {
        /* lagring kan vara blockerad */
      }
      return next;
    });
  }

  const syncError = data?.mailSync.lastError ?? null;
  if (!data || (groups.length === 0 && !syncError)) return null;

  async function markHandled(g: ReplyGroup) {
    const mailIds = g.mails.flatMap((m) => m.unreadIds);
    await Promise.all([
      mailIds.length
        ? crmFetchJson("/api/crm/emails/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: mailIds }),
          })
        : null,
      ...g.sms.map((s) =>
        crmFetchJson(`/api/crm/inbox/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        }),
      ),
    ]);
  }

  // Beslutet först (det som flyttar i funneln), sedan prickas personens meddelanden av.
  async function decide(g: ReplyGroup, run?: () => unknown, done?: string) {
    setBusy(g.key);
    try {
      if (run) await run();
      await markHandled(g);
      if (expanded === g.key) setExpanded(null);
      await onChanged();
      if (done) toast({ title: done });
    } catch (e) {
      toast({ title: "Kunde inte spara", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  // SMS-svaret köas; meddelandena prickas av när Mac-agenten rapporterat att det gått iväg.
  async function sendSms(g: ReplyGroup) {
    if (!g.phone || !smsText.trim() || busy) return;
    setBusy(g.key);
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: g.phone,
          body: smsText.trim(),
          ownerId: g.ownerId ?? undefined,
          contactId: g.contactId ?? undefined,
          replyToInboxIds: g.sms.map((s) => s.id),
        }),
      });
      setSmsReplyFor(null);
      setSmsText("");
      await onChanged();
      toast({ title: "SMS-svaret är köat — status visas på raden" });
    } catch (e) {
      toast({ title: "Kunde inte skicka", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  async function syncMail() {
    setBusy("sync");
    try {
      const result = await crmFetchJson<{ imported?: number; linked?: number }>("/api/cron/email-sync");
      await onChanged();
      const found = (result.imported ?? 0) + (result.linked ?? 0);
      toast({ title: found ? `${found} nya mejl kopplade` : "Inga nya kundmejl" });
    } catch (e) {
      await onChanged();
      toast({ title: "Mejlsynken misslyckades", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  const btn = "text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40 transition-colors";
  const btnPrimary = "text-[11px] px-2 py-0.5 rounded border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold disabled:opacity-40 transition-colors";
  const btnDecision = "text-[11px] px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium disabled:opacity-40 transition-colors";
  const visible = showAll ? groups : groups.slice(0, VISIBLE_ROWS);

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
          aria-expanded={!collapsed}
          title={collapsed ? "Visa" : "Fäll ihop"}
        >
          <ChevronDown className={`h-4 w-4 text-blue-800 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
          <span>📥</span>
          <h2 className="text-sm font-semibold text-nordic-900">Att svara på</h2>
          {groups.length > 0 && <span className="text-xs font-bold text-blue-800 bg-blue-100 rounded-full px-2 py-0.5">{groups.length}</span>}
          <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline truncate">
            {collapsed ? "Klicka för att visa" : "SMS och mejl från kunder och uthyrare — avsluta varje rad med ett beslut"}
          </span>
        </button>
        <button
          className="text-[11px] text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-40"
          onClick={syncMail}
          disabled={busy === "sync"}
          title="Mejlen hämtas från Gmail var 15:e minut — klicka för att hämta nu"
        >
          {busy === "sync" ? "Hämtar mejl…" : data.mailSync.lastSuccessAt ? `↻ Mejl ${timeLabel(data.mailSync.lastSuccessAt).split(" ").pop()}` : "↻ Mejl"}
        </button>
      </div>

      <div className={collapsed ? "hidden" : "mt-3"}>
        {syncError && (
          <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800" role="alert">
            Mejlsynken misslyckades senast: {syncError}{" "}
            <a href="/api/auth/signin" className="underline font-medium">Logga in igen</a> om Gmail-behörigheten har gått ut.
          </div>
        )}

        <div className="rounded-lg border bg-white divide-y overflow-hidden">
          {visible.map((g) => {
            const open = expanded === g.key;
            const smsPending = g.sms.find((s) => s.replyStatus?.status === "queued" || s.replyStatus?.status === "sending");
            const smsFailed = g.sms.find((s) => s.replyStatus?.status === "failed");
            const isBusy = busy === g.key;
            return (
              <div key={g.key} className={open ? "bg-nordic-50/40" : undefined}>
                <button
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-nordic-50 transition-colors"
                  onClick={() => setExpanded(open ? null : g.key)}
                  aria-expanded={open}
                >
                  <span className="shrink-0 text-xs w-8" aria-label={[g.sms.length ? "SMS" : null, g.mails.length ? "mejl" : null].filter(Boolean).join(" och ")}>
                    {g.sms.length > 0 && "💬"}
                    {g.mails.length > 0 && "📧"}
                  </span>
                  <span className="shrink-0 max-w-[45%] truncate text-sm">
                    <span className="font-medium text-nordic-900">{displayName(g)}</span>
                    {g.context && <span className="text-muted-foreground"> · {g.context}</span>}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{g.preview}</span>
                  {smsPending && <span className="shrink-0 text-[11px] text-muted-foreground">svar köat</span>}
                  {smsFailed && <span className="shrink-0 text-[11px] text-destructive">SMS misslyckades</span>}
                  <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{timeLabel(g.latestAt)}</span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="px-3 pb-3 space-y-2">
                    {g.sms.map((s) => (
                      <div key={s.id} className="border-l-2 border-blue-300 pl-3">
                        <div className="text-[11px] text-muted-foreground">💬 SMS · {timeLabel(s.sentAt)}</div>
                        {s.repliedTo && (
                          <p className="text-[11px] text-muted-foreground italic line-clamp-1" title={s.repliedTo.body}>
                            ↳ Svar på ditt SMS: ”{s.repliedTo.body}”
                          </p>
                        )}
                        <p className="text-sm text-nordic-800 whitespace-pre-wrap break-words">{s.body}</p>
                      </div>
                    ))}
                    {g.mails.map((m) => (
                      <div key={m.key} className="border-l-2 border-emerald-300 pl-3">
                        <div className="text-[11px] text-muted-foreground">
                          📧 {timeLabel(m.sentAt)}
                          {m.messageCount > 1 && ` · ${m.messageCount} i tråden`}
                          {m.gmailThreadId && (
                            <>
                              {" · "}
                              <a
                                className="underline"
                                href={`https://mail.google.com/mail/u/0/#all/${m.gmailThreadId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Öppna i Gmail
                              </a>
                            </>
                          )}
                        </div>
                        <p className="text-sm font-medium text-nordic-900 truncate">{m.subject}</p>
                        {m.preview && <p className="text-sm text-nordic-800 break-words">{m.preview}</p>}
                      </div>
                    ))}

                    {smsFailed && <p className="text-xs text-destructive" role="alert">Ditt SMS-svar kunde inte skickas. Kontrollera texten och försök igen.</p>}

                    <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-dashed">
                      {g.phone && g.sms.length > 0 && (
                        <button
                          className={btnPrimary}
                          disabled={Boolean(smsPending)}
                          onClick={() => {
                            setSmsReplyFor(smsReplyFor === g.key ? null : g.key);
                            setSmsText(smsFailed?.replyStatus?.body ?? "");
                          }}
                        >
                          ↩ Svara SMS
                        </button>
                      )}
                      {g.mails.length > 0 && (
                        <button className={btnPrimary} onClick={() => setMailReplyFor(g)}>
                          ↩ Svara mejl
                        </button>
                      )}
                      {g.ownerId && g.sms.length > 0 && g.phone && (
                        <button
                          className="text-[11px] px-2 py-0.5 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold transition-colors"
                          onClick={() => setPublishFor(g)}
                        >
                          🚀 Publicera & länka
                        </button>
                      )}
                      {g.ownerId && (
                        <button className={btn} onClick={() => setOwnerCardFor(g.ownerId)}>
                          👤 Uthyrarkort
                        </button>
                      )}
                      {g.companyId && (
                        <button className={btn} onClick={() => router.push(`/crm/company/${g.companyId}`)}>
                          Öppna företag
                        </button>
                      )}
                    </div>

                    {smsReplyFor === g.key && (
                      <div className="space-y-1.5">
                        <textarea
                          value={smsText}
                          onChange={(e) => setSmsText(e.target.value)}
                          rows={3}
                          placeholder={`SMS till ${displayName(g)}…`}
                          className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <div className="flex gap-1.5">
                          <button className={btnPrimary} disabled={isBusy || !smsText.trim()} onClick={() => sendSms(g)}>
                            Skicka
                          </button>
                          <button className={btn} onClick={() => setSmsReplyFor(null)}>
                            Avbryt
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">Beslut</span>
                      {(g.companyId || g.ownerId) &&
                        ([1, 3, 7] as const).map((days) => (
                          <button
                            key={days}
                            className={btnDecision}
                            disabled={isBusy}
                            onClick={() =>
                              decide(
                                g,
                                () => (g.companyId ? onCompanyFollowUp(g.companyId, days) : onOwnerFollowUp(g.ownerId!, days)),
                              )
                            }
                            title="Boka återkomst — kortet dyker upp i Återkomster den dagen"
                          >
                            Återkomst {days === 1 ? "imorgon" : days === 3 ? "om 3 d" : "om 1 v"}
                          </button>
                        ))}
                      {g.companyId && canMarkWon(g.companyId) && (
                        <button
                          className="text-[11px] px-2 py-0.5 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-medium disabled:opacity-40 transition-colors"
                          disabled={isBusy}
                          onClick={() => decide(g, () => onMarkWon(g.companyId!))}
                          title="Kunden tackar ja — förfrågan går till Avtal (kan ångras på kortet i några sekunder)"
                        >
                          Till avtal 🎉
                        </button>
                      )}
                      {g.companyId && g.openRequests === 0 && (
                        <button
                          className={btnDecision}
                          disabled={isBusy}
                          onClick={() => decide(g, () => onCreateRequest(g.companyId!))}
                          title="Ny förfrågan — hamnar i Öppna uppdrag"
                        >
                          + Ny förfrågan
                        </button>
                      )}
                      <button
                        className={btn}
                        disabled={isBusy}
                        onClick={() => decide(g, undefined, "Markerad som klar")}
                        title="Inget mer att göra — tas bort ur listan"
                      >
                        ✓ Klar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {groups.length > VISIBLE_ROWS && (
            <button className="underline" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Visa färre" : `Visa alla ${groups.length}`}
            </button>
          )}
          {data.suggestionCount > 0 && (
            <a className="underline ml-auto" href={`/crm/foretag#${SENDER_SUGGESTIONS_ANCHOR}`}>
              {data.suggestionCount} {data.suggestionCount === 1 ? "ny avsändare" : "nya avsändare"} att koppla under Företag
            </a>
          )}
        </div>
      </div>

      {mailReplyFor && mailReplyFor.mails[0] && (
        <EmailComposeModal
          open
          defaultTo={mailReplyFor.mails[0].fromEmail}
          defaultSubject={replySubject(mailReplyFor.mails[0].subject)}
          threadId={mailReplyFor.mails[0].gmailThreadId ?? undefined}
          companyId={mailReplyFor.companyId ?? undefined}
          contactId={mailReplyFor.contactId ?? undefined}
          ownerId={mailReplyFor.ownerId ?? undefined}
          onClose={() => setMailReplyFor(null)}
          onSent={() => {
            setMailReplyFor(null);
            onChanged();
          }}
        />
      )}
      {publishFor && publishFor.ownerId && (
        <PublishFlowDialog
          ownerId={publishFor.ownerId}
          ownerName={publishFor.name}
          ownerPhone={publishFor.phone ?? ""}
          open
          onOpenChange={(o) => {
            if (!o) setPublishFor(null);
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
