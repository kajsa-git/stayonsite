"use client";

// Uthyrarkortet: snabbvy över en fastighetsägare direkt från Min dag (Svar-panelen)
// — kontaktuppgifter, betyg, anteckningar och alla objekt med status, utan att
// lämna sidan. Objektraderna länkar vidare till objektsbanken.
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPhoneSv, smsHref, whatsappHref } from "@/lib/crm/phone-links";
import { swrFetcher } from "@/lib/crm/fetcher";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface OwnerCard {
  id: string;
  name: string;
  ownerType: string | null;
  ownerArrangement: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  notes: string | null;
  followUpDate: string | null;
  followUpReason: string | null;
  properties: {
    id: string;
    address: string | null;
    city: string | null;
    status: string | null;
    published: boolean | null;
    prospektPublished: boolean | null;
    slug: string | null;
    bedrooms: number | null;
    beds: number | null;
    rentIn: number | null;
    rentOut: number | null;
  }[];
}

const TYPE_LABEL: Record<string, string> = { privatperson: "Privatperson", foretag: "Företag" };
const ARR_LABEL: Record<string, string> = { direkt: "Direktavtal", formedlare: "Förmedlare" };
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  available: { label: "Tillgänglig", cls: "bg-green-100 text-green-800" },
  reserved: { label: "Reserverad", cls: "bg-amber-100 text-amber-800" },
  rented: { label: "Uthyrd", cls: "bg-blue-100 text-blue-800" },
  off_market: { label: "Av marknaden", cls: "bg-nordic-100 text-nordic-600" },
};

export function OwnerQuickDialog({
  ownerId,
  open,
  onOpenChange,
}: {
  ownerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data, isLoading } = useSWR<OwnerCard>(open ? `/api/crm/owners/${ownerId}` : null, swrFetcher);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {data?.name ?? "Uthyrare"}
            <button
              onClick={() => {
                onOpenChange(false);
                router.push(`/crm/uthyrare/${ownerId}`);
              }}
              className="text-xs font-normal underline text-nordic-600 hover:text-nordic-900 inline-flex items-center gap-0.5"
            >
              Öppna uthyrarsidan <ArrowRight className="h-3 w-3" />
            </button>
          </DialogTitle>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Hämtar…
          </div>
        ) : (
          <div className="space-y-4">
            {/* Kontakt & fakta */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {data.ownerType && <span className="px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-700">{TYPE_LABEL[data.ownerType] ?? data.ownerType}</span>}
              {data.ownerArrangement && <span className="px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-700">{ARR_LABEL[data.ownerArrangement] ?? data.ownerArrangement}</span>}
              {data.rating != null && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Betyg {data.rating}/10</span>}
              {data.followUpDate && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Återkomst {data.followUpDate}{data.followUpReason ? ` · ${data.followUpReason}` : ""}
                </span>
              )}
            </div>
            <div className="text-sm space-y-1">
              {data.contactPerson && <div><span className="text-muted-foreground">Kontaktperson:</span> {data.contactPerson}</div>}
              {data.phone && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">Telefon:</span> {formatPhoneSv(data.phone)}
                  <a className="text-[11px] underline text-nordic-600" href={smsHref(data.phone) ?? "#"}>SMS</a>
                  <a className="text-[11px] underline text-nordic-600" href={whatsappHref(data.phone) ?? "#"}>WhatsApp</a>
                  <a className="text-[11px] underline text-nordic-600" href={`tel:${data.phone}`}>Ring</a>
                </div>
              )}
              {data.email && <div><span className="text-muted-foreground">E-post:</span> <a className="underline" href={`mailto:${data.email}`}>{data.email}</a></div>}
            </div>

            {/* Anteckningar */}
            {data.notes?.trim() && (
              <div className="rounded-lg border bg-amber-50/50 border-amber-100 p-2.5">
                <p className="text-[11px] font-semibold text-amber-800 mb-1">Anteckningar</p>
                <p className="text-sm whitespace-pre-wrap break-words">{data.notes}</p>
              </div>
            )}

            {/* Objekt */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Objekt ({data.properties.length})
              </p>
              {data.properties.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Inga objekt kopplade.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.properties.map((p) => {
                    const st = STATUS_LABEL[p.status ?? ""] ?? { label: p.status ?? "?", cls: "bg-nordic-100 text-nordic-600" };
                    return (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/crm/properties?id=${p.id}`)}
                        className="w-full text-left rounded-lg border p-2.5 hover:bg-nordic-50 transition-colors"
                      >
                        <div className="font-medium text-sm">{p.address ?? "(adress saknas)"}{p.city ? ` · ${p.city}` : ""}</div>
                        <div className="flex flex-wrap items-center gap-1 mt-1 text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded ${st.cls}`}>{st.label}</span>
                          {p.published ? (
                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800">På hemsidan ✓</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-600">Ej publicerad</span>
                          )}
                          {p.prospektPublished && <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">Prospekt</span>}
                          {(p.bedrooms || p.beds) && (
                            <span className="text-muted-foreground">{p.bedrooms ? `${p.bedrooms} sovrum` : ""}{p.bedrooms && p.beds ? " · " : ""}{p.beds ? `${p.beds} bäddar` : ""}</span>
                          )}
                          {p.rentIn != null && p.rentOut != null && (
                            <span className="text-muted-foreground ml-auto">marginal {Math.round(p.rentOut - p.rentIn).toLocaleString("sv-SE")} kr/mån</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
