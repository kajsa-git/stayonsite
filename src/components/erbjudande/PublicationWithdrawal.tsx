"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ConsentableProperty } from "@/lib/crm/publish-consent";

export function PublicationWithdrawal({ token, properties }: { token: string; properties: ConsentableProperty[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function withdraw(property: ConsentableProperty) {
    const name = [property.address, property.city].filter(Boolean).join(", ") || "bostaden";
    if (!window.confirm(`Ta bort ${name} från hemsidan? Eventuell prospektlänk stängs också.`)) return;
    setBusyId(property.id);
    setError("");
    try {
      const response = await fetch(`/api/share/${token}/publish-consent`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw", propertyIds: [property.id] }),
      });
      if (!response.ok) throw new Error("Det gick inte att ta bort annonsen. Kontakta Kajsa på StayOnSite så hjälper vi dig.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel. Försök igen.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-nordic-900">Dina bostäder på StayOnSite</h2>
      <p className="mt-1 text-sm text-nordic-700">Du kan när som helst ta bort en bostad från hemsidan. En eventuell prospektlänk stängs också.</p>
      <ul className="mt-4 space-y-3">
        {properties.map((property) => (
          <li key={property.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-nordic-50 p-3">
            <span className="text-sm">{[property.address, property.city].filter(Boolean).join(", ") || "Bostad utan angiven adress"}</span>
            <button type="button" onClick={() => withdraw(property)} disabled={busyId !== null} className="rounded-md border bg-white px-3 py-2 text-sm font-medium disabled:opacity-60">
              {busyId === property.id ? "Tar bort…" : "Ta bort från hemsidan"}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
    </section>
  );
}
