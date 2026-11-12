"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { crmErrorMessage, crmFetchJson } from "@/lib/crm/fetcher";

export function PropertyPublicationConsent({ property }: { property: PropertyWithOwner }) {
  const { mutate } = useSWRConfig();
  const [mode, setMode] = useState<"grant" | "withdraw" | null>(null);
  const [source, setSource] = useState("sms");
  const [name, setName] = useState(property.ownerContactPerson || property.ownerName || "");
  const [date, setDate] = useState(() => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" }));
  const [evidence, setEvidence] = useState("");
  const [autoPublish, setAutoPublish] = useState(!!property.autoPublishEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const hus = property.publishConsentSource === "hus" || (property.notes ?? "").includes("HUS webbpublicering (");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!mode) return;
    setBusy(true);
    setError("");
    try {
      await crmFetchJson(`/api/crm/properties/${property.id}/publication-consent`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, source, name, date, evidence, ...(mode === "grant" ? { autoPublish: !hus && autoPublish } : {}) }),
      });
      setMode(null);
      setEvidence("");
      await mutate((key) => typeof key === "string" && (key.startsWith("/api/crm/properties") || key.startsWith("/api/crm/owners/")));
    } catch (cause) {
      setError(crmErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 space-y-2 border-b pb-4 text-sm">
      <p className="font-semibold">Medgivande till webbpublicering</p>
      <p className="text-muted-foreground">
        {property.publishConsentAt
          ? `Registrerat ${property.publishConsentAt.slice(0, 10)}${property.publishConsentSource ? ` via ${property.publishConsentSource}` : ""}${property.publishConsentName ? ` · ${property.publishConsentName}` : ""}.`
          : property.publishConsentSource === "withdrawn" ? "Uthyraren har sagt nej eller återkallat medgivandet. Se kontaktloggen."
            : property.published ? "Bostaden är publicerad sedan tidigare. Medgivande saknar registrering i CRM." : "Inget medgivande registrerat i CRM."}
      </p>
      {property.autoPublishEnabled && !property.published && <p className="text-xs text-muted-foreground">Automatisk publicering är påslagen. Ett registrerat ja kan leda till publicering när kontrollen är godkänd.</p>}
      {!mode && (
        <div className="flex flex-wrap gap-2">
          {!property.publishConsentAt && <button type="button" onClick={() => setMode("grant")} className="rounded-md border px-3 py-1.5 font-medium hover:bg-muted">Registrera ett ja</button>}
          {property.publishConsentSource !== "withdrawn" && <button type="button" onClick={() => setMode("withdraw")} className="rounded-md border px-3 py-1.5 font-medium hover:bg-muted">Registrera nej eller återkallelse</button>}
        </div>
      )}
      {mode && (
        <form onSubmit={save} className="space-y-3 rounded-lg bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">
            {mode === "grant"
              ? "Spara vad uthyraren har godkänt för den här bostaden och var beskedet finns. Ett ja via sms, mejl, chatt eller samtal kan registreras."
              : "Återkallelsen avpublicerar bostaden och stänger prospektlänken. Tidigare underlag sparas i kontaktloggen."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium">Kanal
              <select value={source} onChange={(event) => setSource(event.target.value)} className="mt-1 block w-full rounded border bg-white px-2 py-2 text-sm">
                <option value="sms">SMS</option><option value="mejl">Mejl</option><option value="chatt">Chatt</option><option value="samtal">Samtal</option><option value="övrigt">Annat</option>
              </select>
            </label>
            <label className="text-xs font-medium">Datum för beskedet
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="mt-1 block w-full rounded border bg-white px-2 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-xs font-medium">Vem gav beskedet?
            <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required className="mt-1 block w-full rounded border bg-white px-2 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium">Underlag
            <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} minLength={8} required rows={3}
              placeholder="Skriv vad som godkändes och var meddelandet eller samtalsanteckningen finns." className="mt-1 block w-full rounded border bg-white px-2 py-2 text-sm" />
          </label>
          {mode === "grant" && !hus && <label className="flex items-start gap-2 text-xs font-medium">
            <input type="checkbox" checked={autoPublish} onChange={(event) => setAutoPublish(event.target.checked)} className="mt-0.5" />
            Publicera automatiskt när innehållskontrollen är godkänd.
          </label>}
          {mode === "grant" && hus && <p className="text-xs text-muted-foreground">Bostäder från HyrUtSmart publiceras manuellt efter kontroll.</p>}
          {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className="rounded-md bg-nordic-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">{busy ? "Sparar…" : mode === "grant" ? "Spara medgivande" : "Spara och avpublicera"}</button>
            <button type="button" onClick={() => { setMode(null); setError(""); }} className="rounded-md border px-3 py-2 text-sm">Avbryt</button>
          </div>
        </form>
      )}
    </div>
  );
}
