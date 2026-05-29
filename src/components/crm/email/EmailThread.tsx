"use client";

import { Button } from "@/components/ui/button";
import type { Email } from "@/lib/crm/schema";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { ChevronDown, ChevronUp, Mail, MailOpen } from "lucide-react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { EmailComposeModal } from "./EmailComposeModal";
import { EmailLogModal } from "./EmailLogModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

function EmailItem({ email }: { email: Email }) {
  const [expanded, setExpanded] = useState(false);
  const isOut = email.direction === "out";

  return (
    <div className="bg-white rounded-lg border p-3 text-sm">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className={isOut ? "text-blue-600" : "text-green-600"}>
            {isOut ? <Mail className="h-3.5 w-3.5 inline" /> : <MailOpen className="h-3.5 w-3.5 inline" />}
            {" "}{isOut ? "Skickad" : "Mottagen"}
          </span>
          <span>·</span>
          <span className="truncate">{isOut ? email.toEmail : email.fromEmail}</span>
          <span className="ml-auto shrink-0">
            {format(new Date(email.sentAt), "d MMM yyyy HH:mm", { locale: sv })}
          </span>
          {expanded ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
        </div>
        <p className="font-medium text-nordic-900 truncate">{email.subject}</p>
      </button>
      {expanded && (
        <div className="mt-2 border-t pt-2 text-nordic-800 text-sm">
          {email.html ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: email.html }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{email.body}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function EmailThread({ companyId, ownerId, defaultTo, contactId, contacts = [] }: Props) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

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

  // Auto-synka Gmail-trådar när företaget öppnas
  useEffect(() => {
    if (companyId) handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Mejl
        </span>
        <div className="flex gap-1">
          {companyId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={handleSync}
              disabled={syncing}
              title="Hämta svar från Gmail"
            >
              {syncing ? "Synkar…" : "↻ Synka"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setLogOpen(true)}
          >
            Logga
          </Button>
          <Button
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setComposeOpen(true)}
          >
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
      ) : emailList.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Inga mejl loggade ännu.</p>
      ) : (
        <div className="space-y-2">
          {emailList.map((email) => (
            <EmailItem key={email.id} email={email} />
          ))}
        </div>
      )}

      <EmailComposeModal
        open={composeOpen}
        defaultTo={defaultTo}
        companyId={companyId}
        contactId={contactId}
        ownerId={ownerId}
        contacts={contacts}
        onClose={() => setComposeOpen(false)}
        onSent={() => mutate()}
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
