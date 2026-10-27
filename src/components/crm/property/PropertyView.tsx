"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { Calculator, Home, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AgreementStatusPanel } from "@/components/crm/AgreementStatusPanel";
import { ProfitCalculatorDialog } from "@/components/crm/ProfitCalculatorDialog";
import { PropertyImages } from "./PropertyImages";
import { MatchToRequestModal } from "./MatchToRequestModal";
import { PropertyHistory } from "./PropertyHistory";
import { EmailThread } from "@/components/crm/email/EmailThread";
import { PropertyEditForm } from "./PropertyEditForm";
import { PropertyContentReview } from "./PropertyContentReview";
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

const STATUSES = [
  { value: "available", label: "Tillgänglig" },
  { value: "reserved", label: "Reserverad" },
  { value: "rented", label: "Uthyrd" },
  { value: "off_market", label: "Av marknaden" },
];

const FIELD_CLS = "w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";
const fetcher = swrFetcher;

export function PropertyView({ property, onUpdate, onDelete, startEditing }: Props) {
  const [editing, setEditing] = useState(!!startEditing);
  const [matchOpen, setMatchOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Bostad</p>
          <h2 className="break-words text-2xl font-semibold tracking-tight">{property.address || "(Adress saknas)"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[property.postalCode, property.city].filter(Boolean).join(" ") || "Ort saknas"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCalcOpen(true)}>
            <Calculator data-icon="inline-start" /> Kalkyl
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMatchOpen(true)}>
            <Home data-icon="inline-start" /> Matcha mot förfrågan
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
            <Pencil data-icon="inline-start" /> Redigera
          </Button>
        </div>
      </header>

      <ProfitCalculatorDialog
        open={calcOpen}
        onOpenChange={setCalcOpen}
        initialRentIn={property.rentIn}
        initialRentOut={property.rentOut}
      />
      <MatchToRequestModal
        propertyId={property.id}
        propertyAddress={property.address}
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
      />

      <Card className="rounded-xl shadow-none">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5">
          <CardTitle className="text-base">Bostaden i korthet</CardTitle>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Status
            <select
              value={property.status ?? ""}
              onChange={async (event) => {
                try {
                  await onUpdate({ status: event.target.value });
                  toast({ title: "Status sparad" });
                } catch {
                  /* feltoast visas av onUpdate */
                }
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {!STATUSES.some((status) => status.value === property.status) && (
                <option value={property.status ?? ""}>{property.status || "Ej angiven"}</option>
              )}
              {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t pt-4 sm:grid-cols-4">
            <SummaryStat label="Sovrum" value={property.bedrooms?.toString()} />
            <SummaryStat label="Bäddar" value={property.beds?.toString()} />
            <SummaryStat label="Yta" value={property.squareMeters != null ? `${property.squareMeters.toLocaleString("sv-SE")} m²` : null} />
            <SummaryStat label="Badrum" value={property.bathrooms?.toString()} />
            <SummaryStat label="Tillgänglig från" value={property.moveInFrom} />
            <SummaryStat label="Tillgänglig till" value={property.availableTo} />
            <SummaryStat label="Vi hyr för" value={property.rentIn != null ? `${property.rentIn.toLocaleString("sv-SE")} kr/mån` : null} />
            <SummaryStat label="Vi hyr ut för" value={property.rentOut != null ? `${property.rentOut.toLocaleString("sv-SE")} kr/mån` : null} />
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,26rem),1fr))] items-start gap-5">
        <div className="order-2 flex min-w-0 flex-col gap-5 md:order-1">
          <PropertyContentReview property={property} />

          <Card className="rounded-xl shadow-none">
            <CardHeader className="px-5 pb-3 pt-5"><CardTitle className="text-base">Publicering</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5"><PropertyPublicControls property={property} onUpdate={onUpdate} /></CardContent>
          </Card>

          <Card className="rounded-xl shadow-none">
            <CardHeader className="px-5 pb-3 pt-5"><CardTitle className="text-base">Utrustning</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5 px-5 pb-5">
              <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
                <Equip label="Tvättmaskin" value={property.washingMachines != null ? String(property.washingMachines) : "–"} />
                <Equip label="Tumlare" value={property.dryers != null ? String(property.dryers) : "–"} />
                <Equip label="Diskmaskin" yes={property.dishwasher} />
                <Equip label="Parkering" value={property.parkingSpaces != null ? String(property.parkingSpaces) : "–"} />
                <Equip label="Kök" yes={property.kitchen} />
                <Equip label="Garage" yes={property.garage} />
                <Equip label="Bredband" yes={property.broadband} />
                <Equip label="Möblerat" yes={property.furnished} />
                <Equip label="Eget boende" yes={property.egetBoende} />
              </dl>
              {(property.allIncluded || property.linensIncluded || property.heatWaterIncluded || property.excludedNote) && (
                <div className="flex flex-col gap-3 border-t pt-4">
                  <h4 className="text-sm font-semibold">Vad ingår i hyran</h4>
                  <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
                    <Equip label="Allt ingår" yes={property.allIncluded} />
                    <Equip label="Sängkläder + handduk" yes={property.linensIncluded} />
                    <Equip label="Värme + varmvatten" yes={property.heatWaterIncluded} />
                  </dl>
                  {property.excludedNote && <p className="text-sm leading-relaxed"><span className="font-medium">Ingår inte:</span> {property.excludedNote}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {(property.specialNote || property.skick || property.notes || property.publicDescription) && (
            <Card className="rounded-xl shadow-none">
              <CardHeader className="px-5 pb-3 pt-5"><CardTitle className="text-base">Beskrivning och anteckningar</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4 px-5 pb-5">
                {property.specialNote && <TextSection label="Särskilt att veta" text={property.specialNote} />}
                {property.skick && <TextSection label="Skick" text={property.skick} />}
                {property.notes && <TextSection label="Intern beskrivning" text={property.notes} />}
                {property.publicDescription && <TextSection label="Extern beskrivning (hemsida)" text={property.publicDescription} />}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5"><PropertyImages propertyId={property.id} /></CardContent>
          </Card>
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-5 md:order-2">
          <Card className="rounded-xl shadow-none">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5">
              <div>
                <CardTitle className="text-base">Uthyrare</CardTitle>
                {property.ownerType && <p className="mt-1 text-xs text-muted-foreground">
                  {property.ownerType === "foretag" ? "Företag" : "Privatperson"}
                  {property.ownerArrangement === "formedlare" ? " · Förmedlare" : " · Direkt"}
                </p>}
              </div>
              <div className="min-w-0 max-w-full [&>div]:flex-wrap">
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
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <InfoRow label={property.ownerType === "foretag" ? "Företag" : "Namn"} value={property.ownerName} />
                {property.ownerType === "foretag" && <InfoRow label="Org.nr" value={property.ownerOrgNr} />}
                {property.ownerType === "foretag" && <InfoRow label="Kontaktperson" value={property.ownerContactPerson} />}
                <InfoRow label="Telefon" value={formatPhoneSv(property.ownerPhone)} actions={<PhoneActions phone={property.ownerPhone} />} />
                <InfoRow label="E-post" value={property.ownerEmail} />
              </dl>
              <div className="mt-4"><ReviewRequestSnippet name={property.ownerContactPerson ?? property.ownerName} variant="owner" /></div>
              {property.ownerId && <OwnerObjectLinks ownerId={property.ownerId} currentPropertyId={property.id} />}
            </CardContent>
          </Card>

          {property.ownerId && (
            <AgreementStatusPanel kind="owner" id={property.ownerId} contactName={property.ownerContactPerson ?? property.ownerName ?? undefined} />
          )}

          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5"><PropertyHistory property={property} /></CardContent>
          </Card>

          {property.ownerId && (
            <Card className="rounded-xl shadow-none">
              <CardContent className="p-5"><EmailThread ownerId={property.ownerId} defaultTo={property.ownerEmail ?? undefined} /></CardContent>
            </Card>
          )}

          <Card className="rounded-xl shadow-none">
            <CardHeader className="px-5 pb-3 pt-5"><CardTitle className="text-base">Externa länkar</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 px-5 pb-5">
              {links.map((url) => (
                <div key={url} className="flex items-center gap-2 text-sm">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-primary-600 hover:underline">{url}</a>
                  <button onClick={() => removeLink(url)} className="flex size-8 items-center justify-center rounded text-muted-foreground hover:bg-red-50 hover:text-red-700" aria-label="Ta bort länk" title="Ta bort länk"><X className="size-4" /></button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input value={newLink} onChange={(e) => setNewLink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} placeholder="Klistra in länk (Airbnb, Qasa, Booking…)" aria-label="Extern länk" className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500" />
                <Button variant="outline" size="sm" onClick={addLink} disabled={!newLink.trim()}><Plus data-icon="inline-start" /> Lägg till</Button>
              </div>
            </CardContent>
          </Card>
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

function SummaryStat({ label, value }: { label: string; value?: string | null }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value || "–"}</dd></div>;
}

function TextSection({ label, text }: { label: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 320 || text.split("\n").length > 5;
  return (
    <div>
      <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h4>
      <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${long && !expanded ? "line-clamp-4" : ""}`}>{text}</p>
      {long && <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-1 text-sm font-medium text-primary-600 hover:underline">{expanded ? "Visa mindre" : "Visa hela"}<span className="sr-only">: {label}</span></button>}
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

