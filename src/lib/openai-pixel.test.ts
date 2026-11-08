import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadPixel() {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_OPENAI_PIXEL_ID', 'pixel-test')
  return import('./openai-pixel')
}

describe('OpenAI measurement consent and scope', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    window.history.replaceState({}, '', '/')
    delete window.oaiq
    delete window.__stayOnSiteOpenAIPixelId
    delete window.__stayOnSiteOpenAIConsentGranted
  })

  afterEach(() => vi.unstubAllEnvs())

  it('does not load or send a lead for an old general advertising consent alone', async () => {
    localStorage.setItem('cookie-consent', 'granted')
    const { trackOpenAILead } = await loadPixel()
    trackOpenAILead()
    expect(window.oaiq).toBeUndefined()
    expect(document.querySelector('script[data-stayonsite-openai-pixel]')).toBeNull()
  })

  it('initializes once and sends only the documented events after OpenAI-specific consent', async () => {
    localStorage.setItem('cookie-consent', 'granted')
    const { storeOpenAIConsent, trackOpenAIPageView, trackOpenAILead } = await loadPixel()
    storeOpenAIConsent('granted')
    trackOpenAIPageView()
    trackOpenAILead()
    expect(document.querySelectorAll('script[data-stayonsite-openai-pixel]')).toHaveLength(1)
    expect(document.querySelector<HTMLScriptElement>('script[data-stayonsite-openai-pixel]')?.src)
      .toBe('https://bzrcdn.openai.com/sdk/oaiq.min.js')
    expect(window.oaiq?.q).toEqual([
      ['consent', true],
      ['init', { pixelId: 'pixel-test' }],
      ['measure', 'page_viewed', { type: 'contents' }],
      ['measure', 'lead_created', { type: 'customer_action' }],
    ])
  })

  it('suspends measurement when consent is withdrawn', async () => {
    localStorage.setItem('cookie-consent', 'granted')
    const { storeOpenAIConsent, trackOpenAIPageView, trackOpenAILead } = await loadPixel()
    storeOpenAIConsent('granted')
    trackOpenAIPageView()
    storeOpenAIConsent('denied')
    trackOpenAILead()
    expect(window.oaiq?.q?.at(-1)).toEqual(['consent', false])
    expect(window.oaiq?.q?.filter((event) => event[1] === 'lead_created')).toHaveLength(0)
  })

  it('does not measure private CRM or homeowner pages', async () => {
    localStorage.setItem('cookie-consent', 'granted')
    const { storeOpenAIConsent, trackOpenAIPageView, trackOpenAILead } = await loadPixel()
    storeOpenAIConsent('granted')
    window.history.replaceState({}, '', '/crm/requests')
    trackOpenAILead()
    expect(window.oaiq).toBeUndefined()
    window.history.replaceState({}, '', '/')
    trackOpenAIPageView()
    window.history.replaceState({}, '', '/for-husagare')
    trackOpenAILead()
    expect(window.oaiq?.q?.at(-1)).toEqual(['consent', false])
    expect(window.oaiq?.q?.filter((event) => event[1] === 'lead_created')).toHaveLength(0)
  })
})
