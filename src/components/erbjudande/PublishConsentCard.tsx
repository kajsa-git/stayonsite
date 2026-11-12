"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PUBLICATION_CONSENT_TEXT, PUBLICATION_CONSENT_VERSION } from "@/lib/crm/publication-consent-text";
import type { ConsentableProperty } from "@/lib/crm/publish-consent";

export function PublishConsentCard({
  token, properties, onConsented,
}: {
  token: string;
  properties: ConsentableProperty[];
  onConsented?: () => void;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(properties);
  const [selected, setSelected] = useState<string[]>(properties.length === 1 ? [properties[0].id] : []);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function approve(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (name.trim().length < 2 || !selected.length) {
      setError("Ange ditt namn och välj minst en bostad.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/share/${token}/publish-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyIds: selected, name: name.trim(), website, version: PUBLICATION_CONSENT_VERSION }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Något gick fel. Försök igen.");
      }
      const next = remaining.filter((property) => !selected.includes(property.id));
      setRemaining(next);
      setSelected(next.length === 1 ? [next[0].id] : []);
      setSaved(true);
      onConsented?.();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-nordic-900">Visa bostaden på StayOnSite</h1>
      {saved && <p className="mt-3 text-sm text-green-800" role="status">Tack! Ditt medgivande är sparat för den valda bostaden.</p>}
      {remaining.length > 0 ? (
        <form onSubmit={approve} className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-nordic-700">{PUBLICATION_CONSENT_TEXT}</p>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-nordic-900">
              {remaining.length === 1 ? "Bostaden som medgivandet gäller" : "Välj vilka bostäder du vill visa"}
            </legend>
            {remaining.map((property) => {
              const label = [property.address, property.city].filter(Boolean).join(", ") || "Bostad utan angiven adress";
              return remaining.length === 1 ? (
                <p key={property.id} className="rounded-lg bg-nordic-50 p-3 text-sm">{label}</p>
              ) : (
                <label key={property.id} className="flex items-start gap-2 rounded-lg bg-nordic-50 p-3 text-sm">
                  <input type="checkbox" checked={selected.includes(property.id)}
                    onChange={(event) => setSelected((current) => event.target.checked
                      ? [...current, property.id] : current.filter((id) => id !== property.id))}
                    className="mt-0.5 h-4 w-4 accent-[#ff6300]" />
                  {label}
                </label>
              );
            })}
          </fieldset>
          <label className="block text-sm font-medium text-nordic-900">
            Ditt namn
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required
              className="mt-1 block w-full rounded-lg border border-nordic-200 px-3 py-2.5 text-sm" />
          </label>
          <input type="text" value={website} onChange={(event) => setWebsite(event.target.value)}
            name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}
            className="rounded-full bg-[#ff6300] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e65800] disabled:opacity-60">
            {submitting ? "Sparar…" : "Godkänn publicering"}
          </button>
          <p className="text-xs text-muted-foreground">Godkännandet sparas för de valda bostäderna med namn och datum.</p>
        </form>
      ) : (
        <p className="mt-3 text-sm text-nordic-700">Inga bostäder väntar på ett publiceringsmedgivande just nu.</p>
      )}
    </div>
  );
}
