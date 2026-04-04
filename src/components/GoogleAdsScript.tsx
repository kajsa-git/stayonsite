'use client'

import Script from 'next/script'
import { GA_ADS_ID } from '@/lib/gtag'

export default function GoogleAdsScript() {
  if (!GA_ADS_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${GA_ADS_ID}');
        `}
      </Script>
    </>
  )
}
