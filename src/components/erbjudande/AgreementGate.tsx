"use client";

// Uppdragsbekräftelse-gaten: visas i stället för erbjudandet tills kunden
// godkänt aktuell avtalsversion med sitt namn. Godkännandet stämplas i
// crm_agreement_acceptances via den token-gatade endpointen — sidan laddas
// sedan om server-side och erbjudandet renderas.

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AgreementPoint {
  heading: string;
  body: string;
}

export function AgreementGate({
  token,
  title,
  intro,
  points,
  version,
}: {
  token: string;
  title: string;
  intro: string;
  points: AgreementPoint[];
  version: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — människor ser aldrig fältet
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLabel =
    title === "Uthyrningsuppdrag" ? "Godkänn uthyrningsuppdraget" : "Godkänn uppdragsbekräftelsen";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Skriv ditt för- och efternamn för att godkänna.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/${token}/agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), website }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Något gick fel — försök igen.");
        return;
      }
      router.refresh();
    } catch {
      setError("Något gick fel — försök igen.");
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
              <p className="mt-1 text-sm leading-relaxed text-nordic-700">{p.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <label htmlFor="agreement-name" className="block text-sm font-medium text-nordic-900">
          Godkänn med ditt namn
        </label>
        <input
          id="agreement-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="För- och efternamn"
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
          {submitting ? "Godkänner…" : submitLabel}
        </button>
        <p className="text-xs text-muted-foreground">
          Godkännandet registreras med namn, datum, IP-adress och avtalsversion ({version}).
        </p>
      </form>
    </div>
  );
}
