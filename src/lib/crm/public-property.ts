import { asc, desc, eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "./db";
import { isSwedishCountry } from "./owners";
import { R2_BUCKET, r2 } from "./r2";
import { properties, propertyImages, type Property } from "./schema";

// Tenant-säkra kolumner som får visas publikt. ALDRIG address, owner-* eller rent/price.
const PUBLIC_COLUMNS = {
  id: properties.id,
  published: properties.published,
  status: properties.status,
  publicName: properties.publicName,
  slug: properties.slug,
  postalCode: properties.postalCode,
  city: properties.city,
  country: properties.country,
  squareMeters: properties.squareMeters,
  bedrooms: properties.bedrooms,
  beds: properties.beds,
  bathrooms: properties.bathrooms,
  washingMachines: properties.washingMachines,
  dryers: properties.dryers,
  dishwasher: properties.dishwasher,
  parkingSpaces: properties.parkingSpaces,
  furnished: properties.furnished,
  egetBoende: properties.egetBoende,
  skick: properties.skick,
  skickEn: properties.skickEn,
  skickPl: properties.skickPl,
  publicDescription: properties.publicDescription,
  publicDescriptionEn: properties.publicDescriptionEn,
  publicDescriptionPl: properties.publicDescriptionPl,
  inclusions: properties.inclusions,
  inclusionsEn: properties.inclusionsEn,
  inclusionsPl: properties.inclusionsPl,
  distances: properties.distances,
  moveInFrom: properties.moveInFrom,
  availableTo: properties.availableTo,
} as const;

export type PublicPropertyRow = Pick<Property, keyof typeof PUBLIC_COLUMNS>;

export type PublicProperty = {
  row: PublicPropertyRow;
  images: string[];
  mapCoords: { lat: number; lng: number } | null;
  mapArea: string;
};

// Geokodar postnummer-OMRÅDET (aldrig exakt adress) via OSM Nominatim — server-side, ingen nyckel.
// Landsmedvetet: svenskt postnummer formateras "XXX XX", annars används värdet rått. Resultatet cachas.
async function geocodeArea(
  postalCode?: string | null,
  city?: string | null,
  country?: string | null,
): Promise<{ lat: number; lng: number } | null> {
  const headers = { "User-Agent": "StayOnSite/1.0 (kajsa@stayonsite.se)" };
  const swede = isSwedishCountry(country);
  const postal = swede
    ? (postalCode ?? "").replace(/\s+/g, "").replace(/^(\d{3})(\d{2})$/, "$1 $2")
    : (postalCode ?? "").trim();
  const c = (city ?? "").trim();
  const countryName = swede ? "Sweden" : (country ?? "").trim();
  const cn = countryName ? `&country=${encodeURIComponent(countryName)}` : "";
  const tries: string[] = [];
  if (postal && c) tries.push(`postalcode=${encodeURIComponent(postal)}&city=${encodeURIComponent(c)}${cn}`);
  if (postal) tries.push(`postalcode=${encodeURIComponent(postal)}${cn}`);
  if (c) tries.push(`city=${encodeURIComponent(c)}${cn}`);
  for (const params of tries) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&${params}`, {
        headers,
        cache: "force-cache",
      });
      if (!res.ok) continue;
      const j = (await res.json()) as { lat: string; lon: string }[];
      if (Array.isArray(j) && j[0]) return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
    } catch {
      /* prova nästa variant */
    }
  }
  return null;
}

// Laddar ett publikt objekt via slug ELLER id (slug först, id som fallback för äldre prospekt-länkar).
// Returnerar null om objektet saknas eller inte är publicerat. requireAvailable gatear på status=available.
export async function loadPublicProperty(
  idOrSlug: string,
  opts: { requireAvailable?: boolean } = {},
): Promise<PublicProperty | null> {
  const bySlug = await db.select(PUBLIC_COLUMNS).from(properties).where(eq(properties.slug, idOrSlug)).limit(1);
  const [row] = bySlug.length
    ? bySlug
    : await db.select(PUBLIC_COLUMNS).from(properties).where(eq(properties.id, idOrSlug)).limit(1);
  if (!row || !row.published) return null;
  if (opts.requireAvailable && row.status !== "available") return null;

  const imgRows = await db
    .select({ key: propertyImages.key })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, row.id))
    .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder), asc(propertyImages.createdAt));
  const images = await Promise.all(
    imgRows.map((im) => getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: im.key }), { expiresIn: 60 * 60 * 24 * 7 })),
  );

  const mapArea = [row.postalCode, row.city].filter(Boolean).join(" ");
  const mapCoords = row.postalCode || row.city ? await geocodeArea(row.postalCode, row.city, row.country) : null;

  return { row, images, mapCoords, mapArea };
}
