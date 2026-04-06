import type { MetadataRoute } from 'next'
import { cities } from '@/data/cities'
import { blogPosts } from '@/data/blog-posts'

export const dynamic = 'force-static'

const BASE = 'https://www.stayonsite.se'

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split('T')[0]

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE}/for-husagare`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE}/for-foretag`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE}/om-oss`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/kontakt`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/en/corporate-housing-sweden`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/pl/zakwaterowanie-firmowe`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/blogg`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `${BASE}/blogg/${post.slug}`,
      lastModified: post.publishedDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  const cityPages: MetadataRoute.Sitemap = cities.flatMap((city) => {
    const sv = `${BASE}/stad/${city.slug}`
    const en = `${BASE}/en/corporate-housing/${city.slug}`
    const pl = `${BASE}/pl/zakwaterowanie/${city.slug}`

    return [
      {
        url: sv,
        lastModified: today,
        changeFrequency: 'monthly' as const,
        priority: 0.9,
        alternates: {
          languages: { sv, en, pl },
        },
      },
      {
        url: en,
        lastModified: today,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: {
          languages: { sv, en, pl },
        },
      },
      {
        url: pl,
        lastModified: today,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: {
          languages: { sv, en, pl },
        },
      },
    ]
  })

  const homeownerCityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE}/for-husagare/${city.slug}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...blogPages, ...cityPages, ...homeownerCityPages]
}
