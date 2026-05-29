"use client";

import { Button } from "@/components/ui/button";
import type { Email } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { ChevronDown, ChevronUp, Mail, MailOpen } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import DOMPurify from "dompurify";
import { EmailComposeModal } from "./EmailComposeModal";
import { EmailLogModal } from "./EmailLogModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Inkommande mejl-HTML kommer från externa avsändare och får aldrig renderas rått.
// Tvinga säkra länkar (öppnas i ny flik utan referrer/window.opener-läcka).
if (typeof window !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

function sanitizeEmailHtml(html: string): string {
  // Sanering sker klient-sida (DOMPurify kräver DOM). Mejl-HTML renderas bara
  // efter att användaren expanderat tråden, så detta körs alltid i webbläsaren.
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button", "link", "meta", "base"],
    ALLOW_DATA_ATTR: false,
  });
}

interface ContactOption {
  id: string;
  name?: string | null;
  email: string;
}

interface Props {
  companyId?: string;
  ownerId?: string;
  defaultTo?: string;
  contactId?: string;
  contacts?: ContactOption[];
}

// ─── Enskilt mejl ────────────────────────────────────────────────────────────

function EmailMessage({ email, onReply }: { email: Email; onReply: (email: Email) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isOut = email.direction === "out";
  const safeHtml = useMemo(() => (email.html ? sanitizeEmailHtml(email.html) : ""), [email.html]);

  return (
    <div className={`border-l-2 pl-3 py-1 ${isOut ? "border-blue-200" : "border-green-300"}`}>
      <button type="button" className="w-full text-left" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={isOut ? "text-blue-600" : "text-green-600"}>
            {isOut ? <Mail className="h-3 w-3 inline" /> : <MailOpen className="h-3 w-3 inline" />}
            {" "}{isOut ? "Du" : email.fromEmail}
          </span>
          <span className="ml-auto shrink-0">{format(new Date(email.sentAt), "d MMM HH:mm", { locale: sv })}</span>
          {expanded ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
        </div>
      </button>
      {expanded && (
        <div className="mt-1.5 text-sm text-nordic-800">
          {safeHtml ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          ) : (
            <p className="whitespace-pre-wrap">{email.body}</p>
          )}
          {!isOut && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReply(email); }}
              className="mt-2 text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 transition-colors"
            >
              ↩ Svara
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tråd (grupp av mejl med samma gmailThreadId) ─────────────────────────────

function EmailThreadGroup({ messages, onReply }: { messages: Email[]; onReply: (email: Email) => void }) {
  const sorted = [...messages].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const latest = sorted[sorted.length - 1];
  const hasUnread = sorted.some((m) => m.direction === "in" && !m.isRead);
  const [open, setOpen] = useState(hasUnread);

  const inCount = sorted.filter((m) => m.direction === "in").length;
  const outCount = sorted.filter((m) => m.direction === "out").length;

  return (
    <div className="rounded-lg bg-white border overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-3 py-2.5 hover:bg-nordic-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 shrink-0">
            {outCount > 0 && <Mail className="h-3.5 w-3.5 text-blue-500" />}
            {inCount > 0 && <MailOpen className="h-3.5 w-3.5 text-green-500" />}
          </div>
          <p className={`text-sm truncate flex-1 ${hasUnread ? "font-semibold text-nordic-900" : "text-nordic-800"}`}>
            {latest.subject || "(inget ämne)"}
          </p>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {sorted.length > 1 && (
              <span className="text-[11px] bg-nordic-100 text-nordic-600 rounded-full px-1.5 py-0.5 font-medium">
                {sorted.length}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(latest.sentAt), "d MMM HH:mm", { locale: sv })}
            </span>
            {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t bg-nordic-50/30">
          {sorted.map((m) => (
            <EmailMessage key={m.id} email={m} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Huvud-komponent ──────────────────────────────────────────────────────────

export function EmailThread({ companyId, ownerId, defaultTo, contactId, contacts = [] }: Props) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string; threadId: string | null } | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  function handleReply(email: Email) {
    const subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
    setReplyTo({ to: email.fromEmail, subject, threadId: email.gmailThreadId ?? null });
    setComposeOpen(true);
  }

  const param = companyId ? `companyId=${companyId}` : `ownerId=${ownerId}`;
  const { data: emailList = [], mutate } = useSWR<Email[]>(
    companyId || ownerId ? `/api/crm/emails?${param}` : null,
    fetcher,
  );

  async function handleSync() {
    if (!companyId) return;
    setSyncing(true);
    setGmailError(null);
    try {
      const res = await fetch("/api/crm/emails/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.error === "gmail_auth") {
        setGmailError(data.message);
      } else {
        mutate();
      }
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (companyId) handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Gruppera per gmailThreadId, fristående mejl får egen grupp
  const threads = Object.values(
    emailList.reduce<Record<string, Email[]>>((acc, email) => {
      const key = email.gmailThreadId ?? `solo-${email.id}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(email);
      return acc;
    }, {}),
  ).sort((a, b) => {
    const latestA = Math.max(...a.map((e) => new Date(e.sentAt).getTime()));
    const latestB = Math.max(...b.map((e) => new Date(e.sentAt).getTime()));
    return latestB - latestA;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mejl</span>
        <div className="flex gap-1">
          {companyId && (
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={handleSync} disabled={syncing} title="Hämta svar från Gmail">
              {syncing ? "Synkar…" : "↻ Synka"}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setLogOpen(true)}>
            Logga
          </Button>
          <Button size="sm" className="h-6 text-xs px-2" onClick={() => setComposeOpen(true)}>
            Skriv mejl
          </Button>
        </div>
      </div>

      {gmailError && (
        <div className="mb-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          {gmailError}{" "}
          <a href="/api/auth/signin" className="underline font-medium">Logga in igen</a>
        </div>
      )}

      {syncing && emailList.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Hämtar mejl…</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Inga mejl loggade ännu.</p>
      ) : (
        <div className="space-y-2">
          {threads.map((group) => (
            <EmailThreadGroup key={group[0].gmailThreadId ?? group[0].id} messages={group} onReply={handleReply} />
          ))}
        </div>
      )}

      <EmailComposeModal
        open={composeOpen}
        defaultTo={replyTo?.to ?? defaultTo}
        defaultSubject={replyTo?.subject}
        threadId={replyTo?.threadId ?? undefined}
        companyId={companyId}
        contactId={contactId}
        ownerId={ownerId}
        contacts={replyTo ? [] : contacts}
        onClose={() => { setComposeOpen(false); setReplyTo(null); }}
        onSent={() => { mutate(); setReplyTo(null); }}
      />
      <EmailLogModal
        open={logOpen}
        companyId={companyId}
        contactId={contactId}
        ownerId={ownerId}
        onClose={() => setLogOpen(false)}
        onLogged={() => mutate()}
      />
    </div>
  );
}
