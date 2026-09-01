import { db } from "@/lib/crm/db";
import { propertyImages, properties } from "@/lib/crm/schema";
import { r2, R2_BUCKET } from "@/lib/crm/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { publicDisplayName } from "@/lib/crm/slug";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: properties.id,
      publicName: properties.publicName,
      slug: properties.slug,
      city: properties.city,
      postalCode: properties.postalCode,
      squareMeters: properties.squareMeters,
      bedrooms: properties.bedrooms,
      beds: properties.beds,
      furnished: properties.furnished,
      garage: properties.garage,
      broadband: properties.broadband,
      kitchen: properties.kitchen,
      egetBoende: properties.egetBoende,
      parkingSpaces: properties.parkingSpaces,
      publicDescription: properties.publicDescription,
      status: properties.status,
    })
    .from(properties)
    .where(and(eq(properties.published, true), eq(properties.status, "available")))
    .orderBy(asc(properties.city));

  if (rows.length === 0) return NextResponse.json([]);

  // Hämta primärbilder för alla publicerade objekt
  const ids = rows.map((r) => r.id);
  const imgRows = await db
    .select({ propertyId: propertyImages.propertyId, key: propertyImages.key, isPrimary: propertyImages.isPrimary, sortOrder: propertyImages.sortOrder })
    .from(propertyImages)
    .where(inArray(propertyImages.propertyId, ids))
    .orderBy(asc(propertyImages.sortOrder));

  // Gruppera bilder per objekt, primärbild först
  const imgsByProperty = new Map<string, typeof imgRows>();
  for (const img of imgRows) {
    if (!imgsByProperty.has(img.propertyId)) imgsByProperty.set(img.propertyId, []);
    imgsByProperty.get(img.propertyId)!.push(img);
  }

  // Generera presignade URLs (1 timme)
  const result = await Promise.all(
    rows.map(async (p) => {
      const imgs = (imgsByProperty.get(p.id) ?? []).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      const imageUrls = await Promise.all(
        imgs.slice(0, 6).map((img) =>
          getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: img.key }), { expiresIn: 3600 }),
        ),
      );
      // name = redigerbar rubrik (faller tillbaka till deterministiskt SEO-namn).
      // slug = ren URL; faller tillbaka till id tills backfill/sparning satt en slug.
      const name = publicDisplayName(
        p.publicName,
        { city: p.city, bedrooms: p.bedrooms, beds: p.beds },
        p.slug,
      );
      return { ...p, name, slug: p.slug ?? p.id, imageUrls };
    }),
  );

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
