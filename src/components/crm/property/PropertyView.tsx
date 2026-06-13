"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { Home, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PropertyImages } from "./PropertyImages";
import { MatchToRequestModal } from "./MatchToRequestModal";
import { PropertyHistory } from "./PropertyHistory";
import { EmailThread } from "@/components/crm/email/EmailThread";
import { PropertyEditForm } from "./PropertyEditForm";
import { PropertyPublicControls } from "./PropertyPublicControls";
import { Equip, InfoRow } from "./property-ui";
import { PhoneActions } from "@/components/crm/PhoneActions";
import { RatingControl } from "../RatingControl";
import { ReviewRequestSnippet } from "@/components/crm/ReviewRequestSnippet";
import { toast } from "@/components/ui/use-toast";
import useSWR from "swr";
import { swrFetcher } from "@/lib/crm/fetcher";

interface Props {
  property: PropertyWithOwner;
  onUpdate: (data: Partial<PropertyWithOwner>) => Promise<void>;
  onDelete?: () => void | Promise<void>;
  startEditing?: boolean;
}

const STATUSES: { value: string; label: string; cls: string }[] = [
  { value: "available", label: "Tillgänglig", cls: "bg-green-100 text-green-800 border-green-300" },
  { value: "reserved", label: "Reserverad", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "rented", label: "Uthyrd", cls: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "off_market", label: "Av marknaden", cls: "bg-gray-100 text-gray-600 border-gray-300" },
];

const FIELD_CLS = "w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";
const fetcher = swrFetcher;

export function PropertyView({ property, onUpdate, onDelete, startEditing }: Props) {
  const [editing, setEditing] = useState(!!startEditing);
  const [matchOpen, setMatchOpen] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Properties saknar namn → verifiera mot adressen (fallback "RADERA" om adress saknas).
  const delTarget = (property.address ?? "").trim() || "RADERA";

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    setDeleteOpen(false);
  }

  const links = property.links ?? [];
  async function addLink() {
    const url = newLink.trim();
    if (!url) return;
    try {
      await onUpdate({ links: [...links, url] });
      setNewLink("");
      toast({ title: "Länk sparad" });
    } catch {
      /* feltoast visas av onUpdate */
    }
  }
  async function removeLink(url: string) {
    try {
      await onUpdate({ links: links.filter((l) => l !== url) });
      toast({ title: "Länk borttagen" });
    } catch {
      /* feltoast visas av onUpdate */
    }
  }

  // Resynka formuläret när objektet byts ELLER när en write returnerat (ny updatedAt) —
  // så t.ex. en nyskapad/auto-länkad uthyrare (ownerId) reflekteras direkt.
  // Vid mount respekteras startEditing (nyskapat objekt öppnas i redigera-läge).
  // Senare ändringar av samma objekt (t.ex. updatedAt efter sparning) resyncar form och stänger redigering.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setEditing(false);
    setDeleteOpen(false);
    setDeleteConfirm("");
  }, [property.id, property.updatedAt]);

  if (editing) {
    return (
      <PropertyEditForm property={property} onUpdate={onUpdate} onClose={() => setEditing(false)} />
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{property.address || "(Adress saknas)"}</h2>
          <p className="text-sm text-muted-foreground">
            {[property.postalCode, property.city].filter(Boolean).join(" ")}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMatchOpen(true)}>
            <Home className="h-3.5 w-3.5" /> Matcha mot förfrågan
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" /> Redigera
          </Button>
        </div>
      </div>

      <MatchToRequestModal
        propertyId={property.id}
        propertyAddress={property.address}
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Vänster kolumn: objektets fakta */}
        <div className="space-y-6 min-w-0">
          {/* Quick status selector */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((st) => (
                <button
                  key={st.value}
                  onClick={async () => {
                    if (property.status === st.value) return;
                    try {
                      await onUpdate({ status: st.value });
                      toast({ title: "Status sparad" });
                    } catch {
                      /* feltoast visas av onUpdate */
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    property.status === st.value ? st.cls + " font-semibold" : "bg-white border-input text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <PropertyPublicControls property={property} onUpdate={onUpdate} />

          {/* Utrustning — visas alltid så man kan svara direkt */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Utrustning</p>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <Equip label="Tvättmaskin" value={property.washingMachines != null ? String(property.washingMachines) : "–"} />
              <Equip label="Tumlare" value={property.dryers != null ? String(property.dryers) : "–"} />
              <Equip label="Diskmaskin" yes={!!property.dishwasher} />
              <Equip label="Parkering" value={property.parkingSpaces != null ? String(property.parkingSpaces) : "–"} />
              <Equip label="Kök" yes={!!property.kitchen} />
              <Equip label="Garage" yes={!!property.garage} />
              <Equip label="Bredband" yes={!!property.broadband} />
              <Equip label="Möblerat" yes={!!property.furnished} />
              <Equip label="Eget boende" yes={!!property.egetBoende} />
            </div>
          </div>

          {(property.allIncluded || property.linensIncluded || property.heatWaterIncluded || property.excludedNote) && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Vad ingår i hyran</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <Equip label="Allt ingår" yes={!!property.allIncluded} />
                <Equip label="Sängkläder + handduk" yes={!!property.linensIncluded} />
                <Equip label="Värme + varmvatten" yes={!!property.heatWaterIncluded} />
              </div>
              {property.excludedNote && (
                <p className="text-sm mt-2"><span className="text-muted-foreground">Ingår inte:</span> {property.excludedNote}</p>
              )}
            </div>
          )}

          {property.specialNote && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Särskilt att veta</p>
              <p className="text-sm whitespace-pre-wrap">{property.specialNote}</p>
            </div>
          )}

          {property.skick && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Skick</p>
              <p className="text-sm whitespace-pre-wrap">{property.skick}</p>
            </div>
          )}

          <PropertyImages propertyId={property.id} />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Yta" value={property.squareMeters ? `${property.squareMeters.toLocaleString("sv-SE")} m²` : null} />
            <InfoRow label="Sovrum" value={property.bedrooms?.toString()} />
            <InfoRow label="Bäddar" value={property.beds?.toString()} />
            <InfoRow label="Badrum" value={property.bathrooms?.toString()} />
            <InfoRow label="Tillgänglig från" value={property.moveInFrom} />
            <InfoRow label="Tillgänglig till" value={property.availableTo} />
            <InfoRow label="Vi hyr för" value={property.rentIn ? `${property.rentIn.toLocaleString("sv-SE")} kr/mån` : null} />
            <InfoRow label="Vi hyr ut för" value={property.rentOut ? `${property.rentOut.toLocaleString("sv-SE")} kr/mån` : null} />
          </div>

          {property.notes && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Intern beskrivning</p>
              <p className="text-sm whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}

          {property.publicDescription && (
            <div className="rounded-md border border-green-200 bg-green-50/40 p-3">
              <p className="text-xs text-green-800 uppercase tracking-wide mb-1">Extern beskrivning (hemsida)</p>
              <p className="text-sm whitespace-pre-wrap">{property.publicDescription}</p>
            </div>
          )}
        </div>

        {/* Höger kolumn: uthyrare, kontakt & uppföljning, länkar */}
        <div className="space-y-6 min-w-0">
          {/* Uthyrare */}
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Uthyrare
                {property.ownerType && (
                  <span className="ml-2 normal-case font-normal">
                    · {property.ownerType === "foretag" ? "Företag" : "Privatperson"}
                    {property.ownerArrangement === "formedlare" ? " · Förmedlare" : " · Direkt"}
                  </span>
                )}
              </p>
              <RatingControl
                value={property.rating}
                onChange={async (rating) => {
                  try {
                    await onUpdate({ rating });
                    toast({ title: "Skattning sparad" });
                  } catch {
                    /* feltoast visas av onUpdate */
                  }
                }}
                label="Skattning"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label={property.ownerType === "foretag" ? "Företag" : "Namn"} value={property.ownerName} />
              {property.ownerType === "foretag" && <InfoRow label="Org.nr" value={property.ownerOrgNr} />}
              {property.ownerType === "foretag" && <InfoRow label="Kontaktperson" value={property.ownerContactPerson} />}
              <InfoRow label="Telefon" value={property.ownerPhone} actions={<PhoneActions phone={property.ownerPhone} />} />
              <InfoRow label="E-post" value={property.ownerEmail} />
            </div>
            <div className="mt-3">
              <ReviewRequestSnippet name={property.ownerContactPerson ?? property.ownerName} variant="owner" />
            </div>
            {property.ownerId && <OwnerObjectLinks ownerId={property.ownerId} currentPropertyId={property.id} />}
          </div>

          {/* Kontakt & uppföljning (kontaktlogg + följ upp uthyrare ihopslaget) */}
          <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
            <PropertyHistory property={property} />
          </div>

          {/* Mejlhistorik med ägaren */}
          {property.ownerId && (
            <div className="rounded-md border p-3">
              <EmailThread
                ownerId={property.ownerId}
                defaultTo={property.ownerEmail ?? undefined}
              />
            </div>
          )}

          {/* Externa länkar (Airbnb/Qasa/Booking/övrigt) */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Externa länkar</p>
            <div className="space-y-1.5">
              {links.map((url) => (
                <div key={url} className="flex items-center gap-2 text-sm">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate flex-1">
                    {url}
                  </a>
                  <button onClick={() => removeLink(url)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-50 text-muted-foreground hover:text-red-700" title="Ta bort länk">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                  placeholder="Klistra in länk (Airbnb, Qasa, Booking…)"
                  className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button onClick={addLink} disabled={!newLink.trim()} className="h-7 px-2 flex items-center gap-1 text-xs rounded-md border border-input hover:bg-muted disabled:opacity-40">
                  <Plus className="h-3.5 w-3.5" /> Lägg till
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {onDelete && (
        <div className="border-t pt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Radering tar bort objektet, dess förslag/matchningar, bilder och kontaktlogg permanent.
          </p>
          <button
            onClick={() => { setDeleteConfirm(""); setDeleteOpen(true); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Ta bort objekt
          </button>
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={(o) => !o && !deleting && setDeleteOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort {property.address || "objektet"}?</DialogTitle>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">
              Detta går inte att ångra. Objektet och alla dess förslag/matchningar, bilder och kontaktlogg raderas permanent.
            </p>
            <div className="space-y-1 pt-1">
              <label className="text-xs text-muted-foreground">
                Skriv {delTarget === "RADERA" ? "RADERA" : "adressen"} för att bekräfta:
              </label>
              <input className={FIELD_CLS} value={deleteConfirm} placeholder={delTarget} autoFocus onChange={(e) => setDeleteConfirm(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>Avbryt</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deleteConfirm.trim() !== delTarget}
            >
              {deleting ? "Tar bort…" : "Ta bort permanent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OwnerObjectLinks({ ownerId, currentPropertyId }: { ownerId: string; currentPropertyId: string }) {
  const { data: properties = [] } = useSWR<PropertyWithOwner[]>(`/api/crm/properties?ownerId=${ownerId}`, fetcher);
  const others = properties.filter((p) => p.id !== currentPropertyId);
  if (others.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-2">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
        Samma uthyrare ({others.length + 1} objekt)
      </p>
      <div className="space-y-1">
        {others.slice(0, 5).map((p) => (
          <a
            key={p.id}
            href={`/crm/properties?id=${p.id}`}
            className="block rounded border bg-white px-2 py-1.5 text-xs hover:bg-nordic-50"
          >
            <span className="font-medium">{p.address || "(adress saknas)"}</span>
            <span className="text-muted-foreground"> · {[p.postalCode, p.city].filter(Boolean).join(" ") || "ort saknas"}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

