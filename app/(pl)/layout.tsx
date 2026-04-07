import type { Metadata } from 'next'
import { fontClassNames, SharedBody } from '../shared-layout'

export const metadata: Metadata = {
  title: 'StayOnSite - Zakwaterowanie dla pracowników budowlanych | Mieszkania służbowe Szwecja',
  description: 'StayOnSite pomaga firmom budowlanym szybko znaleźć zakwaterowanie w innych lokalizacjach dla ich pracowników. Ponad 10 lat doświadczenia.',
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
  other: {
    'sitemap': '/sitemap.xml',
  },
}

export default function PlLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" className={fontClassNames}>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable version" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted'});gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500,'region':['AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU','IE','IS','IT','LI','LT','LU','LV','MT','NL','NO','PL','PT','RO','SE','SI','SK','GB','CH']});` }} />
      </head>
      <SharedBody>{children}</SharedBody>
    </html>
  )
}
