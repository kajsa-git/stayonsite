"use client";

// Publiceringsgodkännandet — ett klick, medvetet lättare än avtalsgaten.
// Godkännandet är att annonsen får visas online; exakt adress visas aldrig
// publikt (integritetsregeln för den publika speglingen). Efter godkännande
// visas en lugn bekräftelse — husägaren ska känna att saken är omhändertagen.
import { useState } from "react";
import { CheckCircle2, Globe } from "lucide-react";

export function PublishConsentCard({
  token,
  addresses,
  initiallyConsented,
  onConsented,
}: {
  token: string;
  addresses: string[]; // visningsrader, t.ex. "Verifygatan 1, Boden"
  initiallyConsented: boolean;
  onConsented?: () => void;
}) {
  const [consented, setConsented] = useState(initiallyConsented);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function approve() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/share/${token}/publish-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("failed");
      setConsented(true);
      onConsented?.();
    } catch {
      setError("Något gick fel — försök igen eller ring 076-249 84 86.");
    } finally {
      setSubmitting(false);
    }
  }

  if (consented) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50/60 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
        <div>
          <p className="text-sm font-semibold text-nordic-900">Publicering godkänd — tack!</p>
          <p className="mt-1 text-sm leading-6 text-nordic-700">
            Vi granskar uppgifter och bilder och lägger sedan ut annonsen. Exakt adress visas aldrig
            publikt, och du får en länk när annonsen är ute.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Globe className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-nordic-900">Får vi visa din annons online?</p>
          <p className="mt-1 text-sm leading-6 text-nordic-700">
            Fler företag hittar {addresses.length === 1 ? "din bostad" : "dina bostäder"} när annonsen
            syns på stayonsite.se. Exakt adress visas aldrig publikt — bara område och ort — och dina
            kontaktuppgifter lämnas aldrig ut.
          </p>
          {addresses.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-sm text-nordic-600">
              {addresses.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={approve}
        disabled={submitting}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Godkänner…" : "Ja, visa annonsen online"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Du kan när som helst be oss ta ner annonsen — ett meddelande räcker.
      </p>
    </div>
  );
}
