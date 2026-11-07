// Fasta, publika bildadresser för hemsidans objekt.
//
// Galleriet och stadssidornas kort använde tidigare presignerade R2-länkar som
// slutar gälla efter sju dagar. Sådana länkar kan Google Bilder inte indexera,
// och sparade sidor/delningar tappar bilderna. Här får varje bild i stället en
// stabil adress under objektets egen URL: /boenden/<slug>/bilder/<nr>.
//
// Samma publiceringsregler som objektsidan (surface "web"): publicerat,
// tillåten status/medgivande och godkänd innehållsgranskning. Prospekt- och
// erbjudandelänkar fortsätter att använda presignerade länkar.
import { asc, desc, eq } from "drizzle-orm";
import { approvedPropertyIds } from "./approved-property-content";
import { db } from "./db";
import { hasWebsitePropertyStatus } from "./publication";
import { properties, propertyImages } from "./schema";

export const PUBLIC_SITE_ORIGIN = "https://www.stayonsite.se";

export type PublicImageSize = "display" | "thumb";

/** Relativ, stabil bildadress. `index` är 1-baserat i galleriets ordning. */
export function publicPropertyImagePath(slug: string, index: number, size: PublicImageSize = "display"): string {
  const base = `/boenden/${encodeURIComponent(slug)}/bilder/${index}`;
  return size === "thumb" ? `${base}?w=800` : base;
}

export function publicPropertyImageUrl(slug: string, index: number, size: PublicImageSize = "display"): string {
  return `${PUBLIC_SITE_ORIGIN}${publicPropertyImagePath(slug, index, size)}`;
}

/** Samma ordning som galleriet: huvudbild först, sedan sortering och uppladdningstid. */
export const galleryOrder = [desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt)] as const;

/**
 * R2-nyckeln för bild nummer `index` på ett webbpublicerat objekt, eller null
 * om objektet eller bilden inte får visas publikt.
 */
export async function resolvePublicPropertyImageKey(
  slug: string,
  index: number,
  size: PublicImageSize = "display",
): Promise<string | null> {
  if (!slug || !Number.isInteger(index) || index < 1) return null;

  const [row] = await db
    .select({
      id: properties.id,
      updatedAt: properties.updatedAt,
      published: properties.published,
      status: properties.status,
      publishConsentAt: properties.publishConsentAt,
    })
    .from(properties)
    .where(eq(properties.slug, slug))
    .limit(1);
  if (!row || !row.published || !hasWebsitePropertyStatus(row.status, row.publishConsentAt)) return null;
  if (!(await approvedPropertyIds([row.id], new Map([[row.id, row.updatedAt]]))).has(row.id)) return null;

  const images = await db
    .select({ key: propertyImages.key, thumbKey: propertyImages.thumbKey, displayKey: propertyImages.displayKey })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, row.id))
    .orderBy(...galleryOrder);
  const image = images[index - 1];
  if (!image) return null;
  return size === "thumb" ? (image.thumbKey ?? image.key) : (image.displayKey ?? image.key);
}
