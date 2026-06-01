// Känner igen en inklistrad Qasa-/Airbnb-länk, plockar ut käll-id och bygger en ren,
// delbar kanonisk länk (utan spårnings-query) som läggs på objektet. Ren funktion.
import type { ListingSource } from "./types";

export interface DetectedListing {
  source: ListingSource;
  id: string;
  canonicalUrl: string; // origin + pathname, query/hash bortstädat
}

function parseUrl(raw: string): URL | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto);
  } catch {
    return null;
  }
}

export function detectListing(raw: string): DetectedListing | null {
  const url = parseUrl(raw);
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const clean = `${url.origin}${url.pathname}`.replace(/\/$/, "");

  // Qasa: t.ex. https://qasa.com/se/sv/home/1383062 (även bostad.qasa.com, /p/ förekommer)
  if (host === "qasa.com" || host.endsWith(".qasa.com") || host === "qasa.se" || host.endsWith(".qasa.se")) {
    const m = path.match(/\/(?:home|homes|p)\/(\d+)/);
    if (m) return { source: "qasa", id: m[1], canonicalUrl: clean };
  }

  // Airbnb: https://www.airbnb.se/rooms/828291001516135667 (även /rooms/plus/<id>, /h/...)
  if (host === "airbnb.com" || host.endsWith(".airbnb.com") || /(^|\.)airbnb\.[a-z.]+$/.test(host)) {
    const m = path.match(/\/rooms\/(?:plus\/)?(\d+)/);
    if (m) return { source: "airbnb", id: m[1], canonicalUrl: clean };
  }

  return null;
}
