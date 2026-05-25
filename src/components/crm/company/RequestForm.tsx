"use client";
import type { Request } from "@/lib/crm/schema";
import { useEffect, useState } from "react";

export interface RequestFormData {
  city: string | null;
  persons: number | null;
  startDate: string | null;
  endDate: string | null;
  budgetMax: number | null;
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
  persons: "",
  startDate: "",
  endDate: "",
  budgetMax: "",
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
            persons: request.persons?.toString() ?? "",
            startDate: request.startDate ?? "",
            endDate: request.endDate ?? "",
            budgetMax: request.budgetMax?.toString() ?? "",
            notes: request.notes ?? "",
            furnishedRequired: !!request.furnishedRequired,
            garageRequired: !!request.garageRequired,
          }
        : EMPTY
    );
  }, [open, request]);

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
          persons: form.persons ? parseInt(form.persons, 10) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : null,
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
      <div className="relative bg-white border border-[#d4d4d2] rounded-[6px] shadow-lg w-full max-w-md p-6">
        <h2 className="text-sm font-semibold mb-4">
          {request ? `Redigera förfrågan #${request.requestNumber}` : "Ny förfrågan"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelCls}>Ort / område</label>
            <input
              autoFocus
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls}
              placeholder="Stockholm / Vasastan"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
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
