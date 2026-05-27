"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsLibrary } from "./use-google-places";

export type DistResult = { distanceText: string; meters: number; durationText: string };

// Beräknar kör-avstånd adress→adress via Googles DistanceMatrixService (klient-sidigt).
// En origin (förfrågans arbetsplats) → många destinationer (objekten), batchat (≤25/anrop)
// och cachat per (origin, adress) så filterändringar inte ger nya API-anrop.
export function useDistances(origin: string, dests: { id: string; address: string }[]): Record<string, DistResult> {
  const [results, setResults] = useState<Record<string, DistResult>>({});
  const cache = useRef<Map<string, DistResult>>(new Map());

  const o = origin.trim();
  const key = dests.map((d) => d.id + "|" + d.address).join("~");

  useEffect(() => {
    if (!o) return;
    let cancelled = false;

    // Visa cachade träffar direkt.
    const cached: Record<string, DistResult> = {};
    for (const d of dests) {
      const hit = cache.current.get(`${o}|${d.address}`);
      if (hit) cached[d.id] = hit;
    }
    if (Object.keys(cached).length) setResults((r) => ({ ...r, ...cached }));

    const pending = dests.filter((d) => d.address.trim() && !cache.current.has(`${o}|${d.address}`));
    if (pending.length === 0) return;

    (async () => {
      const lib = await loadGoogleMapsLibrary<any>("routes");
      if (!lib?.DistanceMatrixService || cancelled) return;
      const svc = new lib.DistanceMatrixService();
      const CHUNK = 25;
      for (let i = 0; i < pending.length; i += CHUNK) {
        const batch = pending.slice(i, i + CHUNK);
        await new Promise<void>((resolve) => {
          svc.getDistanceMatrix(
            { origins: [o], destinations: batch.map((d) => d.address), travelMode: "DRIVING" },
            (resp: any, status: string) => {
              const elements = status === "OK" ? resp?.rows?.[0]?.elements : null;
              if (elements) {
                const upd: Record<string, DistResult> = {};
                batch.forEach((d, j) => {
                  const el = elements[j];
                  if (el?.status === "OK") {
                    const res: DistResult = {
                      distanceText: el.distance.text,
                      meters: el.distance.value,
                      durationText: el.duration.text,
                    };
                    cache.current.set(`${o}|${d.address}`, res);
                    upd[d.id] = res;
                  }
                });
                if (!cancelled && Object.keys(upd).length) setResults((r) => ({ ...r, ...upd }));
              }
              resolve();
            },
          );
        });
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o, key]);

  return results;
}
