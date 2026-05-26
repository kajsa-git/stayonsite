"use client";

import type { Company } from "@/lib/crm/schema";
import { useGooglePlaces, type PlaceParts } from "@/hooks/use-google-places";
import { Check, AlertCircle, ChevronRight, Loader2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  company: Company;
  onSave: (field: keyof Company, value: string | string[]) => Promise<boolean>;
}

const FIELDS = [
  { key: "name", label: "Företagsnamn", placeholder: "AB Exempelbolaget" },
  { key: "orgNr", label: "Org.nr", placeholder: "556123-4567" },
  { key: "website", label: "Webb", placeholder: "www.exempel.se" },
  { key: "invoiceEmail", label: "Fakturamail", placeholder: "faktura@exempel.se" },
  { key: "customerNumber", label: "Kundnr", placeholder: "t.ex. 29" },
  { key: "postalCode", label: "Postnummer", placeholder: "111 22" },
  { key: "city", label: "Ort", placeholder: "Stockholm" },
  { key: "country", label: "Land", placeholder: "Sverige" },
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
  const [open, setOpen] = useState(false);

  // Reset local field state only when switching to a different company.
  useEffect(() => {
    setValues({
      name: company.name ?? "",
      orgNr: company.orgNr ?? "",
      website: company.website ?? "",
      invoiceEmail: company.invoiceEmail ?? "",
      customerNumber: company.customerNumber ?? "",
      postalCode: company.postalCode ?? "",
      city: company.city ?? "",
      country: company.country ?? "",
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

  async function applyPlace(parts: PlaceParts) {
    const updates: Record<string, string> = {};
    if (parts.postalCode) updates.postalCode = parts.postalCode;
    if (parts.city) updates.city = parts.city;
    if (parts.country) updates.country = parts.country;
    if (Object.keys(updates).length === 0) return;
    setValues((v) => ({ ...v, ...updates }));
    setStatus("saving");
    try {
      const res = await Promise.all(Object.entries(updates).map(([k, val]) => onSave(k as keyof Company, val)));
      setStatus(res.every(Boolean) ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }
  const { containerRef, enabled: gmapsEnabled } = useGooglePlaces(applyPlace, open);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/50 px-4 py-2.5 text-sm font-semibold text-nordic-800 hover:bg-primary-50 hover:border-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      >
        <ChevronRight className={`h-4 w-4 text-primary-500 transition-transform ${open ? "rotate-90" : ""}`} />
        Företagsuppgifter
        <span className="ml-auto text-xs font-normal text-primary-700/70 hidden sm:block">
          Adress, kundnr, fakturamail — fylls oftast i innan affär
        </span>
      </button>
      {open && (
      <div className="mt-3">
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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3">
        {gmapsEnabled && (
          <div className="col-span-full flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Sök adress (fyller postnummer/ort/land)
            </label>
            <div
              ref={containerRef}
              className="w-full rounded-md border border-input bg-white px-1 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 [&_gmp-place-autocomplete]:block [&_gmp-place-autocomplete]:w-full"
            />
          </div>
        )}
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
        <div className="col-span-full flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Språk för utskick
          </label>
          <LanguagePicker selected={company.languages ?? []} onToggle={toggleLanguage} />
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

function LanguagePicker({ selected, onToggle }: { selected: string[]; onToggle: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selectedLangs = LANGUAGES.filter((l) => selected.includes(l.code));
  const filtered = LANGUAGES.filter((l) => l.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedLangs.length === 0 && (
          <span className="text-sm text-muted-foreground">Inga språk valda</span>
        )}
        {selectedLangs.map((l) => (
          <span
            key={l.code}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 text-primary-800 px-2.5 py-1 text-xs"
          >
            <span aria-hidden>{l.flag}</span>
            {l.label}
            <button
              type="button"
              onClick={() => onToggle(l.code)}
              className="ml-0.5 text-primary-500 hover:text-primary-800"
              title="Ta bort"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-input bg-white text-muted-foreground hover:bg-muted px-2.5 py-1 text-xs"
        >
          <Plus className="h-3 w-3" /> Lägg till språk
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded-md border bg-white shadow-lg p-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök språk…"
            className="w-full text-sm border rounded px-2 py-1 mb-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-1.5">Inget språk matchar.</p>
            ) : (
              filtered.map((l) => {
                const active = selected.includes(l.code);
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onToggle(l.code)}
                    className={`w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left hover:bg-muted ${active ? "bg-primary-50" : ""}`}
                  >
                    <span aria-hidden>{l.flag}</span>
                    <span className="flex-1">{l.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-primary-600" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
