import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildMetaLeadEvent } from './meta-conversions'

const hash = (value: string) => createHash('sha256').update(value).digest('hex')

describe('buildMetaLeadEvent', () => {
  it('requires explicit tracking consent', () => {
    expect(buildMetaLeadEvent(
      { formType: 'lp-homeowner', fields: { phone: '0701234567', city: 'Gävle' } },
      {}
    )).toBeNull()
  })

  it('normalizes matching data and keeps the browser event id for deduplication', () => {
    const event = buildMetaLeadEvent(
      {
        formType: 'homeowner',
        fields: {
          name: 'Kajsa Sihlén',
          email: ' KAJSA@example.com ',
          phone: '070-123 45 67',
          city: 'Gävle',
          postalCode: '801 01',
        },
        tracking: {
          consent: true,
          eventId: 'lead-test-123',
          eventSourceUrl: 'https://www.stayonsite.se/lp/husagare',
          fbp: 'fb.1.123.example',
        },
      },
      { ip: '203.0.113.1', userAgent: 'test-browser' },
      1_700_000_000_000
    )

    expect(event).toMatchObject({
      event_name: 'Lead',
      event_time: 1_700_000_000,
      event_id: 'lead-test-123',
      action_source: 'website',
      event_source_url: 'https://www.stayonsite.se/lp/husagare',
      custom_data: {
        content_category: 'homeowner',
        content_name: 'homeowner',
      },
    })
    expect(event?.user_data).toMatchObject({
      em: [hash('kajsa@example.com')],
      ph: [hash('46701234567')],
      fn: [hash('kajsa')],
      ln: [hash('sihlén')],
      ct: [hash('gävle')],
      zp: [hash('80101')],
      external_id: [hash('kajsa@example.com')],
      client_ip_address: '203.0.113.1',
      client_user_agent: 'test-browser',
      fbp: 'fb.1.123.example',
    })
  })
})
