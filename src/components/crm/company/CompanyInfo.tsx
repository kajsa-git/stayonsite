"use client";

import type { Company } from "@/lib/crm/schema";
import { useRef } from "react";

interface Props {
  company: Company;
  onSave: (field: keyof Company, value: string) => void;
}

interface FieldConfig {
  key: keyof Company;
  label: string;
  placeholder?: string;
}

const FIELDS: FieldConfig[] = [
  { key: "name", label: "Företagsnamn", placeholder: "AB Exempelbolaget" },
  { key: "orgNr", label: "Org.nr", placeholder: "556123-4567" },
  { key: "category", label: "Kategori", placeholder: "Bygg, Skog, Energi…" },
  { key: "website", label: "Webb", placeholder: "www.exempel.se" },
];

export function CompanyInfo({ company, onSave }: Props) {
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});

  function handleBlur(key: keyof Company) {
    const el = refs.current[key as string];
    if (!el) return;
    const val = el.innerText.trim();
    const original = (company[key] as string) ?? "";
    if (val !== original) {
      onSave(key, val);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, key: keyof Company) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <span
            ref={(el) => { refs.current[key as string] = el; }}
            contentEditable
            suppressContentEditableWarning
            className="text-sm text-nordic-900 border-b border-transparent hover:border-nordic-300 focus:border-primary-500 focus:outline-none py-0.5 min-h-[1.25rem] cursor-text"
            onBlur={() => handleBlur(key)}
            onKeyDown={(e) => handleKeyDown(e, key)}
            data-placeholder={placeholder}
          >
            {(company[key] as string) ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}
