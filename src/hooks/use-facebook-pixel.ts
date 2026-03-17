'use client'

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

export const useFacebookPixel = () => {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID as string | undefined;
    if (!pixelId || typeof window === 'undefined') return;
    if (window.fbq) return; // already loaded

    // Standard Facebook Pixel base code
    const n = (window.fbq = function (...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    } as typeof window.fbq & { callMethod?: (...args: unknown[]) => void; queue: unknown[][] });
    if (!window._fbq) window._fbq = n;
    (n as unknown as { push: typeof Array.prototype.push }).push = (n as unknown as { push: typeof Array.prototype.push }).push;
    (n as unknown as { loaded: boolean }).loaded = true;
    (n as unknown as { version: string }).version = '2.0';
    (n as unknown as { queue: unknown[][] }).queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }, []);
};

export const trackFbEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};
