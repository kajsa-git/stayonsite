import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { blogPosts, getBlogPost } from '@/data/blog-posts'

import PersonalboendGuide2026 from '@/views/blogg/PersonalboendGuide2026'
import PrivatuthyrningslagenReform2026 from '@/views/blogg/PrivatuthyrningslagenReform2026'
import GronOmstallningBoende from '@/views/blogg/GronOmstallningBoende'
import InfrastrukturBoendeKarta2026 from '@/views/blogg/InfrastrukturBoendeKarta2026'
import ForsakringPersonalboendeGuide2026 from '@/views/blogg/ForsakringPersonalboendeGuide2026'
import AvtalskravPersonalboendeGuide2026 from '@/views/blogg/AvtalskravPersonalboendeGuide2026'
import ArbetstillstandJuni2026Guide from '@/views/blogg/ArbetstillstandJuni2026Guide'
import DatacenterMontorboendeGuide2026 from '@/views/blogg/DatacenterMontorboendeGuide2026'
import RegionalBostadsanalys2026 from '@/views/blogg/RegionalBostadsanalys2026'
import InfrastrukturKontraktPersonalBoendeChecklista2026 from '@/views/blogg/InfrastrukturKontraktPersonalBoendeChecklista2026'
import KompetensRekryteringByggsektornGuide2026 from '@/views/blogg/KompetensRekryteringByggsektornGuide2026'
import BlockhyraForetagsbostaderRegler2026 from '@/views/blogg/BlockhyraForetagsbostaderRegler2026'

const componentMap: Record<string, React.ComponentType> = {
  'personalboende-guide-2026': PersonalboendGuide2026,
  'privatuthyrningslagen-reform-2026': PrivatuthyrningslagenReform2026,
  'gron-omstallning-norr-boende': GronOmstallningBoende,
  'infrastruktur-personalboende-karta-2026': InfrastrukturBoendeKarta2026,
  'forsakring-ansvar-personalboende-guide-2026': ForsakringPersonalboendeGuide2026,
  'avtalskrav-personalboende-guide-2026': AvtalskravPersonalboendeGuide2026,
  'arbetskraftsinvandring-juni-2026-guide-byggforetag': ArbetstillstandJuni2026Guide,
  'datacenter-montorboende-guide-2026': DatacenterMontorboendeGuide2026,
  'regional-bostadsanalys-2026-var-finns-boende-montorer': RegionalBostadsanalys2026,  'infrastrukturkontrakt-personalboende-checklista-2026': InfrastrukturKontraktPersonalBoendeChecklista2026,  'kompetens-rekrytering-byggsektorn-guide-2026': KompetensRekryteringByggsektornGuide2026,  'blockhyra-foretagsbostader-nya-regler-juli-2026': BlockhyraForetagsbostaderRegler2026,
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  const articleUrl = `https://www.stayonsite.se/blogg/${post.slug}`
  return buildMetadata({
    title: `${post.title.sv} | StayOnSite`,
    description: post.description.sv,
    canonical: articleUrl,
    type: 'article',
    articlePublishedTime: `${post.publishedDate}T00:00:00Z`,
    articleModifiedTime: `${post.publishedDate}T00:00:00Z`,
    articleAuthor: 'https://www.stayonsite.se',
    articleSection: post.category,
    articleTags: post.tags,
    hreflangs: [
      { lang: 'sv', href: articleUrl },
      { lang: 'x-default', href: articleUrl },
    ],
    locale: 'sv',
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const Component = componentMap[slug]
  if (!Component) notFound()
  return <Component />
}
