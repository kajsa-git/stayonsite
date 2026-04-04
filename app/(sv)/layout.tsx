import type { Metadata } from 'next'
import { fontClassNames, SharedBody } from '../shared-layout'

export const metadata: Metadata = {
  title: 'Personalboende & Företagsbostäder i Sverige | StayOnSite',
  description: 'StayOnSite hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare. Över 10 års erfarenhet. Boenden i hela Sverige.',
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
  other: {
    'sitemap': '/sitemap.xml',
  },
}

export default function SvLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className={fontClassNames}>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable version" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});` }} />
      </head>
      <SharedBody>{children}</SharedBody>
    </html>
  )
}
