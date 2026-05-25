"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

interface NewCompanyModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewCompanyModal({ open, onClose }: NewCompanyModalProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    orgNr: "",
    category: "",
    website: "",
    leadSource: "kallt",
    followUpDate: today,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  if (!open) return null;

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: nanoid(),
          name: form.name.trim(),
          orgNr: form.orgNr || null,
          category: form.category || null,
          website: form.website || null,
          leadSource: form.leadSource || null,
          followUpDate: form.followUpDate || null,
          followUpReason: form.followUpDate ? "Första kontakt" : null,
        }),
      });
      const company = await res.json();

      if (form.contactName || form.contactPhone || form.contactEmail) {
        await fetch("/api/crm/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: nanoid(),
            companyId: company.id,
            name: form.contactName || null,
            phone: form.contactPhone || null,
            email: form.contactEmail || null,
            isPrimary: true,
          }),
        });
      }

      onClose();
      router.push(`/crm/company/${company.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-[#d4d4d2] rounded-[6px] shadow-lg w-full max-w-md p-6">
        <h2 className="text-sm font-semibold mb-4">Ny kund</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium">Företagsnamn *</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
              placeholder="Nordic Ventures AB"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium">Org.nr</label>
              <input
                value={form.orgNr}
                onChange={(e) => set("orgNr", e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
                placeholder="556789-1234"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium">Kategori</label>
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
                placeholder="Bygg & Anläggning"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium">Webb</label>
            <input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
              placeholder="https://example.se"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium">Lead-källa</label>
              <select
                value={form.leadSource}
                onChange={(e) => set("leadSource", e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] bg-white focus:outline-none focus:border-[#1c5fb5]"
              >
                <option value="kallt">Kallt samtal</option>
                <option value="webb">Webb</option>
                <option value="befintlig">Befintlig kund</option>
                <option value="referens">Referens</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium">Boka återkomst</label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
              />
            </div>
          </div>
          <div className="pt-1 border-t border-[#ebebe9]">
            <p className="text-xs text-[#8a8a8a] uppercase tracking-wide font-medium mb-2">Kontaktperson</p>
            <div className="space-y-2">
              <input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
                placeholder="Anna Lindberg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
                  placeholder="+46 70 123 45 67"
                />
                <input
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-[#d4d4d2] rounded-[4px] focus:outline-none focus:border-[#1c5fb5]"
                  placeholder="anna@example.se"
                />
              </div>
            </div>
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
              disabled={!form.name.trim() || saving}
              className="px-3 py-1.5 text-sm bg-[#1a1a1a] text-white rounded-[4px] hover:bg-[#333] disabled:opacity-40 transition-colors"
            >
              {saving ? "Sparar…" : "Skapa kund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
