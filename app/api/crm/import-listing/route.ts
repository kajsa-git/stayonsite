// POST { url } → hämtar en Qasa-/Airbnb-annons och returnerar normaliserad data för
// förhandsgranskning. SKRIVER INGET till databasen — objektet skapas först när Kajsa sparar.
import { requireApprovedSession } from "@/lib/crm/auth";
import { db } from "@/lib/crm/db";
import { importListing, UnsupportedListingError } from "@/lib/crm/import";
import { properties } from "@/lib/crm/schema";
import { and, like, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await requireApprovedSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const url = typeof body.url === "string" ? body.url : "";
  if (!url.trim()) return NextResponse.json({ error: "Ingen länk angiven" }, { status: 400 });

  try {
    const listing = await importListing(url);

    // Dubblett-koll: finns redan ett objekt med samma källänk (links[]) eller samma
    // adress+ort? Då varnar klienten i stället för att tyst skapa en kopia. Best-effort —
    // ett fel här får aldrig stoppa själva importen.
    let existing: { id: string; address: string | null; city: string | null } | null = null;
    try {
      const conds = [];
      if (listing.sourceUrl) conds.push(like(properties.links, `%${listing.sourceUrl}%`));
      if (listing.address && listing.city) {
        conds.push(
          and(
            sql`lower(trim(${properties.address})) = ${listing.address.trim().toLowerCase()}`,
            sql`lower(trim(${properties.city})) = ${listing.city.trim().toLowerCase()}`,
          ),
        );
      }
      if (conds.length) {
        const [row] = await db
          .select({ id: properties.id, address: properties.address, city: properties.city })
          .from(properties)
          .where(conds.length === 1 ? conds[0] : or(...conds))
          .limit(1);
        existing = row ?? null;
      }
    } catch (e) {
      console.error("import-listing dedup:", e);
    }

    return NextResponse.json({ listing, existing });
  } catch (e) {
    if (e instanceof UnsupportedListingError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    // Logga detaljen server-side men läck inte upstream-/SSRF-interna meddelanden till klienten.
    console.error("import-listing:", e);
    return NextResponse.json(
      { error: "Kunde inte hämta annonsen — kontrollera länken och försök igen." },
      { status: 502 },
    );
  }
}
