declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export const GA_ADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? ''
export const GA_ADS_CALL_LABEL = process.env.NEXT_PUBLIC_GADS_CALL_LABEL ?? ''
export const GA_ADS_FORM_LABEL = process.env.NEXT_PUBLIC_GADS_FORM_LABEL ?? ''

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
