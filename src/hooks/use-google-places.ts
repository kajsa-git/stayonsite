"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

export interface PlaceParts {
  street: string;
  postalCode: string;
  city: string;
  country: string;
  formatted: string;
}

declare global {
  interface Window {
    google?: any;
    __gmapsBootstrapped?: boolean;
  }
}

// Google's official async inline loader — defines google.maps.importLibrary and
// loads the JS API with loading=async (removes the "loaded directly" warning).
function bootstrap(apiKey: string) {
  if (typeof window === "undefined") return;
  if (window.google?.maps?.importLibrary || window.__gmapsBootstrapped) return;
  window.__gmapsBootstrapped = true;
  ((g: Record<string, string>) => {
    let h: Promise<void> | undefined;
    const d: any = ((window.google = window.google || {}).maps = window.google.maps || {});
    const libs = new Set<string>();
    const params = new URLSearchParams();
    const load = () =>
      h ||
      (h = new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        params.set("libraries", [...libs].join(","));
        for (const k in g) params.set(k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), g[k]);
        params.set("callback", "google.maps.__ib__");
        s.src = `https://maps.googleapis.com/maps/api/js?${params}`;
        d.__ib__ = resolve;
        s.onerror = () => reject(new Error("Google Maps could not load."));
        document.head.append(s);
      }));
    d.importLibrary = (name: string, ...rest: unknown[]) =>
      libs.add(name) && load().then(() => d.importLibrary(name, ...rest));
  })({ key: apiKey, v: "weekly", language: "sv", region: "SE" });
}

function parsePlace(place: any): PlaceParts {
  const comps: any[] = place.addressComponents ?? [];
  const get = (type: string) => comps.find((c) => (c.types ?? []).includes(type))?.longText ?? "";
  const route = get("route");
  const num = get("street_number");
  return {
    street: [route, num].filter(Boolean).join(" ").trim(),
    postalCode: get("postal_code"),
    city: get("postal_town") || get("locality") || get("sublocality_level_1") || "",
    country: get("country"),
    formatted: place.formattedAddress ?? "",
  };
}

/**
 * Mounts a Google PlaceAutocompleteElement (Places API New) into the returned
 * container ref and calls onPlace with parsed parts on selection. Sweden-only.
 * No API key → no-op (caller keeps its own input fallback). `enabled` lets the
 * caller skip mounting (e.g. when a modal is closed).
 */
export function useGooglePlaces(onPlace: (parts: PlaceParts) => void, enabled = true) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !apiKey || !containerRef.current) return;
    let cancelled = false;
    const container = containerRef.current;
    bootstrap(apiKey);
    (async () => {
      try {
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");
        if (cancelled || !container) return;
        const el: any = new PlaceAutocompleteElement({ includedRegionCodes: ["se"] });
        el.style.width = "100%";
        container.innerHTML = "";
        container.appendChild(el);
        el.addEventListener("gmp-select", async (event: any) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
          onPlaceRef.current(parsePlace(place));
        });
      } catch {
        /* fallback: caller keeps its own input */
      }
    })();
    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [apiKey, enabled]);

  return { containerRef, enabled: !!apiKey && enabled };
}
