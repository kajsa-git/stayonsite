import { unstable_cache } from "next/cache";
import { translatePropertyText } from "./property-translations";
import { publicTextProblems } from "./property-content-policy";
import type { PropertyDescription } from "@/lib/property-description";

// Repair older public records without rewriting their source or publication
// state. The exact source text participates in the persistent cache key.
const translateDescription = unstable_cache(async (source: string) => {
  const translated = await translatePropertyText({ publicDescription: source });
  if ([translated.publicDescriptionEn, translated.publicDescriptionPl].some((text) => publicTextProblems(text).length)) throw new Error("Översättningen behöver granskas.");
  return translated;
}, ["public-property-description-translations-v1"], { revalidate: false });

// Call only after existing publication and content-review gates.
export async function completePublicDescription<T extends PropertyDescription>(property: T): Promise<T> {
  const source = property.publicDescription?.trim();
  if (!source || (property.publicDescriptionEn?.trim() && property.publicDescriptionPl?.trim())) return property;
  try {
    const translated = await translateDescription(source);
    return { ...property,
      publicDescriptionEn: property.publicDescriptionEn?.trim() || translated.publicDescriptionEn,
      publicDescriptionPl: property.publicDescriptionPl?.trim() || translated.publicDescriptionPl,
    };
  } catch (error) {
    console.error("public-description-translation:", error instanceof Error ? error.message : "failed");
    return property;
  }
}
