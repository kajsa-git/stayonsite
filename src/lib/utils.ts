import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LocalizedKeywords, LocalizedString, Locale } from "@/types/localized"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const normalizeLocale = (language: string): Locale => {
  if (language === 'en') return 'en'
  if (language === 'pl') return 'pl'
  return 'sv'
}

export const getLocalizedText = (value: LocalizedString, language: string): string => {
  const locale = normalizeLocale(language)
  return value[locale] || value.sv
}

export const getLocalizedKeywords = (keywords: LocalizedKeywords, language: string): string[] => {
  const locale = normalizeLocale(language)
  return keywords[locale] || keywords.sv
}
