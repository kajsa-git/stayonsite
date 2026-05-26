"use client";

import type { Company } from "@/lib/crm/schema";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  company: Company;
  onSave: (field: keyof Company, value: string | string[]) => Promise<boolean>;
}

const FIELDS = [
  { key: "name", label: "Företagsnamn", placeholder: "AB Exempelbolaget" },
  { key: "orgNr", label: "Org.nr", placeholder: "556123-4567" },
  { key: "website", label: "Webb", placeholder: "www.exempel.se" },
  { key: "invoiceEmail", label: "Fakturamail", placeholder: "faktura@exempel.se" },
] as const;

const LANGUAGES = [
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "en", label: "Engelska", flag: "🇬🇧" },
  { code: "pl", label: "Polska", flag: "🇵🇱" },
  { code: "no", label: "Norska", flag: "🇳🇴" },
  { code: "da", label: "Danska", flag: "🇩🇰" },
  { code: "fi", label: "Finska", flag: "🇫🇮" },
  { code: "de", label: "Tyska", flag: "🇩🇪" },
  { code: "es", label: "Spanska", flag: "🇪🇸" },
  { code: "fr", label: "Franska", flag: "🇫🇷" },
  { code: "it", label: "Italienska", flag: "🇮🇹" },
  { code: "pt", label: "Portugisiska", flag: "🇵🇹" },
  { code: "nl", label: "Nederländska", flag: "🇳🇱" },
  { code: "ro", label: "Rumänska", flag: "🇷🇴" },
  { code: "lt", label: "Litauiska", flag: "🇱🇹" },
  { code: "lv", label: "Lettiska", flag: "🇱🇻" },
  { code: "et", label: "Estniska", flag: "🇪🇪" },
  { code: "cs", label: "Tjeckiska", flag: "🇨🇿" },
  { code: "sk", label: "Slovakiska", flag: "🇸🇰" },
  { code: "hu", label: "Ungerska", flag: "🇭🇺" },
  { code: "bg", label: "Bulgariska", flag: "🇧🇬" },
  { code: "uk", label: "Ukrainska", flag: "🇺🇦" },
  { code: "ru", label: "Ryska", flag: "🇷🇺" },
  { code: "tr", label: "Turkiska", flag: "🇹🇷" },
  { code: "ar", label: "Arabiska", flag: "🇸🇦" },
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

  async function toggleLanguage(code: string) {
    const current = company.languages ?? [];
    const next = current.includes(code) ? current.filter((x) => x !== code) : [...current, code];
    setStatus("saving");
    const ok = await onSave("languages", next);
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
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Språk för utskick
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((lang) => {
              const active = (company.languages ?? []).includes(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  title={lang.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? "border-primary-300 bg-primary-50 text-primary-800"
                      : "border-input bg-white text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span aria-hidden>{lang.flag}</span>
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
