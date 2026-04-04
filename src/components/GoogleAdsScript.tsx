'use client'

import { useEffect } from 'react'
import { GA_ADS_ID } from '@/lib/gtag'

export default function GoogleAdsScript() {
  useEffect(() => {
    if (!GA_ADS_ID) return

    // Set consent defaults before loading gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag as typeof window.gtag
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    })
    gtag('js', new Date())
    gtag('config', GA_ADS_ID)

    // Load gtag.js
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`
    script.async = true
    document.head.appendChild(script)
  }, [])

  return null
}
