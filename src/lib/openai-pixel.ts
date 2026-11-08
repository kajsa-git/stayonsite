'use client'

import { getStoredConsent, type ConsentChoice } from '@/lib/gtag'

export const OPENAI_PIXEL_ID = process.env.NEXT_PUBLIC_OPENAI_PIXEL_ID ?? ''
export const OPEN_CONSENT_SETTINGS_EVENT = 'stayonsite:open-consent-settings'
const OPENAI_CONSENT_KEY = 'stayonsite_openai_ads_consent_v1'

type OpenAIPixelFunction = ((...args: unknown[]) => void) & { q?: unknown[][] }

declare global {
  interface Window {
    oaiq?: OpenAIPixelFunction
    __stayOnSiteOpenAIPixelId?: string
    __stayOnSiteOpenAIConsentGranted?: boolean
  }
}

export function getStoredOpenAIConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(OPENAI_CONSENT_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function storeOpenAIConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(OPENAI_CONSENT_KEY, choice)
  } catch {
    // Without a stored decision, do not enable OpenAI measurement.
  }
}

// Only public pages for the corporate-housing journey. In particular, never
// initialize measurement on the CRM, landlord intake, or private share pages.
export function isOpenAIMeasurementPage(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  return (
    ['/', '/for-foretag', '/projektboende', '/datacenter-boende', '/boenden',
      '/en/corporate-housing-sweden', '/en/data-centre-accommodation-sweden',
      '/pl/zakwaterowanie-firmowe', '/pl/zakwaterowanie-centra-danych-szwecja',
      '/lp/corporate-housing'].includes(path) ||
    path.startsWith('/stad/') ||
    path.startsWith('/boenden/') ||
    path.startsWith('/en/corporate-housing/') ||
    path.startsWith('/pl/zakwaterowanie/')
  )
}

function hasMeasurementConsent(): boolean {
  try {
    return getStoredConsent() === 'granted' && getStoredOpenAIConsent() === 'granted'
  } catch {
    return false
  }
}

export function suspendOpenAIMeasurement(): void {
  if (typeof window === 'undefined' || !window.oaiq || !window.__stayOnSiteOpenAIConsentGranted) return
  window.oaiq('consent', false)
  window.__stayOnSiteOpenAIConsentGranted = false
}

export function initializeOpenAIPixel(): boolean {
  if (typeof window === 'undefined' || !OPENAI_PIXEL_ID) return false
  if (!hasMeasurementConsent() || !isOpenAIMeasurementPage(window.location.pathname)) {
    suspendOpenAIMeasurement()
    return false
  }

  if (!window.oaiq) {
    const queue = function (...args: unknown[]) { queue.q?.push(args) } as OpenAIPixelFunction
    queue.q = []
    window.oaiq = queue
  }
  if (!window.__stayOnSiteOpenAIConsentGranted) {
    window.oaiq('consent', true)
    window.__stayOnSiteOpenAIConsentGranted = true
  }
  if (window.__stayOnSiteOpenAIPixelId !== OPENAI_PIXEL_ID) {
    window.oaiq('init', { pixelId: OPENAI_PIXEL_ID })
    window.__stayOnSiteOpenAIPixelId = OPENAI_PIXEL_ID
  }
  if (!document.querySelector('script[data-stayonsite-openai-pixel]')) {
    const script = document.createElement('script')
    script.async = true
    script.dataset.stayonsiteOpenaiPixel = 'true'
    script.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js'
    document.head.appendChild(script)
  }
  return true
}

export function trackOpenAIPageView(): void {
  if (initializeOpenAIPixel()) window.oaiq?.('measure', 'page_viewed', { type: 'contents' })
}

export function trackOpenAILead(): void {
  if (initializeOpenAIPixel()) window.oaiq?.('measure', 'lead_created', { type: 'customer_action' })
}
