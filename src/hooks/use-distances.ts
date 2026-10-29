"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsLibrary } from "./use-google-places";

export type DistResult = { distanceText: string; meters: number; durationText: string };
export type DistanceStatus = "idle" | "loading" | "ready" | "unavailable" | "error";
export type DistanceState = { results: Record<string, DistResult>; status: DistanceStatus };
type KeyedDistanceState = DistanceState & { queryKey: string };

const EMPTY_RESULTS: Record<string, DistResult> = {};

// Beräknar kör-avstånd adress→adress via Googles DistanceMatrixService (klient-sidigt).
// En origin (förfrågans arbetsplats) → många destinationer (objekten), batchat (≤25/anrop)
// och cachat per (origin, adress) så filterändringar inte ger nya API-anrop.
export function useDistances(origin: string, dests: { id: string; address: string }[]): DistanceState {
  const [state, setState] = useState<KeyedDistanceState>({ queryKey: "", results: EMPTY_RESULTS, status: "idle" });
  const cache = useRef<Map<string, DistResult>>(new Map());

  const o = origin.trim();
  const key = dests.map((d) => d.id + "|" + d.address).join("~");
  const queryKey = `${o}::${key}`;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Vänta ett mikrovarv innan state synkas så effekten inte orsakar en
      // synkron kaskadrender. `cancelled` skyddar samtidigt snabba querybyten.
      await Promise.resolve();
      if (cancelled) return;
      if (!o || dests.length === 0) {
        setState({ queryKey, results: EMPTY_RESULTS, status: "idle" });
        return;
      }

      // Visa cachade träffar direkt.
      const cached: Record<string, DistResult> = {};
      for (const d of dests) {
        const hit = cache.current.get(`${o}|${d.address}`);
        if (hit) cached[d.id] = hit;
      }

      const pending = dests.filter((d) => d.address.trim() && !cache.current.has(`${o}|${d.address}`));
      if (pending.length === 0) {
        setState({ queryKey, results: cached, status: "ready" });
        return;
      }
      setState({ queryKey, results: cached, status: "loading" });

      const lib = await loadGoogleMapsLibrary<any>("routes");
      if (cancelled) return;
      if (!lib?.DistanceMatrixService) {
        setState({ queryKey, results: cached, status: "unavailable" });
        return;
      }
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
                if (!cancelled && Object.keys(upd).length) {
                  setState((current) => current.queryKey === queryKey
                    ? { ...current, results: { ...current.results, ...upd } }
                    : current);
                }
              }
              resolve();
            },
          );
        });
        if (cancelled) return;
      }
      if (!cancelled) {
        setState((current) => current.queryKey === queryKey ? { ...current, status: "ready" } : current);
      }
    })().catch(() => {
      if (!cancelled) {
        setState((current) => current.queryKey === queryKey ? { ...current, status: "error" } : current);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o, key]);

  if (state.queryKey !== queryKey) {
    return { results: EMPTY_RESULTS, status: o && dests.length > 0 ? "loading" : "idle" };
  }
  return { results: state.results, status: state.status };
}
