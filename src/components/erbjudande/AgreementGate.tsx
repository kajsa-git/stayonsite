"use client";

// Avtalsgaten: visas i stället för innehållet tills parten godkänt aktuell
// avtalsversion med sitt namn. Godkännandet stämplas i crm_agreement_acceptances
// via den token-gatade endpointen (inkl. vilken språkversion som visades) —
// sidan laddas sedan om server-side och innehållet renderas.
// Avtal finns bara på svenska och engelska; svenskan har företräde vid tolkning.

import type { AgreementLanguage, AgreementPoint } from "@/lib/crm/avtal";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UI: Record<AgreementLanguage, {
  nameLabel: string;
  namePlaceholder: string;
  nameError: string;
  genericError: string;
  submitting: string;
  footer: (version: string) => string;
  svPrevails: string | null;
}> = {
  sv: {
    nameLabel: "Godkänn med ditt namn",
    namePlaceholder: "För- och efternamn",
    nameError: "Skriv ditt för- och efternamn för att godkänna.",
    genericError: "Något gick fel — försök igen.",
    submitting: "Godkänner…",
    footer: (v) => `Godkännandet registreras med namn, datum, IP-adress, språk och avtalsversion (${v}).`,
    svPrevails: null,
  },
  en: {
    nameLabel: "Approve with your name",
    namePlaceholder: "First and last name",
    nameError: "Enter your first and last name to approve.",
    genericError: "Something went wrong — please try again.",
    submitting: "Approving…",
    footer: (v) => `Your approval is recorded with name, date, IP address, language and agreement version (${v}).`,
    svPrevails: "This is a translation — in case of any discrepancy, the Swedish version prevails.",
  },
};

export function AgreementGate({
  token,
  title,
  intro,
  points,
  version,
  submitLabel,
  lang = "sv",
  onAccepted,
}: {
  token: string;
  title: string;
  intro: string;
  points: AgreementPoint[];
  version: string;
  submitLabel: string;
  lang?: AgreementLanguage;
  // Utan callback laddas sidan om server-side (token-gatade sidorna). Med callback
  // (t.ex. bostadsregistreringens del 2) hanterar anroparen fortsättningen själv.
  onAccepted?: () => void;
}) {
  const router = useRouter();
  const ui = UI[lang];
  const [name, setName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — människor ser aldrig fältet
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError(ui.nameError);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${token}/agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), website, language: lang }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? ui.genericError);
        return;
      }
      if (onAccepted) onAccepted();
      else router.refresh();
    } catch {
      setError(ui.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 sm:p-8">
      <h1
        className="text-[1.8rem] leading-tight tracking-tight text-nordic-900"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-nordic-700">{intro}</p>

      <ol className="mt-8 space-y-5">
        {points.map((p, index) => (
          <li key={p.heading} className="grid gap-3 sm:grid-cols-[2.25rem_1fr]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nordic-50 text-sm font-semibold text-nordic-900">
              {index + 1}
            </span>
            <div>
              <h2 className="text-base font-semibold text-nordic-900">{p.heading}</h2>
              {p.body && <p className="mt-1 text-sm leading-relaxed text-nordic-700">{p.body}</p>}
              {p.bullets && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-nordic-700">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {p.note && <p className="mt-2 text-sm text-muted-foreground">{p.note}</p>}
            </div>
          </li>
        ))}
      </ol>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <label htmlFor="agreement-name" className="block text-sm font-medium text-nordic-900">
          {ui.nameLabel}
        </label>
        <input
          id="agreement-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={ui.namePlaceholder}
          autoComplete="name"
          className="w-full rounded-lg border border-nordic-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6300]/40"
        />
        {/* Honeypot — göms för människor, fylls bara i av botar */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#ff6300] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e65800] disabled:opacity-60 sm:w-auto"
        >
          {submitting ? ui.submitting : submitLabel}
        </button>
        <p className="text-xs text-muted-foreground">
          {ui.footer(version)}
          {ui.svPrevails && <> {ui.svPrevails}</>}
        </p>
      </form>
    </div>
  );
}
