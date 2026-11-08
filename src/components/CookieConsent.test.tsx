import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => { process.env.NEXT_PUBLIC_OPENAI_PIXEL_ID = 'pixel-test' })
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ t: (key: string) => key }) }))
vi.mock('@/lib/meta-pixel', () => ({ META_PIXEL_ID: '' }))

import CookieConsent from './CookieConsent'

describe('OpenAI-specific consent notice', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('asks again before enabling the new provider for an existing advertising opt-in', () => {
    localStorage.setItem('cookie-consent', 'granted')
    render(<CookieConsent />)
    expect(screen.getByText('cookie.openaiText')).toBeInTheDocument()
    expect(localStorage.getItem('stayonsite_openai_ads_consent_v1')).toBeNull()
    fireEvent.click(screen.getByText('cookie.accept'))
    expect(localStorage.getItem('stayonsite_openai_ads_consent_v1')).toBe('granted')
    expect(screen.queryByText('cookie.openaiText')).not.toBeInTheDocument()
  })

  it('preserves an existing refusal without prompting again', () => {
    localStorage.setItem('cookie-consent', 'denied')
    render(<CookieConsent />)
    expect(screen.queryByText('cookie.openaiText')).not.toBeInTheDocument()
    expect(localStorage.getItem('stayonsite_openai_ads_consent_v1')).toBeNull()
  })

  it('lets a visitor reopen settings and withdraw their previous consent', () => {
    localStorage.setItem('cookie-consent', 'granted')
    localStorage.setItem('stayonsite_openai_ads_consent_v1', 'granted')
    render(<CookieConsent />)
    expect(screen.queryByText('cookie.openaiText')).not.toBeInTheDocument()
    act(() => { window.dispatchEvent(new Event('stayonsite:open-consent-settings')) })
    fireEvent.click(screen.getByText('cookie.deny'))
    expect(localStorage.getItem('cookie-consent')).toBe('denied')
    expect(localStorage.getItem('stayonsite_openai_ads_consent_v1')).toBe('denied')
    expect(screen.queryByText('cookie.openaiText')).not.toBeInTheDocument()
  })
})
