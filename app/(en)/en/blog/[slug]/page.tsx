import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { blogPosts, getBlogPostByEnSlug } from '@/data/blog-posts'

import PersonalboendeVsHotellKostnad2026En from '@/views/blogg/en/PersonalboendeVsHotellKostnad2026En'
import PersonalboendeVanligaFragor2026En from '@/views/blogg/en/PersonalboendeVanligaFragor2026En'
import BoendeUtlandskaArbetareByggGuide2026En from '@/views/blogg/en/BoendeUtlandskaArbetareByggGuide2026En'
import ForetagsbostaderNyaReglerJuli2026GuideEn from '@/views/blogg/en/ForetagsbostaderNyaReglerJuli2026GuideEn'

const componentMap: Record<string, React.ComponentType> = {
  'worker-accommodation-vs-hotel-cost-comparison': PersonalboendeVsHotellKostnad2026En,
  'worker-accommodation-sweden-faq': PersonalboendeVanligaFragor2026En,
  'housing-foreign-construction-workers-sweden-2026': BoendeUtlandskaArbetareByggGuide2026En,
  'corporate-housing-sweden-new-rules-july-2026': ForetagsbostaderNyaReglerJuli2026GuideEn,
}

export function generateStaticParams() {
  return blogPosts.filter((p) => p.en).map((p) => ({ slug: p.en!.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostByEnSlug(slug)
  if (!post) return {}

  const enUrl = `https://www.stayonsite.se/en/blog/${slug}`
  const svUrl = `https://www.stayonsite.se/blogg/${post.slug}`
  return buildMetadata({
    title: `${post.title.en} | StayOnSite`,
    description: post.description.en,
    canonical: enUrl,
    type: 'article',
    articlePublishedTime: `${post.publishedDate}T00:00:00Z`,
    articleModifiedTime: `${post.updatedDate || post.publishedDate}T00:00:00Z`,
    articleAuthor: 'https://www.stayonsite.se/om-oss#kajsa-sihlen',
    articleSection: post.category,
    articleTags: post.tags,
    hreflangs: [
      { lang: 'sv', href: svUrl },
      { lang: 'en', href: enUrl },
      { lang: 'x-default', href: svUrl },
    ],
    locale: 'en',
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const Component = componentMap[slug]
  if (!Component) notFound()
  return <Component />
}
