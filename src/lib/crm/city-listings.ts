// Publicerade boenden för en stadssida (server-side). Intern länkning
// stadssida → objektsida är SEO-bärande: stadssidorna rankar och skickar
// länkkraft + färskt innehåll till objekten. Publikt säkra fält enbart —
// aldrig adress/ägare/pris (se project_crm_publishing_privacy).
//
// try/catch är avsiktligt tyst: veckobloggens CI bygger med
// TURSO_DATABASE_URL=file::memory: och stadssidorna får ALDRIG fälla bygget —
// då blir sektionen bara tom tills nästa riktiga rendering.
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { approvedPropertyIds } from "./approved-property-content";
import { db } from "./db";
import { publicPropertyImagePath } from "./public-images";
import { properties, propertyImages } from "./schema";
import { publicDisplayName } from "./slug";
import { websiteStatusWhere } from "./website-status-query";

export interface CityListing {
  slug: string;
  name: string;
  /** Boendets egen ort (t.ex. Figeholm på Oskarshamnssidan). */
  city: string | null;
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

// `localities`: orter i samma kommun som också hör till stadssidan
// (Figeholm, Påskallavik … för Oskarshamn). Stadens egna boenden visas först.
export async function getCityListings(cityName: string, localities: string[] = []): Promise<CityListing[]> {
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
      .where(and(eq(properties.published, true), eq(properties.status, "available"), isNotNull(properties.slug), websiteStatusWhere()));

    const want = normalizeCity(cityName);
    const extra = new Set(localities.map(normalizeCity));
    const cityRows = [
      ...rows.filter((r) => r.city && normalizeCity(r.city) === want),
      ...rows.filter((r) => r.city && normalizeCity(r.city) !== want && extra.has(normalizeCity(r.city))),
    ];
    if (!cityRows.length) return [];

    // Huvudbilden är alltid nummer 1 i galleriets ordning → fast adress.
    const ids = cityRows.map((r) => r.id);
    const images = await db
      .select({ propertyId: propertyImages.propertyId })
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, ids));
    const withImages = new Set(images.map((image) => image.propertyId));

    const approved = await approvedPropertyIds(ids, new Map(cityRows.map((r) => [r.id, r.updatedAt])));
    return cityRows.filter((r) => approved.has(r.id)).slice(0, 12).map((r) => {
      return {
        slug: r.slug as string,
        name: publicDisplayName(
          r.publicName,
          { city: r.city, bedrooms: r.bedrooms, beds: r.beds },
          r.slug,
        ),
        city: r.city?.trim() || null,
        postalCode: r.postalCode,
        bedrooms: r.bedrooms,
        beds: r.beds,
        imageUrl: withImages.has(r.id) ? publicPropertyImagePath(r.slug as string, 1, "thumb") : null,
      };
    });
  } catch {
    return [];
  }
}
