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
  isHomeownerLeadForm: (formType: string) => formType === 'homeowner' || formType === 'lp-homeowner',
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

  it.each(['070.123.45.67', '070–123 45 67', '+46 (0)70 123 45 67'])(
    'accepts a commonly formatted phone number in the contact API: %s', async (phone) => {
      const request = new NextRequest('https://example.com/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          formType: 'hero-intent', locale: 'sv', page: '/stad/lulea', startedAt: Date.now(),
          fields: { ort: 'Luleå', antal_personer: '2', email: 'test@example.com', phone },
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mocks.map).toHaveBeenCalledWith(expect.objectContaining({ fields: expect.objectContaining({ phone }) }));
    },
  );

  it.each([
    ['sv', 'Till bostadsregistreringen hos HyrUtSmart'],
    ['en', 'Go to property registration at HyrUtSmart'],
    ['pl', 'Przejdź do rejestracji w HyrUtSmart'],
  ] as const)('sends the %s homeowner receipt with the Hyr ut smart registration link', async (locale, button) => {
    const request = new NextRequest('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        formType: 'homeowner', locale, page: '/for-husagare', startedAt: Date.now(),
        fields: { name: 'Anna Exempel', email: 'anna@example.com', phone: '0701234567', bedrooms: '3', postalCode: '12345' },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mocks.email).toHaveBeenCalledTimes(2);
    const confirmation = mocks.email.mock.calls[1][0];
    expect(confirmation.to).toBe('anna@example.com');
    expect(confirmation.replyTo).toBe('kajsa@stayonsite.se');
    expect(confirmation.text).toContain('https://hyrutsmart.se/registrera');
    expect(confirmation.html).toContain('href="https://hyrutsmart.se/registrera"');
    expect(confirmation.html).toContain(button);
    expect(confirmation.html).not.toContain('stayonsite.se/registrera-bostad');
    expect(confirmation.html).not.toContain('/uthyrare/');
  });
});
