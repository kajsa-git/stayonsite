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
      </head>
      <SharedBody>{children}</SharedBody>
    </html>
  )
}
