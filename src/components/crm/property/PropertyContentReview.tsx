"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { crmFetchJson, crmErrorMessage } from "@/lib/crm/fetcher";

const RESPONSE_FIELDS: Record<string, string> = {
  publicName: "namn för visning",
  publicDescription: "svensk beskrivning",
  publicDescriptionEn: "engelsk beskrivning",
  publicDescriptionPl: "polsk beskrivning",
  skick: "skick",
  skickEn: "skick på engelska",
  skickPl: "skick på polska",
  inclusions: "vad som ingår",
  inclusionsEn: "vad som ingår på engelska",
  inclusionsPl: "vad som ingår på polska",
  images: "bilderna",
  reasons: "granskningsskälen",
};

// Äldre kontrollrapporter kan innehålla Zod-fel som JSON. Felen gäller svaret
// från kontrollen, inte nödvändigtvis saknade uppgifter på bostaden.
export function describeReviewReason(reason: string): { message: string; technical?: string } {
  try {
    const parsed: unknown = JSON.parse(reason);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((issue) =>
      issue && typeof issue === "object" && Array.isArray(issue.path) && typeof issue.code === "string"
    )) {
      const labels = [...new Set(parsed.map((issue) => RESPONSE_FIELDS[String(issue.path[0])]).filter(Boolean))];
      const scope = labels.length ? ` för ${labels.join(", ")}` : "";
      return { message: `Kontrollen fick ett svar som inte kunde användas${scope}. Försök köra kontrollen igen.`, technical: reason };
    }
    if (parsed !== null && typeof parsed === "object") {
      return { message: "Kontrollen kunde inte slutföras. Försök köra kontrollen igen.", technical: reason };
    }
  } catch {
    // Vanliga, läsbara granskningsskäl visas oförändrade.
  }
  return { message: reason };
}

export function PropertyContentReview({ property }: { property: PropertyWithOwner }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();
  const approved = property.contentReviewStatus === "approved";
  const needsReview = ["needs_review", "retry"].includes(property.contentReviewStatus);
  const title = approved
    ? "Beskrivning och bilder godkända"
    : property.contentReviewStatus === "retry"
      ? "Kontrollen kunde inte slutföras"
      : needsReview
        ? "Kajsa behöver granska"
        : property.contentReviewStatus === "checking"
          ? "Kontrollen pågår"
          : "Kontroll av beskrivning och bilder väntar";
  const reasons = (property.contentReviewReport?.reasons ?? []).map(describeReviewReason);
  const Icon = approved ? CheckCircle2 : needsReview ? AlertCircle : Clock3;

  async function review() {
    setBusy(true); setError(null);
    try {
      await crmFetchJson(`/api/crm/properties/${property.id}/review`, { method: "POST" });
      await mutate((key) => typeof key === "string" && key.startsWith("/api/crm/properties"));
    } catch (e) { setError(crmErrorMessage(e)); }
    finally { setBusy(false); }
  }

  return (
    <Alert className={approved ? "rounded-xl border-green-200 bg-green-50/40" : "rounded-xl border-amber-200 bg-amber-50/40"} aria-label="Kontroll inför publicering">
      <Icon className="size-4" />
      <AlertTitle className="text-sm font-semibold">{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 text-sm leading-relaxed">
        {reasons.length > 0 && <ul className="flex list-disc flex-col gap-1 pl-4">{reasons.map((reason, i) => <li key={i}>
          {reason.message}
          {reason.technical && <details className="mt-1"><summary className="cursor-pointer text-xs text-muted-foreground">Visa teknisk information</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-background p-3 text-xs">{reason.technical}</pre></details>}
        </li>)}</ul>}
        {approved && !property.published && !property.publishConsentAt && <p>Publicering på hemsidan inväntar uthyrarens medgivande. Prospektlänken kan aktiveras redan nu.</p>}
        {approved && !property.autoPublishEnabled && <p>Automatisk publicering är pausad efter ett manuellt publiceringsbeslut.</p>}
        {approved && property.status !== "available" && <p>Publicering väntar på att objektet markeras som tillgängligt.</p>}
        {approved && property.availableTo && property.availableTo < new Date().toISOString().slice(0, 10) && <p>Tillgänglighetsperioden har gått ut. Kontrollera datumen före publicering.</p>}
        {!approved && <p className="text-muted-foreground">Kundtext och bilder visas efter godkänd kontroll.</p>}
        <div><Button type="button" variant="outline" size="sm" disabled={busy} onClick={review}>{busy ? "Kontrollerar…" : "Kontrollera igen"}</Button></div>
        {error && <p className="text-destructive" role="alert">{error}</p>}
      </AlertDescription>
    </Alert>
  );
}
