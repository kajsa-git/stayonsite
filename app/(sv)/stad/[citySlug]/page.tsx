import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { cities, getNearbyCities } from '@/data/cities'
import { getCityListings } from '@/lib/crm/city-listings'
import { getLocalizedKeywords } from '@/lib/utils'
import CityPage from '@/views/CityPage'

export function generateStaticParams() {
  return cities.map((city) => ({ citySlug: city.slug }))
}

// Runtime-rendering: Vercel-BYGGET når inte Turso (sitemapen har varit tomt på
// boenden av samma skäl), så ISR/byggtids-snapshot ger tomma "Lediga boenden"-
// sektioner. Vid förfrågan finns DB:n alltid → sektionen är alltid korrekt.
// ~32 sidor × låg trafik gör SSR-kostnaden försumbar.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> {
  const { citySlug } = await params
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) return {}

  const sv = `https://www.stayonsite.se/stad/${city.slug}`
  const en = `https://www.stayonsite.se/en/corporate-housing/${city.slug}`
  const pl = `https://www.stayonsite.se/pl/zakwaterowanie/${city.slug}`

  return buildMetadata({
    title: `Företagsboende & företagsbostäder i ${city.name} | StayOnSite`,
    description: `Möblerade företagsbostäder, personalboende och företagslägenheter i ${city.name} från 5 900 kr/mån. Boendeplan med adresser och priser inom 24 timmar.`,
    keywords: getLocalizedKeywords(city.keywords, 'sv').join(', ') + ', StayOnSite',
    canonical: sv,
    hreflangs: [
      { lang: 'sv', href: sv },
      { lang: 'en', href: en },
      { lang: 'pl', href: pl },
      { lang: 'x-default', href: sv },
    ],
    locale: 'sv',
  })
}

export default async function Page({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) notFound()
  const listings = await getCityListings(city.name)
  return <CityPage citySlug={citySlug} locale="sv" city={city} nearbyCities={getNearbyCities(citySlug)} listings={listings} />
}
