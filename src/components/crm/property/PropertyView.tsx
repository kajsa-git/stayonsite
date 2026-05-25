"use client";

import type { Property } from "@/lib/crm/schema";

interface Props {
  property: Property;
  onUpdate: (data: Partial<Property>) => Promise<void>;
}

export function PropertyView({ property, onUpdate }: Props) {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold">{property.address || "(Adress saknas)"}</h2>
        <p className="text-sm text-muted-foreground">{property.city}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <InfoRow label="Sovrum" value={property.bedrooms?.toString()} />
        <InfoRow label="Bäddar" value={property.beds?.toString()} />
        <InfoRow label="Badrum" value={property.bathrooms?.toString()} />
        <InfoRow label="Status" value={property.status} />
        <InfoRow label="Uthyrare" value={property.ownerName} />
        <InfoRow label="Telefon" value={property.ownerPhone} />
        <InfoRow label="E-post" value={property.ownerEmail} />
        <InfoRow label="Tillgänglig" value={property.moveInFrom} />
        <InfoRow label="Vi hyr för" value={property.rentIn ? `${property.rentIn} kr/mån` : null} />
        <InfoRow label="Vi hyr ut för" value={property.rentOut ? `${property.rentOut} kr/mån` : null} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
