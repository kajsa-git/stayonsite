import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadMetaPixel(pixelId = '123456789') {
  vi.resetModules()
  process.env.NEXT_PUBLIC_FB_PIXEL_ID = pixelId
  return import('./meta-pixel')
}

describe('Meta Pixel consent', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = ''
    delete window.fbq
    delete window._fbq
    delete window.__stayOnSiteMetaPixelId
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_FB_PIXEL_ID
  })

  it('does not load Meta before consent', async () => {
    const { initializeMetaPixel } = await loadMetaPixel()

    expect(initializeMetaPixel()).toBe(false)
    expect(document.querySelector('script[data-stayonsite-meta-pixel]')).toBeNull()
    expect(window.fbq).toBeUndefined()
  })

  it('loads once after consent and includes event_id on Lead', async () => {
    localStorage.setItem('cookie-consent', 'granted')
    const { initializeMetaPixel, trackMetaEvent, trackMetaPageView } = await loadMetaPixel()

    expect(initializeMetaPixel()).toBe(true)
    trackMetaPageView()
    trackMetaEvent('Lead', { content_name: 'lp-homeowner' }, 'lead-test-123')

    const script = document.querySelector<HTMLScriptElement>('script[data-stayonsite-meta-pixel]')
    expect(script?.src).toBe('https://connect.facebook.net/en_US/fbevents.js')
    expect(window.__stayOnSiteMetaPixelId).toBe('123456789')
    expect(window.fbq?.queue).toEqual([
      ['init', '123456789'],
      ['track', 'PageView'],
      ['track', 'Lead', { content_name: 'lp-homeowner' }, { eventID: 'lead-test-123' }],
    ])
    expect(document.querySelectorAll('script[data-stayonsite-meta-pixel]')).toHaveLength(1)
  })
})
