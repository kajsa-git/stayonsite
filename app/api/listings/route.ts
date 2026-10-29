import { approvedPropertyIds } from "@/lib/crm/approved-property-content";
import { completePublicDescription } from "@/lib/crm/public-description-translations";
import { db } from "@/lib/crm/db";
import { propertyImages, properties } from "@/lib/crm/schema";
import { r2, R2_BUCKET } from "@/lib/crm/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { publicDisplayName } from "@/lib/crm/slug";
import { websiteStatusWhere } from "@/lib/crm/website-status-query";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const candidates = await db
    .select({
      id: properties.id,
      updatedAt: properties.updatedAt,
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
      publicDescriptionEn: properties.publicDescriptionEn,
      publicDescriptionPl: properties.publicDescriptionPl,
    })
    .from(properties)
    .where(and(eq(properties.published, true), websiteStatusWhere()))
    .orderBy(asc(properties.city));

  const approved = await approvedPropertyIds(candidates.map((p) => p.id), new Map(candidates.map((p) => [p.id, p.updatedAt])));
  const rows = candidates.filter((p) => approved.has(p.id));
  if (rows.length === 0) return NextResponse.json([]);

  // Hämta primärbilder för alla publicerade objekt
  const ids = rows.map((r) => r.id);
  const imgRows = await db
    .select({ propertyId: propertyImages.propertyId, key: propertyImages.key, thumbKey: propertyImages.thumbKey, isPrimary: propertyImages.isPrimary, sortOrder: propertyImages.sortOrder })
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
  const latestApproved = await approvedPropertyIds(rows.map((p) => p.id), new Map(rows.map((p) => [p.id, p.updatedAt])));
  const result = await Promise.all(
    rows.filter((p) => latestApproved.has(p.id)).map(async (p) => {
      const imgs = (imgsByProperty.get(p.id) ?? []).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      const imageUrls = await Promise.all(
        imgs.slice(0, 6).map((img) =>
          // Listkorten är ~350 px breda: 800 px-WebP räcker även för retina; originalet bara som reserv.
          getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: img.thumbKey ?? img.key }), { expiresIn: 3600 }),
        ),
      );
      // name = redigerbar rubrik (faller tillbaka till deterministiskt SEO-namn).
      // slug = ren URL; faller tillbaka till id tills backfill/sparning satt en slug.
      const name = publicDisplayName(
        p.publicName,
        { city: p.city, bedrooms: p.bedrooms, beds: p.beds },
        p.slug,
      );
      return { ...await completePublicDescription(p), name, slug: p.slug ?? p.id, imageUrls };
    }),
  );

  // Delad CDN-cache: fem minuter färskt + fem minuter stale medan Vercel hämtar nytt.
  // Presignade bildlänkar gäller en timme, så ett cachat svar har alltid giltiga länkar.
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" },
  });
}
