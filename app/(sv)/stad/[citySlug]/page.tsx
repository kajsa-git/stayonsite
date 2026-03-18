import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { cities } from '@/data/cities'
import { getLocalizedText, getLocalizedKeywords } from '@/lib/utils'
import CityPage from '@/views/CityPage'

export function generateStaticParams() {
  return cities.map((city) => ({ citySlug: city.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> {
  const { citySlug } = await params
  const city = cities.find((c) => c.slug === citySlug)
  if (!city) return {}

  const sv = `https://www.stayonsite.se/stad/${city.slug}`
  const en = `https://www.stayonsite.se/en/corporate-housing/${city.slug}`
  const pl = `https://www.stayonsite.se/pl/zakwaterowanie/${city.slug}`

  return buildMetadata({
    title: `Personalboende & Lägenhetshotell ${city.name} | StayOnSite`,
    description: getLocalizedText(city.intro, 'sv'),
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
  return <CityPage citySlug={citySlug} locale="sv" />
}
