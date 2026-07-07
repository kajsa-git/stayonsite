"use client";

// Utkast-panelen: SMS som CRM:et förberett (svar, uppföljningar, länk-SMS,
// förlängningar). INGET skickas härifrån automatiskt — varje utkast godkänns
// eller slängs manuellt. Godkända meddelanden skickas av Mac-agenten inom ~30 s,
// dock aldrig under tysta timmar (21–08).
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { useState } from "react";
import useSWR from "swr";

interface DraftRow {
  id: string;
  toPhone: string;
  body: string;
  status: string;
  createdAt: string | null;
}

export function DraftsPanel() {
  const { data, mutate } = useSWR<DraftRow[]>("/api/crm/messages?status=draft", swrFetcher, { refreshInterval: 15000 });
  const drafts = data ?? [];
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  if (drafts.length === 0) return null;

  const textOf = (d: DraftRow) => edits[d.id] ?? d.body;

  async function approve(d: DraftRow) {
    setBusyId(d.id);
    try {
      const text = textOf(d).trim();
      if (!text) throw new Error("Meddelandet är tomt");
      if (text !== d.body) {
        await crmFetchJson(`/api/crm/messages/${d.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", body: text }),
        });
      }
      await crmFetchJson(`/api/crm/messages/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      toast({ title: "Godkänt — skickas av Mac-agenten (aldrig 21–08)" });
      setEdits((e) => {
        const { [d.id]: _drop, ...rest } = e;
        return rest;
      });
      mutate();
    } catch (e) {
      toast({ title: "Kunde inte godkänna", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  async function discard(d: DraftRow) {
    setBusyId(d.id);
    try {
      await crmFetchJson(`/api/crm/messages/${d.id}`, { method: "DELETE" });
      toast({ title: "Utkast borttaget" });
      mutate();
    } catch (e) {
      toast({ title: "Kunde inte ta bort", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-10 rounded-xl border border-violet-200 bg-violet-50/40 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>✉️</span>
        <h2 className="text-sm font-semibold text-nordic-900">Utkast att godkänna</h2>
        <span className="text-xs font-bold text-violet-800 bg-violet-100 rounded-full px-2 py-0.5">{drafts.length}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Inget här skickas utan ditt godkännande. Justera texten om du vill, godkänn eller släng.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {drafts.map((d) => (
          <div key={d.id} className="rounded-lg bg-white border p-3">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-sm">{formatPhoneSv(d.toPhone)}</span>
              {d.createdAt && <span className="text-[11px] text-muted-foreground ml-auto">{d.createdAt.slice(0, 16)}</span>}
            </div>
            <textarea
              value={textOf(d)}
              onChange={(e) => setEdits((prev) => ({ ...prev, [d.id]: e.target.value }))}
              rows={4}
              className="mt-2 w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
            <div className="flex gap-1.5 mt-1.5">
              <button
                className="text-[11px] px-2.5 py-1 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold disabled:opacity-40 transition-colors"
                disabled={busyId !== null || !textOf(d).trim()}
                onClick={() => approve(d)}
              >
                ✓ Godkänn & skicka
              </button>
              <button
                className="text-[11px] px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors"
                disabled={busyId !== null}
                onClick={() => discard(d)}
              >
                Ta bort
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
