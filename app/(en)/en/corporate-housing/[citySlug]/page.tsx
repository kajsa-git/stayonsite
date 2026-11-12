import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { cities, getNearbyCitySummaries } from '@/data/cities'
import { getLocalizedText, getLocalizedKeywords } from '@/lib/utils'
import { truncateDescription } from '@/lib/seo-utils'
import { cityListingsOgImage } from '@/lib/crm/city-listings'
import { getCityListingsCached } from '@/lib/crm/city-listings-cached'
import CityPage from '@/views/CityPage'

export function generateStaticParams() {
  return cities.map((city) => ({ citySlug: city.slug }))
}

// Runtime-rendering: Vercel-BYGGET når inte Turso, så boendelistan hämtas vid
// förfrågan — samma lista som den svenska stadssidan.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> {
  const { citySlug } = await params
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) return {}
  const listings = await getCityListingsCached(city.name, city.listingLocalities)

  const sv = `https://www.stayonsite.se/stad/${city.slug}`
  const en = `https://www.stayonsite.se/en/corporate-housing/${city.slug}`
  const pl = `https://www.stayonsite.se/pl/zakwaterowanie/${city.slug}`

  return buildMetadata({
    title: `Corporate Housing & Apartments in ${city.name} | StayOnSite`,
    description: city.pageContent
      ? getLocalizedText(city.pageContent.metadataDescription, 'en')
      : truncateDescription(getLocalizedText(city.intro, 'en')),
    keywords: getLocalizedKeywords(city.keywords, 'en').join(', ') + ', StayOnSite',
    canonical: en,
    hreflangs: [
      { lang: 'sv', href: sv },
      { lang: 'en', href: en },
      { lang: 'pl', href: pl },
      { lang: 'x-default', href: sv },
    ],
    locale: 'en',
    ogImage: cityListingsOgImage(listings),
  })
}

export default async function Page({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) notFound()
  const listings = await getCityListingsCached(city.name, city.listingLocalities)
  return <CityPage citySlug={citySlug} locale="en" city={city} nearbyCities={getNearbyCitySummaries(citySlug)} listings={listings} />
}
