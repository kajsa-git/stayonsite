'use client'

import { useState, useEffect } from 'react';
import { CONSENT_CHANGE_EVENT, getStoredConsent } from '@/lib/gtag';

// Klick-ID:n och UTM-parametrar sparas bara efter uttryckligt samtycke.
const UTM_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'wbraid', 'gbraid', 'gad_source', 'fbclid',
] as const;

// Äldre poster saknar bevis om samtycke och får aldrig återanvändas.
const STORAGE_KEY = 'stayonsite_utm_consented_v2';
const LEGACY_STORAGE_KEY = 'stayonsite_utm';
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
    const capture = () => {
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* Storage is unavailable. */ }
      let consentGranted = false;
      try {
        consentGranted = getStoredConsent() === 'granted';
      } catch {
        // Om samtycket inte kan läsas ska inga klickidentifierare sparas.
      }
      if (!consentGranted) {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage is unavailable. */ }
        setUtmParams({});
        return;
      }

      const search = new URLSearchParams(window.location.search);
      const fromUrl: Record<string, string> = {};
      UTM_KEYS.forEach((key) => {
        const val = search.get(key);
        if (val) fromUrl[key] = val;
      });
      const stored = readStored();
      const merged = { ...(stored?.params ?? {}), ...fromUrl };
      const ts = Object.keys(fromUrl).length > 0 ? Date.now() : (stored?.ts ?? Date.now());
      if (Object.keys(merged).length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ params: merged, ts } satisfies Stored));
        } catch {
          // Consent exists but storage may be blocked; keep the current page in memory.
        }
      }
      setUtmParams(merged);
    };
    capture();
    window.addEventListener(CONSENT_CHANGE_EVENT, capture);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, capture);
  }, []);

  return utmParams;
};
