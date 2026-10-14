import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/react'
import GoogleAdsScript from '@/components/GoogleAdsScript'
import ClarityScript from '@/components/ClarityScript'
import MetaPixelScript from '@/components/MetaPixelScript'
import CookieConsent from '@/components/CookieConsent'
import Providers from './providers'
import './globals.css'

const inter = localFont({
  src: './fonts/Inter-latin.woff2',
  weight: '300 700',
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = localFont({
  src: './fonts/Montserrat-latin.woff2',
  weight: '400 700',
  variable: '--font-montserrat',
  display: 'swap',
})

const playfairDisplay = localFont({
  src: './fonts/PlayfairDisplay-latin.woff2',
  weight: '400 700',
  adjustFontFallback: 'Times New Roman',
  variable: '--font-playfair',
  display: 'swap',
})

export const fontClassNames = `${inter.variable} ${montserrat.variable} ${playfairDisplay.variable}`

export function SharedBody({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <Providers>
        {children}
        <CookieConsent />
      </Providers>
      <GoogleAdsScript />
      <MetaPixelScript />
      <ClarityScript />
      <Analytics />
      <SpeedInsights />
    </body>
  )
}
