"use client";

 
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadGoogleMapsLibrary, parsePlace, type PlaceParts } from "@/hooks/use-google-places";
import { cn } from "@/lib/utils";

type Suggestion = { id: string; main: string; secondary: string; prediction: any };

const MIN_CHARS = 3;
const DEBOUNCE_MS = 250;

/**
 * Adressfält med förslag från Google Places (Sverige). Utan nyckel, eller om
 * Google inte laddar, är det ett vanligt textfält. Google laddas först när
 * fältet får fokus, så sidan blir inte tyngre för den som aldrig når hit.
 */
export function AddressAutocomplete({
  id,
  label,
  value,
  onChange,
  onSelect,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (parts: PlaceParts) => void;
  error?: string;
  placeholder?: string;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useRef<any>(null);
  const token = useRef<any>(null);
  const requestId = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => () => {
    if (debounce.current) clearTimeout(debounce.current);
  }, []);

  async function ensurePlaces() {
    if (places.current) return places.current;
    places.current = await loadGoogleMapsLibrary("places");
    return places.current;
  }

  async function search(text: string) {
    const lib = await ensurePlaces();
    if (!lib) return;
    const current = ++requestId.current;
    try {
      token.current ??= new lib.AutocompleteSessionToken();
      const { suggestions: result } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: text,
        sessionToken: token.current,
        includedRegionCodes: ["se"],
        language: "sv",
        region: "se",
      });
      if (current !== requestId.current) return; // ett nyare svar är på väg
      const next: Suggestion[] = (result ?? [])
        .map((s: any) => s.placePrediction)
        .filter(Boolean)
        .slice(0, 5)
        .map((p: any) => ({
          id: p.placeId,
          main: p.mainText?.toString() ?? p.text?.toString() ?? "",
          secondary: (p.secondaryText?.toString() ?? "").replace(/,?\s*Sverige$/, ""),
          prediction: p,
        }));
      setSuggestions(next);
      setActive(-1);
      setOpen(next.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }

  function handleChange(text: string) {
    onChange(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (text.trim().length < MIN_CHARS) {
      requestId.current += 1;
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(() => void search(text.trim()), DEBOUNCE_MS);
  }

  async function choose(suggestion: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    requestId.current += 1;
    try {
      const place = suggestion.prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
      const parts = parsePlace(place);
      onSelect({ ...parts, street: parts.street || suggestion.main });
      // Utan gatunummer: låt husägaren fylla i numret direkt.
      if (!/\d/.test(parts.street)) requestAnimationFrame(() => inputRef.current?.focus());
    } catch {
      onChange(suggestion.main);
    } finally {
      token.current = null; // fetchFields avslutar Googles sökomgång
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      void choose(suggestions[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-nordic-900">{label} *</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="street-address"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onFocus={() => void ensurePlaces()}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}
          className="min-h-11 rounded-md border-nordic-200 bg-white text-base aria-[invalid=true]:border-red-600 md:text-base"
        />
        {open && (
          <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-nordic-200 bg-white shadow-lg">
            <ul id={listId} role="listbox" aria-label="Adressförslag">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // mousedown i stället för click: fältet tappar annars fokus och listan stängs först.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    void choose(suggestion);
                  }}
                  className={cn(
                    "flex min-h-12 cursor-pointer select-none items-start gap-3 border-b border-nordic-100 px-3 py-2.5 last:border-b-0",
                    index === active ? "bg-nordic-50" : "hover:bg-nordic-50",
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nordic-500" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-base font-medium text-nordic-900">{suggestion.main}</span>
                    {suggestion.secondary && <span className="block truncate text-sm text-nordic-700">{suggestion.secondary}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="bg-nordic-50 px-3 py-1.5 text-right text-xs text-nordic-700">Google Maps</p>
          </div>
        )}
      </div>
      {error && <p id={`${id}-error`} className="text-sm font-medium text-red-700">{error}</p>}
      <p className="text-sm text-nordic-700">Hittar du inte adressen? Skriv den som den står, till exempel gårdsnamn och nummer.</p>
    </div>
  );
}
