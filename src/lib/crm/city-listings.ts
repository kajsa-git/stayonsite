// Publicerade boenden för en stadssida (server-side). Intern länkning
// stadssida → objektsida är SEO-bärande: stadssidorna rankar och skickar
// länkkraft + färskt innehåll till objekten. Publikt säkra fält enbart —
// aldrig adress/ägare/pris (se project_crm_publishing_privacy).
//
// try/catch är avsiktligt tyst: veckobloggens CI bygger med
// TURSO_DATABASE_URL=file::memory: och stadssidorna får ALDRIG fälla bygget —
// då blir sektionen bara tom tills nästa riktiga rendering.
import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { approvedPropertyIds } from "./approved-property-content";
import { db } from "./db";
import { r2, R2_BUCKET } from "./r2";
import { properties, propertyImages } from "./schema";
import { publicDisplayName } from "./slug";

export interface CityListing {
  slug: string;
  name: string;
  postalCode: string | null;
  bedrooms: number | null;
  beds: number | null;
  imageUrl: string | null;
}

// Samma diakritik-tåliga jämförelse som matchningen (Mönsterås/Monsteras).
const normalizeCity = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

export async function getCityListings(cityName: string): Promise<CityListing[]> {
  try {
    const rows = await db
      .select({
        id: properties.id,
        updatedAt: properties.updatedAt,
        slug: properties.slug,
        publicName: properties.publicName,
        city: properties.city,
        postalCode: properties.postalCode,
        bedrooms: properties.bedrooms,
        beds: properties.beds,
      })
      .from(properties)
      .where(and(eq(properties.published, true), eq(properties.status, "available"), isNotNull(properties.slug)));

    const want = normalizeCity(cityName);
    const cityRows = rows.filter((r) => r.city && normalizeCity(r.city) === want);
    if (!cityRows.length) return [];

    // Samma huvudbild och reservordning som på objektets detaljsida.
    const ids = cityRows.map((r) => r.id);
    const images = await db
      .select({ propertyId: propertyImages.propertyId, key: propertyImages.key })
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, ids))
      .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt));
    const primaryKeys = new Map<string, string>();
    for (const image of images) {
      if (!primaryKeys.has(image.propertyId)) primaryKeys.set(image.propertyId, image.key);
    }

    const approved = await approvedPropertyIds(ids, new Map(cityRows.map((r) => [r.id, r.updatedAt])));
    return await Promise.all(cityRows.filter((r) => approved.has(r.id)).slice(0, 12).map(async (r) => {
      const key = primaryKeys.get(r.id);
      return {
        slug: r.slug as string,
        name: publicDisplayName(
          r.publicName,
          { city: r.city, bedrooms: r.bedrooms, beds: r.beds },
          r.slug,
        ),
        postalCode: r.postalCode,
        bedrooms: r.bedrooms,
        beds: r.beds,
        imageUrl: key
          ? await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), { expiresIn: 60 * 60 * 24 * 7 })
          : null,
      };
    }));
  } catch {
    return [];
  }
}
