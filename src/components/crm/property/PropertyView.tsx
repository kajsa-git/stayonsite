"use client";

import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/crm/schema";
import { Home, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PropertyImages } from "./PropertyImages";
import { MatchToRequestModal } from "./MatchToRequestModal";
import { PropertyHistory } from "./PropertyHistory";
import { CopyProspektLink } from "./CopyProspektLink";
import { RatingControl } from "../RatingControl";

interface Props {
  property: Property;
  onUpdate: (data: Partial<Property>) => Promise<void>;
}

const STATUSES: { value: string; label: string; cls: string }[] = [
  { value: "available", label: "Tillgänglig", cls: "bg-green-100 text-green-800 border-green-300" },
  { value: "reserved", label: "Reserverad", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "rented", label: "Uthyrd", cls: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "off_market", label: "Av marknaden", cls: "bg-gray-100 text-gray-600 border-gray-300" },
];

type EditForm = {
  address: string;
  postalCode: string;
  city: string;
  squareMeters: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  washingMachines: string;
  dryers: string;
  parkingSpaces: string;
  skick: string;
  rentIn: string;
  rentOut: string;
  moveInFrom: string;
  availableTo: string;
  ownerType: string;
  ownerArrangement: string;
  ownerName: string;
  ownerOrgNr: string;
  ownerContactPerson: string;
  ownerPhone: string;
  ownerEmail: string;
  notes: string;
  publicDescription: string;
  furnished: boolean;
  kitchen: boolean;
  garage: boolean;
  broadband: boolean;
  egetBoende: boolean;
};

const s = (v: string | null | undefined) => v ?? "";
const ns = (v: number | null | undefined) => v?.toString() ?? "";

function toForm(p: Property): EditForm {
  return {
    address: s(p.address),
    postalCode: s(p.postalCode),
    city: s(p.city),
    squareMeters: ns(p.squareMeters),
    bedrooms: ns(p.bedrooms),
    beds: ns(p.beds),
    bathrooms: ns(p.bathrooms),
    washingMachines: ns(p.washingMachines),
    dryers: ns(p.dryers),
    parkingSpaces: ns(p.parkingSpaces),
    skick: s(p.skick),
    rentIn: ns(p.rentIn),
    rentOut: ns(p.rentOut),
    moveInFrom: s(p.moveInFrom),
    availableTo: s(p.availableTo),
    ownerType: s(p.ownerType) || "privatperson",
    ownerArrangement: s(p.ownerArrangement) || "direkt",
    ownerName: s(p.ownerName),
    ownerOrgNr: s(p.ownerOrgNr),
    ownerContactPerson: s(p.ownerContactPerson),
    ownerPhone: s(p.ownerPhone),
    ownerEmail: s(p.ownerEmail),
    notes: s(p.notes),
    publicDescription: s(p.publicDescription),
    furnished: !!p.furnished,
    kitchen: !!p.kitchen,
    garage: !!p.garage,
    broadband: !!p.broadband,
    egetBoende: !!p.egetBoende,
  };
}

const FIELD_CLS = "w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function PropertyView({ property, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>(toForm(property));
  const [saving, setSaving] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [newLink, setNewLink] = useState("");

  const links = property.links ?? [];
  function addLink() {
    const url = newLink.trim();
    if (!url) return;
    onUpdate({ links: [...links, url] });
    setNewLink("");
  }
  function removeLink(url: string) {
    onUpdate({ links: links.filter((l) => l !== url) });
  }

  useEffect(() => {
    setForm(toForm(property));
    setEditing(false);
  }, [property.id]);

  function set<K extends keyof EditForm>(field: K, value: EditForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const t = (v: string) => v.trim() || null;
    const num = (v: string) => (v ? parseFloat(v) : null);
    const int = (v: string) => (v ? parseInt(v, 10) : null);
    await onUpdate({
      address: t(form.address),
      postalCode: t(form.postalCode),
      city: t(form.city),
      squareMeters: num(form.squareMeters),
      bedrooms: int(form.bedrooms),
      beds: int(form.beds),
      bathrooms: int(form.bathrooms),
      washingMachines: int(form.washingMachines),
      dryers: int(form.dryers),
      parkingSpaces: int(form.parkingSpaces),
      skick: t(form.skick),
      rentIn: num(form.rentIn),
      rentOut: num(form.rentOut),
      moveInFrom: t(form.moveInFrom),
      availableTo: t(form.availableTo),
      ownerType: form.ownerType,
      ownerArrangement: form.ownerArrangement,
      ownerName: t(form.ownerName),
      ownerOrgNr: t(form.ownerOrgNr),
      ownerContactPerson: t(form.ownerContactPerson),
      ownerPhone: t(form.ownerPhone),
      ownerEmail: t(form.ownerEmail),
      notes: t(form.notes),
      publicDescription: t(form.publicDescription),
      furnished: form.furnished,
      kitchen: form.kitchen,
      garage: form.garage,
      broadband: form.broadband,
      egetBoende: form.egetBoende,
    });
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="max-w-lg space-y-3">
        <h2 className="text-sm font-semibold mb-2">Redigera bostad</h2>
        <Labeled label="Adress">
          <input className={FIELD_CLS} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Labeled>
        <div className="grid grid-cols-3 gap-2">
          <Labeled label="Postnummer">
            <input className={FIELD_CLS} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
          </Labeled>
          <Labeled label="Ort">
            <input className={FIELD_CLS} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Labeled>
          <Labeled label="Yta (m²)">
            <input type="number" className={FIELD_CLS} value={form.squareMeters} onChange={(e) => set("squareMeters", e.target.value)} />
          </Labeled>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Labeled label="Sovrum">
            <input type="number" className={FIELD_CLS} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </Labeled>
          <Labeled label="Bäddar">
            <input type="number" className={FIELD_CLS} value={form.beds} onChange={(e) => set("beds", e.target.value)} />
          </Labeled>
          <Labeled label="Badrum">
            <input type="number" className={FIELD_CLS} value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </Labeled>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Labeled label="Tvättmaskin (antal)">
            <input type="number" className={FIELD_CLS} value={form.washingMachines} onChange={(e) => set("washingMachines", e.target.value)} />
          </Labeled>
          <Labeled label="Tumlare (antal)">
            <input type="number" className={FIELD_CLS} value={form.dryers} onChange={(e) => set("dryers", e.target.value)} />
          </Labeled>
          <Labeled label="Parkering (antal)">
            <input type="number" className={FIELD_CLS} value={form.parkingSpaces} onChange={(e) => set("parkingSpaces", e.target.value)} />
          </Labeled>
        </div>
        <div className="flex flex-wrap gap-4 py-1">
          <Check label="Möblerat" checked={form.furnished} onChange={(v) => set("furnished", v)} />
          <Check label="Kök" checked={form.kitchen} onChange={(v) => set("kitchen", v)} />
          <Check label="Garage" checked={form.garage} onChange={(v) => set("garage", v)} />
          <Check label="Bredband" checked={form.broadband} onChange={(v) => set("broadband", v)} />
          <Check label="Eget boende" checked={form.egetBoende} onChange={(v) => set("egetBoende", v)} />
        </div>
        <Labeled label="Skick (fritext)">
          <textarea className={`${FIELD_CLS} min-h-[48px] resize-y`} value={form.skick} placeholder="T.ex. fint och fräscht, äldre standard, lantligt…" onChange={(e) => set("skick", e.target.value)} />
        </Labeled>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Vi hyr för (kr/mån)">
            <input type="number" className={FIELD_CLS} value={form.rentIn} onChange={(e) => set("rentIn", e.target.value)} />
          </Labeled>
          <Labeled label="Vi hyr ut för (kr/mån)">
            <input type="number" className={FIELD_CLS} value={form.rentOut} onChange={(e) => set("rentOut", e.target.value)} />
          </Labeled>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Tillgänglig från">
            <input type="date" className={FIELD_CLS} value={form.moveInFrom} onChange={(e) => set("moveInFrom", e.target.value)} />
          </Labeled>
          <Labeled label="Tillgänglig till">
            <input type="date" className={FIELD_CLS} value={form.availableTo} onChange={(e) => set("availableTo", e.target.value)} />
          </Labeled>
        </div>
        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Uthyrare</p>
          <div className="grid grid-cols-2 gap-2">
            <Labeled label="Typ">
              <select className={FIELD_CLS} value={form.ownerType} onChange={(e) => set("ownerType", e.target.value)}>
                <option value="privatperson">Privatperson</option>
                <option value="foretag">Företag</option>
              </select>
            </Labeled>
            <Labeled label="Upplägg">
              <select className={FIELD_CLS} value={form.ownerArrangement} onChange={(e) => set("ownerArrangement", e.target.value)}>
                <option value="direkt">Direkt (fastighetsägaren själv)</option>
                <option value="formedlare">Förmedlare (ofta dyrare)</option>
              </select>
            </Labeled>
          </div>
          <Labeled label={form.ownerType === "foretag" ? "Företagsnamn" : "Namn"}>
            <input className={FIELD_CLS} value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
          </Labeled>
          {form.ownerType === "foretag" && (
            <div className="grid grid-cols-2 gap-2">
              <Labeled label="Org.nr">
                <input className={FIELD_CLS} value={form.ownerOrgNr} onChange={(e) => set("ownerOrgNr", e.target.value)} />
              </Labeled>
              <Labeled label="Kontaktperson">
                <input className={FIELD_CLS} value={form.ownerContactPerson} onChange={(e) => set("ownerContactPerson", e.target.value)} />
              </Labeled>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Labeled label="Telefon">
              <input className={FIELD_CLS} value={form.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} />
            </Labeled>
            <Labeled label="E-post">
              <input className={FIELD_CLS} value={form.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} />
            </Labeled>
          </div>
        </div>
        <Labeled label="Intern beskrivning (visas aldrig publikt)">
          <textarea className={`${FIELD_CLS} min-h-[60px] resize-y`} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Labeled>
        <Labeled label="Extern beskrivning (visas på hemsidan)">
          <textarea className={`${FIELD_CLS} min-h-[60px] resize-y`} value={form.publicDescription} onChange={(e) => set("publicDescription", e.target.value)} />
        </Labeled>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => { setForm(toForm(property)); setEditing(false); }}>
            Avbryt
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Sparar…" : "Spara"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-start justify-between gap-3">
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

      {/* Quick status selector */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((st) => (
            <button
              key={st.value}
              onClick={() => property.status !== st.value && onUpdate({ status: st.value })}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                property.status === st.value ? st.cls + " font-semibold" : "bg-white border-input text-muted-foreground hover:bg-muted"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Publish / unpublish (mirrors to public website) */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Hemsida</p>
        {property.published ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md border bg-green-100 text-green-800 border-green-300 font-semibold">
              ✓ Publicerad på hemsidan
            </span>
            <CopyProspektLink propertyId={property.id} />
            <button
              onClick={() => onUpdate({ published: false })}
              className="text-xs px-2.5 py-1 rounded-md border border-input text-muted-foreground hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              Avpublicera
            </button>
          </div>
        ) : (
          <button
            onClick={() => onUpdate({ published: true })}
            className="text-xs px-2.5 py-1 rounded-md border border-input text-muted-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
          >
            Publicera på hemsidan
          </button>
        )}
      </div>

      {/* Utrustning — visas alltid så man kan svara direkt */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Utrustning</p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
          <Equip label="Tvättmaskin" value={property.washingMachines != null ? String(property.washingMachines) : "–"} />
          <Equip label="Tumlare" value={property.dryers != null ? String(property.dryers) : "–"} />
          <Equip label="Parkering" value={property.parkingSpaces != null ? String(property.parkingSpaces) : "–"} />
          <Equip label="Kök" yes={!!property.kitchen} />
          <Equip label="Garage" yes={!!property.garage} />
          <Equip label="Bredband" yes={!!property.broadband} />
          <Equip label="Möblerat" yes={!!property.furnished} />
          <Equip label="Eget boende" yes={!!property.egetBoende} />
        </div>
      </div>

      {property.skick && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Skick</p>
          <p className="text-sm whitespace-pre-wrap">{property.skick}</p>
        </div>
      )}

      <PropertyImages propertyId={property.id} />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <InfoRow label="Yta" value={property.squareMeters ? `${property.squareMeters} m²` : null} />
        <InfoRow label="Sovrum" value={property.bedrooms?.toString()} />
        <InfoRow label="Bäddar" value={property.beds?.toString()} />
        <InfoRow label="Badrum" value={property.bathrooms?.toString()} />
        <InfoRow label="Tillgänglig från" value={property.moveInFrom} />
        <InfoRow label="Tillgänglig till" value={property.availableTo} />
        <InfoRow label="Vi hyr för" value={property.rentIn ? `${property.rentIn} kr/mån` : null} />
        <InfoRow label="Vi hyr ut för" value={property.rentOut ? `${property.rentOut} kr/mån` : null} />
      </div>

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
          <RatingControl value={property.rating} onChange={(rating) => onUpdate({ rating })} label="Skattning" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label={property.ownerType === "foretag" ? "Företag" : "Namn"} value={property.ownerName} />
          {property.ownerType === "foretag" && <InfoRow label="Org.nr" value={property.ownerOrgNr} />}
          {property.ownerType === "foretag" && <InfoRow label="Kontaktperson" value={property.ownerContactPerson} />}
          <InfoRow label="Telefon" value={property.ownerPhone} />
          <InfoRow label="E-post" value={property.ownerEmail} />
        </div>
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

      <div className="border-t pt-4">
        <PropertyHistory propertyId={property.id} />
      </div>
    </div>
  );
}

function Equip({ label, value, yes }: { label: string; value?: string; yes?: boolean }) {
  const display = value ?? (yes ? "Ja" : "Nej");
  const color = value
    ? "text-nordic-900"
    : yes
      ? "text-green-700 font-medium"
      : "text-muted-foreground";
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${color}`}>{display}</dd>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
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
