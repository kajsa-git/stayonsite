"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { slugify } from "@/lib/crm/slug";
import {
  autoPublicNameForForm,
  ownerPatchToForm,
  previewPublicSlug,
  propertyFormToPayload,
  toPropertyForm,
  type EditForm,
} from "./property-form-state";
import { ChevronRight, Languages, Loader2, Navigation, Plus, Sparkles, X } from "lucide-react";
import { loadGoogleMapsLibrary } from "@/hooks/use-google-places";
import { useEffect, useRef, useState } from "react";
import { OwnerPicker, type OwnerPickerValue } from "./OwnerPicker";
import { Check, FIELD_CLS, Labeled } from "./property-ui";

// Redigeringsläget för ett objekt. Utbrutet ur PropertyView — oförändrat beteende.
// Äger formulär-state + AI/kart-actions; resynkar form om objektet ändras (updatedAt
// efter sparning, t.ex. auto-länkad uthyrare). onClose() stänger redigeringen.
export function PropertyEditForm({
  property,
  onUpdate,
  onClose,
}: {
  property: PropertyWithOwner;
  onUpdate: (data: Partial<PropertyWithOwner>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>(toPropertyForm(property));
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showI18n, setShowI18n] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [computingDist, setComputingDist] = useState(false);

  // Resynka formuläret när objektet ändras (ny updatedAt efter sparning) — så t.ex.
  // en nyskapad/auto-länkad uthyrare (ownerId) reflekteras. Hoppar över första körningen.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setForm(toPropertyForm(property));
  }, [property.id, property.updatedAt]);

  function set<K extends keyof EditForm>(field: K, value: EditForm[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Förhandsvisning av deterministiskt auto-namn + slug (speglar serverns default i owners.ts).
  const autoPublicName = autoPublicNameForForm(form);
  const previewSlug = previewPublicSlug(form);

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdate(propertyFormToPayload(form));
      onClose();
      toast({ title: "Objekt sparat" });
    } catch {
      /* feltoast visas av onUpdate; behåll redigeringsläget för retry */
    } finally {
      setSaving(false);
    }
  }

  async function computeDistances() {
    const origin = [form.address, form.postalCode, form.city].filter(Boolean).join(" ");
    if (!origin) {
      toast({ title: "Objektet saknar adress att mäta från" });
      return;
    }
    const rows = form.distances.filter((d) => d.address?.trim());
    if (rows.length === 0) {
      toast({ title: "Lägg till platser med adress först" });
      return;
    }
    setComputingDist(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = await loadGoogleMapsLibrary<any>("routes");
      if (!lib?.DistanceMatrixService) {
        toast({ title: "Kartan kunde inte laddas", variant: "destructive" });
        return;
      }
      const svc = new lib.DistanceMatrixService();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any = await new Promise((resolve) =>
        svc.getDistanceMatrix(
          { origins: [origin], destinations: rows.map((d) => d.address), travelMode: "DRIVING" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (r: any) => resolve(r),
        ),
      );
      const elements = resp?.rows?.[0]?.elements ?? [];
      const byAddr = new Map<string, { km: number; minutes: number }>();
      rows.forEach((d, j) => {
        const el = elements[j];
        if (el?.status === "OK") {
          byAddr.set(d.address!, {
            km: Math.round((el.distance.value / 1000) * 10) / 10,
            minutes: Math.round(el.duration.value / 60),
          });
        }
      });
      if (byAddr.size === 0) {
        toast({ title: "Inga avstånd kunde beräknas", variant: "destructive" });
        return;
      }
      setForm((f) => ({
        ...f,
        distances: f.distances.map((d) => (d.address && byAddr.has(d.address) ? { ...d, ...byAddr.get(d.address)! } : d)),
      }));
      toast({ title: "Avstånd uppdaterade" });
    } catch {
      toast({ title: "Kunde inte räkna avstånd", variant: "destructive" });
    } finally {
      setComputingDist(false);
    }
  }

  async function generateDescription() {
    setDescribing(true);
    try {
      const res = await fetch(`/api/crm/properties/${property.id}/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          postalCode: form.postalCode,
          squareMeters: form.squareMeters,
          bedrooms: form.bedrooms,
          beds: form.beds,
          bathrooms: form.bathrooms,
          furnished: form.furnished,
          kitchen: form.kitchen,
          garage: form.garage,
          broadband: form.broadband,
          egetBoende: form.egetBoende,
          parkingSpaces: form.parkingSpaces,
          washingMachines: form.washingMachines,
          dryers: form.dryers,
          skick: form.skick,
          moveInFrom: form.moveInFrom,
          availableTo: form.availableTo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Generering misslyckades", variant: "destructive" });
        return;
      }
      setForm((f) => ({ ...f, publicDescription: data.description ?? f.publicDescription }));
      toast({ title: "Beskrivning genererad — granska och spara" });
    } catch {
      toast({ title: "Generering misslyckades", variant: "destructive" });
    } finally {
      setDescribing(false);
    }
  }

  async function generateTranslations() {
    if (!form.publicDescription.trim() && !form.skick.trim()) {
      toast({ title: "Fyll i beskrivning eller skick först" });
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/crm/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicDescription: form.publicDescription,
          skick: form.skick,
          inclusions: form.inclusions.map((x) => x.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Översättning misslyckades", variant: "destructive" });
        return;
      }
      setForm((f) => ({
        ...f,
        publicDescriptionEn: data.publicDescriptionEn ?? "",
        publicDescriptionPl: data.publicDescriptionPl ?? "",
        skickEn: data.skickEn ?? "",
        skickPl: data.skickPl ?? "",
        inclusionsEn: Array.isArray(data.inclusionsEn) ? data.inclusionsEn : f.inclusionsEn,
        inclusionsPl: Array.isArray(data.inclusionsPl) ? data.inclusionsPl : f.inclusionsPl,
      }));
      setShowI18n(true);
      toast({ title: "Översättningar genererade — granska och spara" });
    } catch {
      toast({ title: "Översättning misslyckades", variant: "destructive" });
    } finally {
      setTranslating(false);
    }
  }

  function setOwnerFields(patch: Partial<OwnerPickerValue>) {
    setForm((f) => ({ ...f, ...ownerPatchToForm(patch) }));
  }

  return (
      <div className="max-w-lg space-y-3">
        <h2 className="text-sm font-semibold mb-2">Redigera bostad</h2>
        <Labeled label="Adress">
          <input className={FIELD_CLS} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Labeled>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Postnummer">
            <input className={FIELD_CLS} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
          </Labeled>
          <Labeled label="Ort">
            <input className={FIELD_CLS} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Labeled>
          <Labeled label="Land">
            <input className={FIELD_CLS} value={form.country} placeholder="Sverige" onChange={(e) => set("country", e.target.value)} />
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
          <Check label="Diskmaskin" checked={form.dishwasher} onChange={(v) => set("dishwasher", v)} />
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

        {/* Vad ingår i hyran */}
        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vad ingår i hyran</p>
          <div className="flex flex-wrap gap-4">
            <Check label="Exakt allt ingår" checked={form.allIncluded} onChange={(v) => set("allIncluded", v)} />
            <Check label="Sängkläder + handduk" checked={form.linensIncluded} onChange={(v) => set("linensIncluded", v)} />
            <Check label="Värme + varmvatten" checked={form.heatWaterIncluded} onChange={(v) => set("heatWaterIncluded", v)} />
          </div>
          <Labeled label="Om något INTE ingår, vad?">
            <textarea
              className={`${FIELD_CLS} min-h-[44px] resize-y`}
              placeholder="T.ex. el, internet, soptömning…"
              value={form.excludedNote}
              onChange={(e) => set("excludedNote", e.target.value)}
            />
          </Labeled>
        </div>

        {/* Något särskilt att veta */}
        <Labeled label="Något särskilt vi bör veta">
          <textarea
            className={`${FIELD_CLS} min-h-[48px] resize-y`}
            placeholder="T.ex. trappor, sällskapsdjur, säsongsspecifikt…"
            value={form.specialNote}
            onChange={(e) => set("specialNote", e.target.value)}
          />
        </Labeled>
        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Uthyrare</p>
          <OwnerPicker value={form} onChange={setOwnerFields} />
          {form.ownerId ? (
            <p className="text-[11px] text-muted-foreground">
              Uppgifterna nedan tillhör den länkade uthyraren — ändringar uppdaterar uthyraren (och alla dess objekt).
            </p>
          ) : form.ownerName.trim() ? (
            <p className="text-[11px] text-muted-foreground">
              Ingen uthyrare länkad — en skapas eller matchas automatiskt när du sparar.
            </p>
          ) : null}
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

        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Publik namngivning (hemsidan)</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Labeled label="Publikt namn">
              <input
                className={FIELD_CLS}
                value={form.publicName}
                placeholder={autoPublicName}
                onChange={(e) => set("publicName", e.target.value)}
              />
            </Labeled>
            <Labeled label="URL (slug)">
              <input
                className={FIELD_CLS}
                value={form.slug}
                placeholder={slugify(autoPublicName)}
                onChange={(e) => set("slug", e.target.value)}
              />
            </Labeled>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Lämna tomt → genereras automatiskt. Adress:{" "}
            <span className="font-medium text-nordic-700">www.stayonsite.se/boenden/{previewSlug || "…"}</span>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Extern beskrivning (visas på hemsidan)</label>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={generateDescription} disabled={describing}>
              {describing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generera (AI)
            </Button>
          </div>
          <textarea className={`${FIELD_CLS} min-h-[60px] resize-y`} value={form.publicDescription} onChange={(e) => set("publicDescription", e.target.value)} />
          <p className="text-[11px] text-muted-foreground">AI skriver utifrån objektets data + uppladdade foton. Granska och redigera innan du sparar.</p>
        </div>

        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowI18n((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showI18n ? "rotate-90" : ""}`} />
              Översättningar (EN / PL)
            </button>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={generateTranslations} disabled={translating}>
              {translating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
              Generera
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            AI översätter svenska beskrivningen/skicket på begäran. Granska och redigera — sparas när du klickar Spara.
          </p>
          {showI18n && (
            <div className="space-y-2 pt-1">
              <Labeled label="Beskrivning (EN)">
                <textarea className={`${FIELD_CLS} min-h-[48px] resize-y`} value={form.publicDescriptionEn} onChange={(e) => set("publicDescriptionEn", e.target.value)} />
              </Labeled>
              <Labeled label="Beskrivning (PL)">
                <textarea className={`${FIELD_CLS} min-h-[48px] resize-y`} value={form.publicDescriptionPl} onChange={(e) => set("publicDescriptionPl", e.target.value)} />
              </Labeled>
              <Labeled label="Skick (EN)">
                <textarea className={`${FIELD_CLS} min-h-[40px] resize-y`} value={form.skickEn} onChange={(e) => set("skickEn", e.target.value)} />
              </Labeled>
              <Labeled label="Skick (PL)">
                <textarea className={`${FIELD_CLS} min-h-[40px] resize-y`} value={form.skickPl} onChange={(e) => set("skickPl", e.target.value)} />
              </Labeled>
            </div>
          )}
        </div>

        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Vad ingår</p>
          {form.inclusions.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Lägg till det som ingår (t.ex. möbler, sängkläder, bredband, städ). Visas som checklista i prospektet.</p>
          )}
          {form.inclusions.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={FIELD_CLS}
                value={item}
                placeholder="t.ex. Möbler & vitvaror"
                onChange={(e) =>
                  setForm((f) => ({ ...f, inclusions: f.inclusions.map((x, j) => (j === i ? e.target.value : x)) }))
                }
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, inclusions: f.inclusions.filter((_, j) => j !== i) }))}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                title="Ta bort rad"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setForm((f) => ({ ...f, inclusions: [...f.inclusions, ""] }))}
          >
            <Plus className="h-3.5 w-3.5" /> Lägg till rad
          </Button>
        </div>

        <div className="rounded-md border border-[#ebebe9] p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avstånd till platser</p>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={computeDistances} disabled={computingDist}>
              {computingDist ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
              Räkna avstånd
            </Button>
          </div>
          {form.distances.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Lägg till platser (centrum, flygplats, arbetsplats…) med adress — tryck Räkna avstånd så fylls km och minuter i automatiskt.</p>
          )}
          {form.distances.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${FIELD_CLS} flex-1`}
                placeholder="Plats (t.ex. Kiruna centrum)"
                value={d.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, distances: f.distances.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))
                }
              />
              <input
                className={`${FIELD_CLS} flex-1`}
                placeholder="Adress att mäta till"
                value={d.address ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, distances: f.distances.map((x, j) => (j === i ? { ...x, address: e.target.value } : x)) }))
                }
              />
              <span className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {d.km ? `${d.km} km · ${d.minutes} min` : "—"}
              </span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, distances: f.distances.filter((_, j) => j !== i) }))}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                title="Ta bort plats"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() =>
              setForm((f) => ({ ...f, distances: [...f.distances, { label: "", address: "", km: 0, minutes: 0 }] }))
            }
          >
            <Plus className="h-3.5 w-3.5" /> Lägg till plats
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => { setForm(toPropertyForm(property)); onClose(); }}>
            Avbryt
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Sparar…" : "Spara"}
          </Button>
        </div>
      </div>
    );
}
