"use client";
import type { Request } from "@/lib/crm/schema";
import { useEffect, useState } from "react";
import { useGooglePlaces, type PlaceParts } from "@/hooks/use-google-places";

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

  const labelCls = "text-xs text-[#8a8a8a] uppercase tracking-wide font-medium";
  const inputCls =
    "w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4d4d2] rounded-[6px] shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-sm font-semibold mb-4">
          {request ? `Redigera förfrågan #${request.requestNumber}` : "Ny förfrågan"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelCls}>Adressökning (valfri)</label>
            <input
              ref={addressRef}
              autoFocus
              autoComplete={gmapsEnabled ? "off" : "street-address"}
              list={gmapsEnabled ? undefined : "request-address-hints"}
              value={form.addressQuery}
              onChange={(e) => set("addressQuery", e.target.value)}
              onKeyDown={(e) => {
                // Stoppa Enter från att skicka formuläret medan man väljer ett Google-förslag
                if (gmapsEnabled && e.key === "Enter") e.preventDefault();
              }}
              className={inputCls}
              placeholder={
                gmapsEnabled
                  ? "Börja skriv adress – välj i listan för att fylla ort/postnummer/gata"
                  : "Börja skriv adress, ort eller arbetsplats…"
              }
            />
            {!gmapsEnabled && (
              <datalist id="request-address-hints">
                {[form.street, form.postalCode, form.city].filter(Boolean).join(" ") && (
                  <option value={[form.street, form.postalCode, form.city].filter(Boolean).join(" ")} />
                )}
              </datalist>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Ort</label>
              <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls}
                placeholder="Stockholm"
            />
            </div>
            <div>
              <label className={labelCls}>Postnummer</label>
              <input
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                className={inputCls}
                placeholder="111 22"
              />
            </div>
            <div>
              <label className={labelCls}>Gata / plats</label>
              <input
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                className={inputCls}
                placeholder="Storgatan"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Antal personer</label>
              <input
                type="number"
                min="0"
                value={form.persons}
                onChange={(e) => set("persons", e.target.value)}
                className={inputCls}
                placeholder="3"
              />
            </div>
            <div>
              <label className={labelCls}>Boende från</label>
              <input
                type="number"
                min="0"
                value={form.accommodationFrom}
                onChange={(e) => set("accommodationFrom", e.target.value)}
                className={inputCls}
                placeholder="1"
              />
            </div>
            <div>
              <label className={labelCls}>Boende till</label>
              <input
                type="number"
                min="0"
                value={form.accommodationTo}
                onChange={(e) => set("accommodationTo", e.target.value)}
                className={inputCls}
                placeholder="3"
              />
            </div>
            <div>
              <label className={labelCls}>Budget (max kr/mån)</label>
              <input
                type="number"
                min="0"
                value={form.budgetMax}
                onChange={(e) => set("budgetMax", e.target.value)}
                className={inputCls}
                placeholder="25000"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Inflytt</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Utflytt</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Projekttid (mån)</label>
              <input
                type="number"
                min="0"
                value={form.projectDurationMonths}
                onChange={(e) => set("projectDurationMonths", e.target.value)}
                className={inputCls}
                placeholder="6"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Projekt-id för fakturering (Fortnox)</label>
            <input
              value={form.billingProjectId}
              onChange={(e) => set("billingProjectId", e.target.value)}
              className={inputCls}
              placeholder={request?.requestNumber ? `Förslag: ${request.requestNumber}` : "Skapas från förfrågningsnumret"}
            />
          </div>
          <div className="flex flex-wrap gap-4 py-1">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.furnishedRequired}
                onChange={(e) => set("furnishedRequired", e.target.checked)}
                className="h-4 w-4"
              />
              Möblerat krävs
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.garageRequired}
                onChange={(e) => set("garageRequired", e.target.checked)}
                className="h-4 w-4"
              />
              Garage krävs
            </label>
          </div>
          <div>
            <label className={labelCls}>Anteckning</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputCls} min-h-[60px] resize-y`}
              placeholder="Specialönskemål, kontext…"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
