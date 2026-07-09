// Publicerade boenden för en stadssida (server-side). Intern länkning
// stadssida → objektsida är SEO-bärande: stadssidorna rankar och skickar
// länkkraft + färskt innehåll till objekten. Publikt säkra fält enbart —
// aldrig adress/ägare/pris (se project_crm_publishing_privacy).
//
// try/catch är avsiktligt tyst: veckobloggens CI bygger med
// TURSO_DATABASE_URL=file::memory: och stadssidorna får ALDRIG fälla bygget —
// då blir sektionen bara tom tills nästa riktiga rendering (ISR var 60:e min).
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { properties } from "./schema";
import { publicDisplayName } from "./slug";

export interface CityListing {
  slug: string;
  name: string;
  postalCode: string | null;
  bedrooms: number | null;
  beds: number | null;
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
    return rows
      .filter((r) => r.city && normalizeCity(r.city) === want)
      .map((r) => ({
        slug: r.slug as string,
        name: publicDisplayName(r.publicName, { city: r.city, bedrooms: r.bedrooms, beds: r.beds }),
        postalCode: r.postalCode,
        bedrooms: r.bedrooms,
        beds: r.beds,
      }))
      .slice(0, 12);
  } catch {
    return [];
  }
}
