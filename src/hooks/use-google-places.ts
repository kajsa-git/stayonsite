"use client";

import { useCallback, useEffect, useRef } from "react";

export interface PlaceParts {
  street: string;
  postalCode: string;
  city: string;
}

interface GAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}
interface GAutocomplete {
  addListener: (event: string, cb: () => void) => void;
  getPlace: () => { address_components?: GAddressComponent[] };
}
interface GMaps {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: Record<string, unknown>
      ) => GAutocomplete;
    };
    event: { clearInstanceListeners: (instance: unknown) => void };
  };
}

declare global {
  interface Window {
    google?: GMaps;
    __gmapsPlacesPromise?: Promise<void>;
  }
}

const SCRIPT_ID = "google-maps-places";

function loadPlaces(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__gmapsPlacesPromise) return window.__gmapsPlacesPromise;

  window.__gmapsPlacesPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&language=sv&region=SE`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return window.__gmapsPlacesPromise;
}

function partsFromPlace(components: GAddressComponent[]): PlaceParts {
  const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name ?? "";
  const route = get("route");
  const streetNumber = get("street_number");
  const street = [route, streetNumber].filter(Boolean).join(" ").trim();
  const postalCode = get("postal_code");
  const city = get("postal_town") || get("locality") || get("sublocality") || "";
  return { street, postalCode, city };
}

/**
 * Returns a ref callback for an <input>. When a Google Maps API key is present
 * (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY), attaches Places Autocomplete (SE only) and
 * calls onPlace with parsed parts on selection. No key → no-op (caller keeps its
 * own datalist fallback). `enabled` lets the caller skip attaching (e.g. modal closed).
 */
export function useGooglePlaces(onPlace: (parts: PlaceParts) => void, enabled = true) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;
  const acRef = useRef<GAutocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const attach = useCallback(
    (input: HTMLInputElement) => {
      const ac = new input.ownerDocument.defaultView!.google!.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "se" },
        fields: ["address_components"],
      });
      acRef.current = ac;
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.address_components) onPlaceRef.current(partsFromPlace(place.address_components));
      });
    },
    []
  );

  useEffect(() => {
    if (!enabled || !apiKey || !inputRef.current) return;
    let cancelled = false;
    loadPlaces(apiKey)
      .then(() => {
        if (!cancelled && inputRef.current && !acRef.current) attach(inputRef.current);
      })
      .catch(() => {
        /* fallback: caller's datalist still works */
      });
    return () => {
      cancelled = true;
      if (acRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(acRef.current);
        acRef.current = null;
      }
    };
  }, [apiKey, enabled, attach]);

  const ref = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
  }, []);

  return { ref, enabled: !!apiKey && enabled };
}
