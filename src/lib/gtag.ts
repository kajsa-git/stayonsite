declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export const GA_ADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? ''
export const GA_ADS_CALL_LABEL = process.env.NEXT_PUBLIC_GADS_CALL_LABEL ?? ''
export const GA_ADS_FORM_LABEL = process.env.NEXT_PUBLIC_GADS_FORM_LABEL ?? ''

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
  if (!window.gtag) return
  window.gtag('consent', 'update', {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  })
}

export function trackPhoneClick() {
  if (typeof window === 'undefined' || !window.gtag || !GA_ADS_ID) return
  window.gtag('event', 'conversion', {
    send_to: GA_ADS_CALL_LABEL
      ? `${GA_ADS_ID}/${GA_ADS_CALL_LABEL}`
      : GA_ADS_ID,
  })
}

export function trackFormSubmit() {
  if (typeof window === 'undefined' || !window.gtag || !GA_ADS_ID) return
  window.gtag('event', 'conversion', {
    send_to: GA_ADS_FORM_LABEL
      ? `${GA_ADS_ID}/${GA_ADS_FORM_LABEL}`
      : GA_ADS_ID,
  })
}
