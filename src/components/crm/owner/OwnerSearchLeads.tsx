"use client";

import { PhoneActions } from "@/components/crm/PhoneActions";
import { filterOwnerSearchLeads, type OwnerSearchLead } from "@/lib/crm/owner-search-leads";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import Link from "next/link";

export function OwnerSearchLeads({
  leads, city, query, ownerId, error, travelSearch = false,
}: {
  leads: OwnerSearchLead[];
  city?: string | null;
  query?: string;
  ownerId?: string;
  error?: unknown;
  travelSearch?: boolean;
}) {
  if (!city?.trim() && !query?.trim()) return null;
  if (error) return <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Uthyrarkontakter kunde inte hämtas. Försök igen.</p>;
  const matches = filterOwnerSearchLeads(leads, { city, query, ownerId });
  if (!matches.length) return null;

  return (
    <section aria-label="Uthyrare att kontakta" className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
      <h3 className="text-sm font-semibold text-amber-950">Uthyrare att kontakta ({matches.length})</h3>
      <p className="mt-1 text-xs text-amber-900">
        Bostadens detaljer och tillgänglighet behöver bekräftas.{travelSearch && " Restiden är inte beräknad för dessa kontakter."}
      </p>
      <div className="mt-2 space-y-2">
        {matches.map((owner) => (
          <div key={owner.id} className="rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm">
            <Link className="font-medium text-nordic-900 hover:underline" href={`/crm/uthyrare/${owner.id}`}>{owner.name}</Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{owner.cities.join(" · ")}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {owner.contactPerson && <span>{owner.contactPerson}</span>}
              {owner.phone && <><a className="text-primary-700 hover:underline" href={`tel:${owner.phone}`}>{formatPhoneSv(owner.phone)}</a><PhoneActions phone={owner.phone} ownerId={owner.id} /></>}
              {owner.email && <a className="text-primary-700 hover:underline" href={`mailto:${owner.email}`}>{owner.email}</a>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
