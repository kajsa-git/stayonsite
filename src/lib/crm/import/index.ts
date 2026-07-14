// Dispatch: rå länk → källdetektering → rätt parser. Server-sidan (API-routen) anropar denna.
import { fetchAirbnbListing } from "./airbnb";
import { fetchQasaListing } from "./qasa";
import type { ImportedListing } from "./types";
import { detectListing } from "./url";

export class UnsupportedListingError extends Error {
  constructor(message = "Länken känns inte igen — klistra in en Qasa-, Airbnb-, Hemnet- eller Booli-länk.") {
    super(message);
    this.name = "UnsupportedListingError";
  }
}

export async function importListing(rawUrl: string): Promise<ImportedListing> {
  const detected = detectListing(rawUrl);
  if (!detected) throw new UnsupportedListingError();

  switch (detected.source) {
    case "qasa":
      return fetchQasaListing(detected.id, detected.canonicalUrl);
    case "airbnb":
      return fetchAirbnbListing(detected.id, detected.canonicalUrl);
    // Hemnet/Booli hämtas aldrig server-side (Cloudflare-botskydd) — klienten
    // växlar till klistra-in-läget FÖRE anrop; når vi hit är det ett kodfel.
    case "hemnet":
    case "booli":
      throw new UnsupportedListingError(
        "Hemnet/Booli kan inte hämtas automatiskt — använd klistra-in-läget i formuläret."
      );
  }
}

export { detectListing } from "./url";
export { parsePastedListing } from "./paste";
export type { ImportedListing, ListingSource } from "./types";
export { PASTE_SOURCES, SOURCE_LABEL, listingToPropertyPatch } from "./types";
