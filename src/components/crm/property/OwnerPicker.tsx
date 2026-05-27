"use client";

import { Input } from "@/components/ui/input";
import type { Owner } from "@/lib/crm/schema";
import { Link2, Search, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

export type OwnerPickerValue = {
  ownerId?: string | null;
  ownerType?: string | null;
  ownerArrangement?: string | null;
  ownerName?: string | null;
  ownerOrgNr?: string | null;
  ownerContactPerson?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  rating?: number | null;
};

type OwnerRow = Owner & { propertyCount?: number };

interface Props {
  value: OwnerPickerValue;
  onChange: (patch: Partial<OwnerPickerValue>) => void;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function OwnerPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const { data: owners = [] } = useSWR<OwnerRow[]>(
    trimmed ? `/api/crm/owners?q=${encodeURIComponent(trimmed)}&limit=8` : null,
    fetcher,
  );

  function pick(owner: OwnerRow) {
    onChange({
      ownerId: owner.id,
      ownerType: owner.ownerType,
      ownerArrangement: owner.ownerArrangement,
      ownerName: owner.name,
      ownerOrgNr: owner.orgNr,
      ownerContactPerson: owner.contactPerson,
      ownerPhone: owner.phone,
      ownerEmail: owner.email,
      rating: owner.rating,
    });
    setQuery("");
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 pl-7 text-sm"
          placeholder="Sök befintlig uthyrare…"
        />
      </div>

      {value.ownerId && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs text-teal-900">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{value.ownerName || "Kopplad uthyrare"}</span>
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({
                ownerId: null,
                ownerName: "",
                ownerOrgNr: "",
                ownerContactPerson: "",
                ownerPhone: "",
                ownerEmail: "",
              })
            }
            className="inline-flex items-center gap-1 rounded border border-teal-200 bg-white px-1.5 py-0.5 text-teal-800 hover:bg-teal-100"
          >
            <X className="h-3 w-3" />
            Koppla loss
          </button>
        </div>
      )}

      {owners.length > 0 && (
        <div className="rounded-md border divide-y bg-white overflow-hidden">
          {owners.map((owner) => {
            const active = owner.id === value.ownerId;
            return (
              <button
                key={owner.id}
                type="button"
                onClick={() => pick(owner)}
                className={`w-full px-2.5 py-2 text-left hover:bg-nordic-50 ${active ? "bg-teal-50" : ""}`}
              >
                <span className="block text-sm font-medium truncate">{owner.name}</span>
                <span className="block text-xs text-muted-foreground truncate">
                  {[owner.contactPerson, owner.phone || owner.email, owner.propertyCount != null ? `${owner.propertyCount} objekt` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
