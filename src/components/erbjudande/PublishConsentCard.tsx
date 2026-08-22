"use client";

// Publiceringsgodkännandet som en liten bock — medvetet odramatiskt (Kajsas
// riktning 2026-08-18). För osignerade ägare ligger bocken förifylld inne i
// AgreementGate; det här kortet visas bara när signeringen redan är klar och
// ett kryss i rutan sparar godkännandet direkt. Exakt adress visas aldrig
// publikt (integritetsregeln för den publika speglingen); att ta ner en annons
// är fortsatt manuellt — ett meddelande räcker.
import { useState } from "react";

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
    if (consented || submitting) return;
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

  return (
    <label className={`flex items-start gap-2.5 rounded-2xl border bg-white p-4 ${consented ? "" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={consented || submitting} // optimistiskt ikryssad medan sparandet pågår
        disabled={submitting || consented}
        onChange={approve}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#ff6300]"
      />
      <span className="text-sm leading-relaxed">
        <span className="font-medium text-nordic-900">Visa annonsen på stayonsite.se.</span>{" "}
        {consented ? (
          <span className="text-nordic-700">
            Vi granskar uppgifter och bilder, lägger sedan ut annonsen och skickar dig länken. Vill du ta ner
            den räcker ett meddelande.
          </span>
        ) : (
          <span className="text-nordic-700">
            Fler företag hittar {addresses.length === 1 ? "din bostad" : "dina bostäder"} när annonsen syns
            online. Exakt adress visas aldrig publikt — bara område och ort — och dina kontaktuppgifter lämnas
            aldrig ut.
          </span>
        )}
        {!consented && addresses.length > 1 && (
          <span className="mt-1 block text-nordic-600">{addresses.join(" · ")}</span>
        )}
        {error && <span className="mt-1 block text-red-700">{error}</span>}
      </span>
    </label>
  );
}
