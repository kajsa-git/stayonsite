import { approvedPropertyIds } from "./approved-property-content";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { properties } from "./schema";
import { publicDisplayName } from "./slug";

export interface PublicListingLink {
  slug: string;
  name: string;
  city: string;
}

// Server-rendered internal links for /boenden. The visual listing grid is loaded
// client-side because it needs signed image URLs, but crawlers and visitors must
// still be able to reach every published detail page without clicking pagination.
export async function getPublicListingLinks(): Promise<PublicListingLink[]> {
  try {
    const rows = await db
      .select({
        id: properties.id,
        slug: properties.slug,
        publicName: properties.publicName,
        city: properties.city,
        bedrooms: properties.bedrooms,
        beds: properties.beds,
      })
      .from(properties)
      .where(and(eq(properties.published, true), eq(properties.status, "available"), isNotNull(properties.slug)))
      .orderBy(asc(properties.city), asc(properties.publicName));

    const approved = await approvedPropertyIds(rows.map((row) => row.id));
    return rows.filter((row) => approved.has(row.id)).map((row) => ({
      slug: row.slug as string,
      name: publicDisplayName(
        row.publicName,
        {
          city: row.city,
          bedrooms: row.bedrooms,
          beds: row.beds,
        },
        row.slug,
      ),
      city: row.city?.trim() || "Övriga Sverige",
    }));
  } catch {
    // A temporary DB problem must not take down the public listings page.
    return [];
  }
}
