"use client";

import type { Company } from "@/lib/crm/schema";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  company: Company;
  onSave: (field: keyof Company, value: string) => Promise<boolean>;
}

const FIELDS = [
  { key: "name", label: "Företagsnamn", placeholder: "AB Exempelbolaget" },
  { key: "orgNr", label: "Org.nr", placeholder: "556123-4567" },
  { key: "category", label: "Kategori", placeholder: "Bygg, Skog, Energi…" },
  { key: "website", label: "Webb", placeholder: "www.exempel.se" },
  { key: "invoiceEmail", label: "Fakturamail", placeholder: "faktura@exempel.se" },
] as const;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function CompanyInfo({ company, onSave }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>("idle");

  // Reset local field state only when switching to a different company.
  useEffect(() => {
    setValues({
      name: company.name ?? "",
      orgNr: company.orgNr ?? "",
      category: company.category ?? "",
      website: company.website ?? "",
      invoiceEmail: company.invoiceEmail ?? "",
    });
  }, [company.id]);

  // Auto-clear the "Sparat" confirmation after a moment.
  useEffect(() => {
    if (status !== "saved") return;
    const t = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(t);
  }, [status]);

  async function handleBlur(key: keyof Company) {
    const val = (values[key as string] ?? "").trim();
    const original = (company[key] as string) ?? "";
    if (val === original) return;
    setStatus("saving");
    const ok = await onSave(key, val);
    setStatus(ok ? "saved" : "error");
  }

  return (
    <div className="mb-6">
      <div className="flex justify-end h-4 mb-1">
        {status === "saving" && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Sparar…
          </span>
        )}
        {status === "saved" && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" /> Sparat
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Kunde inte spara
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </label>
            <input
              type="text"
              value={values[key] ?? ""}
              placeholder={placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              onBlur={() => handleBlur(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="text-sm bg-white border border-input rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
