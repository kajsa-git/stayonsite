import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/meta-pixel', () => ({ getMetaTrackingContext: () => undefined }))

describe('OpenAI company inquiry measurement', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_OPENAI_PIXEL_ID', 'pixel-test')
    localStorage.clear()
    localStorage.setItem('cookie-consent', 'granted')
    localStorage.setItem('stayonsite_openai_ads_consent_v1', 'granted')
    document.head.innerHTML = ''
    window.history.replaceState({}, '', '/')
    delete window.oaiq
    delete window.__stayOnSiteOpenAIPixelId
    delete window.__stayOnSiteOpenAIConsentGranted
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  const submission = { locale: 'sv' as const, page: '/', fields: { city: 'Boden' } }

  it.each(['hero-intent', 'project-brief', 'lp-corporate'] as const)(
    'records %s only after the inquiry succeeds', async (formType) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }))
      const { submitContactForm } = await import('./contact-form')
      await submitContactForm({ ...submission, formType })
      expect(window.oaiq?.q?.filter((event) => event[1] === 'lead_created')).toHaveLength(1)
    },
  )

  it('does not count homeowner forms as company leads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }))
    const { submitContactForm } = await import('./contact-form')
    await submitContactForm({ ...submission, formType: 'homeowner' })
    expect(window.oaiq).toBeUndefined()
  })

  it('does not count a failed submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false }) }))
    const { submitContactForm } = await import('./contact-form')
    await expect(submitContactForm({ ...submission, formType: 'hero-intent' })).rejects.toThrow()
    expect(window.oaiq).toBeUndefined()
  })
})
