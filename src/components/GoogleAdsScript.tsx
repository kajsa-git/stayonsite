'use client'

import { useEffect } from 'react'
import { GA_ADS_ID } from '@/lib/gtag'

export default function GoogleAdsScript() {
  useEffect(() => {
    if (!GA_ADS_ID) return

    // dataLayer and gtag() are already initialized in <head> with consent defaults
    // Just configure and load the script
    window.dataLayer = window.dataLayer || []
    if (!window.gtag) {
      window.gtag = function (...args: unknown[]) {
        window.dataLayer.push(args)
      } as typeof window.gtag
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_ADS_ID)

    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`
    script.async = true
    document.head.appendChild(script)
  }, [])

  return null
}
