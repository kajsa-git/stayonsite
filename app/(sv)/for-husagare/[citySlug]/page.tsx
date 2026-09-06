import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { cities, getCityBySlug } from '@/data/cities'
import HomeownerCityPage from '@/views/HomeownerCityPage'

export function generateStaticParams() {
  return cities.map((city) => ({ citySlug: city.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string }>
}): Promise<Metadata> {
  const { citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) return {}

  const topIndustries = city.industries.slice(0, 3).join(', ')

  return buildMetadata({
    title: `Hyr ut din bostad i ${city.name} till företag | StayOnSite`,
    description: `Hyr ut din bostad i ${city.name} till företag som söker boende för medarbetare inom ${topIndustries}. Se hur matchning, avtal och betalning fungerar.`,
    canonical: `https://www.stayonsite.se/for-husagare/${city.slug}`,
    hreflangs: [
      { lang: 'sv', href: `https://www.stayonsite.se/for-husagare/${city.slug}` },
      { lang: 'x-default', href: `https://www.stayonsite.se/for-husagare/${city.slug}` },
    ],
    locale: 'sv',
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ citySlug: string }>
}) {
  const { citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) notFound()
  return <HomeownerCityPage citySlug={citySlug} locale="sv" />
}
