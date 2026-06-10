'use client'

import { useState, useEffect } from 'react';

// Klick-ID:n (gclid/wbraid/gbraid) + UTM:er fångas vid landning och bärs med
// hela vägen till leadet, så Offline Conversion Import kan attribuera affären
// till annonsklicket UTAN cookies. wbraid/gbraid täcker iOS/app där gclid saknas.
const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'wbraid', 'gbraid', 'gad_source', 'fbclid',
] as const;

const STORAGE_KEY = 'stayonsite_utm';
// 90 dagar = Google Ads standard-attributionsfönster för klick → konvertering.
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

type Stored = { params: Record<string, string>; ts: number };

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (!parsed || typeof parsed.ts !== 'number' || !parsed.params) return null;
    if (Date.now() - parsed.ts > TTL_MS) return null; // utgånget klick
    return { params: parsed.params, ts: parsed.ts };
  } catch {
    return null;
  }
}

export const useUtmCapture = () => {
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const fromUrl: Record<string, string> = {};
    UTM_KEYS.forEach((key) => {
      const val = search.get(key);
      if (val) fromUrl[key] = val;
    });

    const stored = readStored();
    // Senaste klicket vinner (last-touch) — nya URL-värden skriver över lagrade.
    const merged = { ...(stored?.params ?? {}), ...fromUrl };

    // Förnya 90-dagarsfönstret bara när ett nytt klick kommer in; annars behåll
    // ursprunglig tidsstämpel så fönstret räknas från det faktiska klicket.
    const ts = Object.keys(fromUrl).length > 0 ? Date.now() : (stored?.ts ?? Date.now());

    if (Object.keys(merged).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ params: merged, ts } satisfies Stored));
      } catch {
        // localStorage kan vara blockerad (privat läge) — fortsätt ändå in-memory.
      }
    }
    setUtmParams(merged);
  }, []);

  return utmParams;
};
