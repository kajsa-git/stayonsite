// Dispatch: rå länk → källdetektering → rätt parser. Server-sidan (API-routen) anropar denna.
import { fetchAirbnbListing } from "./airbnb";
import { fetchQasaListing } from "./qasa";
import type { ImportedListing } from "./types";
import { detectListing } from "./url";

export class UnsupportedListingError extends Error {
  constructor(message = "Länken känns inte igen — klistra in en Qasa- eller Airbnb-länk.") {
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
  }
}

export { detectListing } from "./url";
export type { ImportedListing, ListingSource } from "./types";
export { SOURCE_LABEL, listingToPropertyPatch } from "./types";
