"use client";
import type { Request } from "@/lib/crm/schema";
import { useEffect, useState } from "react";
import { useGooglePlaces, type PlaceParts } from "@/hooks/use-google-places";
import { Check } from "lucide-react";

export interface RequestFormData {
  city: string | null;
  postalCode: string | null;
  street: string | null;
  addressQuery: string | null;
  persons: number | null;
  accommodationFrom: number | null;
  accommodationTo: number | null;
  startDate: string | null;
  endDate: string | null;
  projectDurationMonths: number | null;
  budgetMax: number | null;
  billingProjectId: string | null;
  furnishedRequired: boolean;
  garageRequired: boolean;
  notes: string | null;
}

interface Props {
  open: boolean;
  request: Request | null; // null = create new
  onClose: () => void;
  onSubmit: (data: RequestFormData, requestId?: string) => Promise<void>;
}

const EMPTY = {
  city: "",
  postalCode: "",
  street: "",
  addressQuery: "",
  persons: "",
  accommodationFrom: "",
  accommodationTo: "",
  startDate: "",
  endDate: "",
  projectDurationMonths: "",
  budgetMax: "",
  billingProjectId: "",
  notes: "",
  furnishedRequired: false,
  garageRequired: false,
};

const LABEL_CLS = "text-xs text-[#8a8a8a] uppercase tracking-wide font-medium";
const INPUT_CLS =
  "w-full px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5] focus:ring-1 focus:ring-[#1c5fb5]/30";

const togglePill = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
    active
      ? "border-[#1c5fb5] bg-[#1c5fb5]/10 text-[#1c5fb5] font-medium"
      : "border-[#d4d4d2] bg-white text-[#8a8a8a] hover:bg-[#f5f5f4]"
  }`;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLS}>{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#a8a8a8]">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a8a8] border-b border-[#ededeb] pb-1.5">
      {children}
    </p>
  );
}

export function RequestForm({ open, request, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      request
        ? {
            city: request.city ?? "",
            postalCode: request.postalCode ?? "",
            street: request.street ?? "",
            addressQuery: request.addressQuery ?? "",
            persons: request.persons?.toString() ?? "",
            accommodationFrom: request.accommodationFrom?.toString() ?? "",
            accommodationTo: request.accommodationTo?.toString() ?? "",
            startDate: request.startDate ?? "",
            endDate: request.endDate ?? "",
            projectDurationMonths: request.projectDurationMonths?.toString() ?? "",
            budgetMax: request.budgetMax?.toString() ?? "",
            billingProjectId: request.billingProjectId ?? request.requestNumber?.toString() ?? "",
            notes: request.notes ?? "",
            furnishedRequired: !!request.furnishedRequired,
            garageRequired: !!request.garageRequired,
          }
        : EMPTY
    );
  }, [open, request]);

  function applyPlace(parts: PlaceParts) {
    setForm((f) => ({
      ...f,
      street: parts.street || f.street,
      postalCode: parts.postalCode || f.postalCode,
      city: parts.city || f.city,
      addressQuery:
        [parts.street, parts.postalCode, parts.city].filter(Boolean).join(", ") || f.addressQuery,
    }));
  }
  const { ref: addressRef, enabled: gmapsEnabled } = useGooglePlaces(applyPlace, open);

  if (!open) return null;

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(
        {
          city: form.city.trim() || null,
          postalCode: form.postalCode.trim() || null,
          street: form.street.trim() || null,
          addressQuery: form.addressQuery.trim() || null,
          persons: form.persons ? parseInt(form.persons, 10) : null,
          accommodationFrom: form.accommodationFrom ? parseInt(form.accommodationFrom, 10) : null,
          accommodationTo: form.accommodationTo ? parseInt(form.accommodationTo, 10) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          projectDurationMonths: form.projectDurationMonths ? parseInt(form.projectDurationMonths, 10) : null,
          budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : null,
          billingProjectId: form.billingProjectId.trim() || null,
          furnishedRequired: form.furnishedRequired,
          garageRequired: form.garageRequired,
          notes: form.notes.trim() || null,
        },
        request?.id
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4d4d2] rounded-[8px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-[#ededeb] px-6 py-3.5">
          <h2 className="text-sm font-semibold">
            {request ? `Redigera förfrågan #${request.requestNumber}` : "Ny förfrågan"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* Plats */}
          <div className="space-y-3">
            <SectionTitle>Plats</SectionTitle>
            <Field
              label={gmapsEnabled ? "Sök adress" : "Adressökning (valfri)"}
              hint={gmapsEnabled ? "Välj ett förslag så fylls ort, postnummer och gata i automatiskt." : undefined}
            >
              <input
                ref={addressRef}
                autoFocus
                autoComplete={gmapsEnabled ? "off" : "street-address"}
                list={gmapsEnabled ? undefined : "request-address-hints"}
                value={form.addressQuery}
                onChange={(e) => set("addressQuery", e.target.value)}
                onKeyDown={(e) => {
                  if (gmapsEnabled && e.key === "Enter") e.preventDefault();
                }}
                className={INPUT_CLS}
                placeholder={gmapsEnabled ? "Börja skriv en adress…" : "Börja skriv adress, ort eller arbetsplats…"}
              />
              {!gmapsEnabled && (
                <datalist id="request-address-hints">
                  {[form.street, form.postalCode, form.city].filter(Boolean).join(" ") && (
                    <option value={[form.street, form.postalCode, form.city].filter(Boolean).join(" ")} />
                  )}
                </datalist>
              )}
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Ort">
                <input value={form.city} onChange={(e) => set("city", e.target.value)} className={INPUT_CLS} placeholder="Stockholm" />
              </Field>
              <Field label="Postnummer">
                <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={INPUT_CLS} placeholder="111 22" />
              </Field>
              <Field label="Gata / plats">
                <input value={form.street} onChange={(e) => set("street", e.target.value)} className={INPUT_CLS} placeholder="Storgatan" />
              </Field>
            </div>
          </div>

          {/* Behov & tidsplan */}
          <div className="space-y-3">
            <SectionTitle>Behov & tidsplan</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Antal personer">
                <input type="number" min="0" value={form.persons} onChange={(e) => set("persons", e.target.value)} className={INPUT_CLS} placeholder="3" />
              </Field>
              <Field label="Antal boenden">
                <div className="flex items-center gap-1.5">
                  <input type="number" min="0" value={form.accommodationFrom} onChange={(e) => set("accommodationFrom", e.target.value)} className={INPUT_CLS} placeholder="1" />
                  <span className="text-sm text-[#a8a8a8]">–</span>
                  <input type="number" min="0" value={form.accommodationTo} onChange={(e) => set("accommodationTo", e.target.value)} className={INPUT_CLS} placeholder="3" />
                </div>
              </Field>
              <Field label="Budget (kr/mån)">
                <input type="number" min="0" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} className={INPUT_CLS} placeholder="25000" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Inflytt">
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Utflytt">
                <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Projekttid (mån)">
                <input type="number" min="0" value={form.projectDurationMonths} onChange={(e) => set("projectDurationMonths", e.target.value)} className={INPUT_CLS} placeholder="6" />
              </Field>
            </div>
            <Field label="Krav">
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => set("furnishedRequired", !form.furnishedRequired)} className={togglePill(form.furnishedRequired)}>
                  {form.furnishedRequired && <Check className="h-3.5 w-3.5" />} Möblerat
                </button>
                <button type="button" onClick={() => set("garageRequired", !form.garageRequired)} className={togglePill(form.garageRequired)}>
                  {form.garageRequired && <Check className="h-3.5 w-3.5" />} Garage
                </button>
              </div>
            </Field>
          </div>

          {/* Fakturering & noteringar */}
          <div className="space-y-3">
            <SectionTitle>Fakturering & noteringar</SectionTitle>
            <Field label="Projekt-id för fakturering (Fortnox)">
              <input
                value={form.billingProjectId}
                onChange={(e) => set("billingProjectId", e.target.value)}
                className={INPUT_CLS}
                placeholder={request?.requestNumber ? `Förslag: ${request.requestNumber}` : "Skapas från förfrågningsnumret"}
              />
            </Field>
            <Field label="Anteckning">
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={`${INPUT_CLS} min-h-[60px] resize-y`}
                placeholder="Specialönskemål, kontext…"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#ededeb]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] hover:bg-[#f5f5f4] transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-[#1a1a1a] text-white rounded-[4px] hover:bg-[#333] disabled:opacity-40 transition-colors"
            >
              {saving ? "Sparar…" : request ? "Spara" : "Skapa förfrågan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
