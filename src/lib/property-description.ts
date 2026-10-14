import type { Locale } from "@/types/localized";

export type PropertyDescription = {
  publicDescription?: string | null;
  publicDescriptionEn?: string | null;
  publicDescriptionPl?: string | null;
};

// A missing translation must never silently switch the customer's language.
export function localizedPropertyDescription(property: PropertyDescription, locale: Locale): string | null {
  const text = locale === "en" ? property.publicDescriptionEn : locale === "pl" ? property.publicDescriptionPl : property.publicDescription;
  return text?.trim() || null;
}
