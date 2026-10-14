"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { PublicProperty } from "@/lib/crm/public-property";
import { PropertyShowcase } from "./PropertyShowcase";

// Website buttons update context without leaving the property. Prospects and
// offers continue to use their explicit ?lang= selection.
export function WebsitePropertyShowcase({ data, title, description }: { data: PublicProperty; title: string; description: string }) {
  const { language } = useLanguage();
  return <PropertyShowcase data={data} lang={language} title={title} descriptionOverride={language === "sv" ? description : undefined} />;
}
