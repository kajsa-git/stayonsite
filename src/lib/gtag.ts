import { clarityEvent, updateClarityConsent } from './clarity'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export const GA_ADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? ''
export const GA_ADS_CALL_LABEL = process.env.NEXT_PUBLIC_GADS_CALL_LABEL ?? ''
export const GA_ADS_FORM_LABEL = process.env.NEXT_PUBLIC_GADS_FORM_LABEL ?? ''
export const GA_ADS_EMAIL_LABEL = process.env.NEXT_PUBLIC_GADS_EMAIL_LABEL ?? ''
export const GA_ADS_WHATSAPP_LABEL = process.env.NEXT_PUBLIC_GADS_WHATSAPP_LABEL ?? ''

const CONSENT_KEY = 'cookie-consent'

export type ConsentChoice = 'granted' | 'denied'

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(CONSENT_KEY)
  if (stored === 'granted' || stored === 'denied') return stored
  return null
}

export function updateConsent(choice: ConsentChoice) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONSENT_KEY, choice)
  updateClarityConsent(choice === 'granted')
  if (!window.gtag) return
  window.gtag('consent', 'update', {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  })
}

function fireConversion(label: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_ADS_ID) return
  window.gtag('event', 'conversion', {
    send_to: label ? `${GA_ADS_ID}/${label}` : GA_ADS_ID,
  })
}

export function trackPhoneClick() {
  fireConversion(GA_ADS_CALL_LABEL)
  clarityEvent('phone_click')
}

export function trackFormSubmit() {
  fireConversion(GA_ADS_FORM_LABEL)
  clarityEvent('form_submit')
}

export function trackEmailClick() {
  fireConversion(GA_ADS_EMAIL_LABEL)
  clarityEvent('email_click')
}

export function trackWhatsAppClick() {
  fireConversion(GA_ADS_WHATSAPP_LABEL)
  clarityEvent('whatsapp_click')
}

// Clarity-only (ingen Google Ads-konvertering) — funnelsteg "började fylla i formulär"
export function trackFormStart() {
  clarityEvent('form_start')
}
