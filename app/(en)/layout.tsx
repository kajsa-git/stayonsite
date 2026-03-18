import type { Metadata } from 'next'
import { fontClassNames, SharedBody } from '../shared-layout'

export const metadata: Metadata = {
  title: 'StayOnSite - Accommodation for Construction Workers | Corporate Housing Sweden',
  description: 'StayOnSite helps construction companies quickly find accommodation in other locations for their workers. Over 10 years of experience. Housing throughout Sweden.',
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
  ],
  other: {
    'sitemap': '/sitemap.xml',
  },
}

export default function EnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontClassNames}>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable version" />
      </head>
      <SharedBody>{children}</SharedBody>
    </html>
  )
}
