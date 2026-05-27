"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Områdeskarta (OpenStreetMap/Leaflet). Ritar en mjuk cirkel runt postnummer-området —
// aldrig en pin på exakt adress (integritet). Dragbar/zoombar.
export function ProspektMap({ lat, lng, radius = 1200 }: { lat: number; lng: number; radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el) return;
      map = L.map(el, { scrollWheelZoom: false, attributionControl: true }).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      L.circle([lat, lng], {
        radius,
        color: "#ff6300",
        weight: 2,
        fillColor: "#ff6300",
        fillOpacity: 0.12,
      }).addTo(map);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, radius]);

  return <div ref={ref} className="h-[300px] w-full" />;
}
