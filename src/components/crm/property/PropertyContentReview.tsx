"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { crmFetchJson, crmErrorMessage } from "@/lib/crm/fetcher";

export function PropertyContentReview({ property }: { property: PropertyWithOwner }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();
  const approved = property.contentReviewStatus === "approved";
  const needsReview = ["needs_review", "retry"].includes(property.contentReviewStatus);
  const title = approved ? "Beskrivning och bilder godkända" : needsReview ? "Kajsa behöver granska" : "Kontroll av beskrivning och bilder väntar";
  const reasons = property.contentReviewReport?.reasons ?? [];

  async function review() {
    setBusy(true); setError(null);
    try {
      await crmFetchJson(`/api/crm/properties/${property.id}/review`, { method: "POST" });
      await mutate((key) => typeof key === "string" && key.startsWith("/api/crm/properties"));
    } catch (e) { setError(crmErrorMessage(e)); }
    finally { setBusy(false); }
  }

  return (
    <section className={`rounded-md border p-3 space-y-2 ${approved ? "border-green-200 bg-green-50/40" : "border-amber-200 bg-amber-50/50"}`} aria-label="Kontroll inför publicering">
      <p className="text-sm font-semibold">{title}</p>
      {reasons.length > 0 && <ul className="list-disc pl-5 text-sm space-y-1">{reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ul>}
      {approved && !property.published && !property.publishConsentAt && <p className="text-sm">Inväntar uthyrarens publiceringsmedgivande.</p>}
      {approved && !property.autoPublishEnabled && <p className="text-sm">Automatisk publicering är pausad efter ett manuellt publiceringsbeslut.</p>}
      {approved && property.status !== "available" && <p className="text-sm">Publicering väntar på att objektet markeras som tillgängligt.</p>}
      {approved && property.availableTo && property.availableTo < new Date().toISOString().slice(0, 10) && <p className="text-sm">Tillgänglighetsperioden har gått ut. Kontrollera datumen före publicering.</p>}
      {!approved && <p className="text-xs text-muted-foreground">Objektets kundtext och bilder visas efter godkänd kontroll. Rätta uppgifterna eller bilderna och kör kontrollen igen.</p>}
      <button type="button" className="text-sm rounded-md border px-3 py-1.5 bg-white disabled:opacity-50" disabled={busy} onClick={review}>{busy ? "Kontrollerar…" : "Kontrollera igen"}</button>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
    </section>
  );
}
