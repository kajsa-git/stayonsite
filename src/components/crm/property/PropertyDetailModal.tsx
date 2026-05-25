"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Property } from "@/lib/crm/schema";
import useSWR from "swr";

interface Image {
  id: string;
  fileName: string | null;
  url: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PROP_STATUS: Record<string, string> = {
  available: "Tillgänglig",
  reserved: "Reserverad",
  rented: "Uthyrd",
  off_market: "Av marknaden",
};

export function PropertyDetailModal({ property, onClose }: { property: Property | null; onClose: () => void }) {
  const { data: images = [] } = useSWR<Image[]>(
    property ? `/api/crm/properties/${property.id}/images` : null,
    fetcher
  );

  if (!property) return null;
  const p = property;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{p.address || "(Adress saknas)"}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          {[p.postalCode, p.city].filter(Boolean).join(" ")} · {PROP_STATUS[p.status ?? "available"] ?? p.status}
        </p>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={img.url} alt={img.fileName ?? "Bild"} className="w-full aspect-square object-cover rounded-md border" />
            ))}
          </div>
        )}

        {/* Utrustning */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Utrustning</p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <Item label="Tvättmaskin" value={p.washingMachines != null ? String(p.washingMachines) : "–"} />
            <Item label="Tumlare" value={p.dryers != null ? String(p.dryers) : "–"} />
            <Item label="Parkering" value={p.parkingSpaces != null ? String(p.parkingSpaces) : "–"} />
            <Item label="Kök" value={p.kitchen ? "Ja" : "Nej"} good={!!p.kitchen} />
            <Item label="Garage" value={p.garage ? "Ja" : "Nej"} good={!!p.garage} />
            <Item label="Bredband" value={p.broadband ? "Ja" : "Nej"} good={!!p.broadband} />
            <Item label="Möblerat" value={p.furnished ? "Ja" : "Nej"} good={!!p.furnished} />
            <Item label="Eget boende" value={p.egetBoende ? "Ja" : "Nej"} good={!!p.egetBoende} />
          </div>
        </div>

        {p.skick && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Skick</p>
            <p className="text-sm whitespace-pre-wrap">{p.skick}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Item label="Yta" value={p.squareMeters ? `${p.squareMeters} m²` : "–"} />
          <Item label="Sovrum" value={p.bedrooms?.toString() ?? "–"} />
          <Item label="Bäddar" value={p.beds?.toString() ?? "–"} />
          <Item label="Badrum" value={p.bathrooms?.toString() ?? "–"} />
          <Item label="Tillgänglig från" value={p.moveInFrom ?? "–"} />
          <Item label="Tillgänglig till" value={p.availableTo ?? "–"} />
          <Item label="Vi hyr för" value={p.rentIn ? `${p.rentIn} kr/mån` : "–"} />
          <Item label="Vi hyr ut för" value={p.rentOut ? `${p.rentOut} kr/mån` : "–"} />
          <Item label="Uthyrare" value={p.ownerName ?? "–"} />
          <Item label="Telefon" value={p.ownerPhone ?? "–"} />
          <Item label="E-post" value={p.ownerEmail ?? "–"} />
        </div>

        {p.notes && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Intern beskrivning</p>
            <p className="text-sm whitespace-pre-wrap">{p.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Item({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${good ? "text-green-700" : ""}`}>{value}</dd>
    </div>
  );
}
