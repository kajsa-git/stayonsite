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

// Enhanced Conversions: Google-taggen får besökarens e-post/telefon (hashas av taggen innan
// det skickas) så att konverteringen kan matchas även utan gclid. Kräver ad_user_data-samtycke,
// vilket Consent Mode sköter — utan samtycke skickar taggen inget.
export type LeadUserData = { email?: string; phone?: string }

// Google kräver E.164 (+46701234567). Formulären tillåter 070-…, 0046…, +46…
function toE164(phone: string): string | undefined {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return undefined
  if (trimmed.startsWith('+')) return `+${digits}`
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (digits.startsWith('0')) return `+46${digits.slice(1)}`
  return digits.length >= 10 ? `+${digits}` : undefined
}

export function setUserData(user: LeadUserData) {
  if (typeof window === 'undefined' || !window.gtag) return
  const data: Record<string, string> = {}
  const email = user.email?.trim().toLowerCase()
  if (email) data.email = email
  const phone = user.phone ? toE164(user.phone) : undefined
  if (phone) data.phone_number = phone
  if (Object.keys(data).length === 0) return
  window.gtag('set', 'user_data', data)
}

export function trackFormSubmit(user?: LeadUserData) {
  if (user) setUserData(user)
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
