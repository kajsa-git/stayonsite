import { Inter, Montserrat, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/react'
import GoogleAdsScript from '@/components/GoogleAdsScript'
import CookieConsent from '@/components/CookieConsent'
import Providers from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      <Analytics />
      <SpeedInsights />
    </body>
  )
}
