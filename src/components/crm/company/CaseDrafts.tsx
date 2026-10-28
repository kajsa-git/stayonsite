"use client";

import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { useState } from "react";
import useSWR from "swr";

interface Draft {
  id: string;
  body: string;
  toPhone: string;
  contactId: string | null;
}

export function CaseDrafts({ contacts }: { contacts: { id: string; name: string | null }[] }) {
  const { data = [], mutate } = useSWR<Draft[]>("/api/crm/messages?status=draft", swrFetcher, { refreshInterval: 15000 });
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const names = new Map(contacts.map((contact) => [contact.id, contact.name]));
  const drafts = data.filter((draft) => draft.contactId && names.has(draft.contactId));
  if (!drafts.length) return null;

  async function approve(draft: Draft) {
    const body = (edits[draft.id] ?? draft.body).trim();
    if (!body || busyId) return;
    setBusyId(draft.id);
    try {
      if (body !== draft.body) await crmFetchJson(`/api/crm/messages/${draft.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update", body }),
      });
      await crmFetchJson(`/api/crm/messages/${draft.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve" }),
      });
      await mutate();
      toast({ title: "Godkänt och köat" });
    } catch (error) {
      toast({ title: "Kunde inte godkänna", description: crmErrorMessage(error), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer font-medium">SMS-utkast ({drafts.length})</summary>
      <div className="mt-2 flex flex-col gap-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex flex-col gap-1">
            <label htmlFor={`case-draft-${draft.id}`} className="text-xs text-muted-foreground">Till {[names.get(draft.contactId!), formatPhoneSv(draft.toPhone)].filter(Boolean).join(" · ")}</label>
            <textarea id={`case-draft-${draft.id}`} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" rows={3} value={edits[draft.id] ?? draft.body} onChange={(event) => setEdits((current) => ({ ...current, [draft.id]: event.target.value }))} />
            <button type="button" className="self-start rounded-md border bg-background px-2 py-1 text-xs font-medium disabled:opacity-40" disabled={!!busyId || !(edits[draft.id] ?? draft.body).trim()} onClick={() => approve(draft)}>Godkänn och köa</button>
          </div>
        ))}
      </div>
    </details>
  );
}
