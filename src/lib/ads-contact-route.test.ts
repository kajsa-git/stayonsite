import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  map: vi.fn().mockResolvedValue({}),
  email: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock('resend', () => ({ Resend: class { emails = { send: mocks.email }; } }));
vi.mock('@/lib/crm/contact-intake', () => ({ mapWebSubmissionToCrm: mocks.map }));
vi.mock('@/lib/crm/corporate-qualification-email', () => ({ corporateQualificationRecipient: () => null }));
vi.mock('@/lib/crm/corporate-qualification-workflow', () => ({ sendCorporateQualificationEmail: vi.fn() }));
vi.mock('@/lib/crm/homeowner-automation', () => ({
  queueHomeownerLeadIntakeSms: vi.fn(), shouldQueueHomeownerLeadIntakeSms: () => false,
}));
vi.mock('@/lib/meta-conversions', () => ({ sendMetaLeadEvent: vi.fn().mockResolvedValue(undefined) }));

import { POST } from '../../app/api/contact/route';

describe('contact API consent handling', () => {
  beforeEach(() => { mocks.map.mockClear(); mocks.email.mockClear(); });

  it.each([undefined, 'denied', 'granted'] as const)(
    'does not pass ad identifiers to CRM without granted consent (%s)', async (adsConsent) => {
      const request = new NextRequest('https://example.com/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          formType: 'hero-intent', locale: 'sv', page: '/for-foretag',
          startedAt: Date.now(), adsConsent,
          fields: { city: 'Boden', people: '2', company: 'Exempel AB', email: 'test@example.com' },
          utmParams: { gclid: 'test-click' },
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
      const submission = mocks.map.mock.calls[0][0];
      expect(submission.adsConsent).toBe(adsConsent);
      expect(submission.utmParams).toEqual(adsConsent === 'granted' ? { gclid: 'test-click' } : undefined);
    },
  );
});
