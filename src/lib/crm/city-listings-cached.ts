// Egen modul: Reacts `cache` finns bara i Nexts körning (inte i React 18 som
// Vitest laddar), så city-listings.ts hålls fri från den.
//
// generateMetadata och sidan hämtar samma lista i samma förfrågan → en DB-runda.
// `localities` är samma referens (från cities.ts) i båda anropen, så cachen träffar.
import { cache } from "react";
import { getCityListings } from "./city-listings";

export const getCityListingsCached = cache(getCityListings);
