import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitContactForm } from './contact-form';

vi.mock('@/lib/meta-pixel', () => ({ getMetaTrackingContext: () => undefined }));

describe('contact form advertising consent', () => {
  const submit = {
    formType: 'hero-intent' as const,
    locale: 'sv' as const,
    page: '/for-foretag',
    fields: { city: 'Boden' },
    utmParams: { gclid: 'test-click' },
  };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([null, 'denied', 'granted'] as const)(
    'sends the current %s choice with only permitted attribution', async (choice) => {
      if (choice) localStorage.setItem('cookie-consent', choice);
      await submitContactForm(submit);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.adsConsent ?? null).toBe(choice);
      expect(body.utmParams ?? null).toEqual(choice === 'granted' ? submit.utmParams : null);
    },
  );
});
