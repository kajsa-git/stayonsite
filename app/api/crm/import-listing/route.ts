// POST { url } → hämtar en Qasa-/Airbnb-annons och returnerar normaliserad data för
// förhandsgranskning. SKRIVER INGET till databasen — objektet skapas först när Kajsa sparar.
import { requireApprovedSession } from "@/lib/crm/auth";
import { importListing, UnsupportedListingError } from "@/lib/crm/import";
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
    return NextResponse.json({ listing });
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
