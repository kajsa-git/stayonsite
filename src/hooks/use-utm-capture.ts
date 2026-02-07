import { useState, useEffect } from 'react';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const;
const STORAGE_KEY = 'stayonsite_utm';

export const useUtmCapture = () => {
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};

    UTM_KEYS.forEach((key) => {
      const val = params.get(key);
      if (val) utm[key] = val;
    });

    // Merge with previously stored params (URL params take precedence)
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string>;
        const merged = { ...parsed, ...utm };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setUtmParams(merged);
      } else {
        if (Object.keys(utm).length > 0) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
        }
        setUtmParams(utm);
      }
    } catch {
      setUtmParams(utm);
    }
  }, []);

  return utmParams;
};
