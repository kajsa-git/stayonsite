import type { Metadata } from 'next'

interface BuildMetadataProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
  type?: 'website' | 'article'
  hreflangs?: Array<{ lang: string; href: string }>
  noindex?: boolean
  locale?: 'sv' | 'en' | 'pl'
  articlePublishedTime?: string
  articleModifiedTime?: string
  articleAuthor?: string
  articleSection?: string
  articleTags?: string[]
}

const defaultContent = {
  sv: {
    title: 'Personalboende & Företagsbostäder i Sverige | StayOnSite',
    description: 'StayOnSite hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare. Över 10 års erfarenhet. Boenden i hela Sverige. Kontakta oss idag!',
    keywords: 'boende byggarbetare, företagsbostäder, personalboende, byggboende, montörboende, arbetarboende, longstay, shortstay, stayonsite',
  },
  en: {
    title: 'StayOnSite - Accommodation for Construction Workers | Corporate Housing Sweden',
    description: 'StayOnSite helps construction companies quickly find accommodation in other locations for their workers. Over 10 years of experience. Housing throughout Sweden.',
    keywords: 'construction worker accommodation, corporate housing, staff accommodation, construction housing, worker housing, longstay, shortstay, stayonsite',
  },
  pl: {
    title: 'StayOnSite - Zakwaterowanie dla pracowników budowlanych | Mieszkania służbowe Szwecja',
    description: 'StayOnSite pomaga firmom budowlanym szybko znaleźć zakwaterowanie w innych lokalizacjach dla ich pracowników. Ponad 10 lat doświadczenia.',
    keywords: 'zakwaterowanie pracowników budowlanych, mieszkania służbowe, zakwaterowanie personelu, stayonsite',
  },
}

const localeMap: Record<string, string> = {
  sv: 'sv_SE',
  en: 'en_US',
  pl: 'pl_PL',
}

export function buildMetadata(props: BuildMetadataProps): Metadata {
  const lang = props.locale || 'sv'
  const defaults = defaultContent[lang]

  const title = props.title || defaults.title
  const description = props.description || defaults.description
  const keywords = props.keywords || defaults.keywords
  const ogImage = props.ogImage || 'https://www.stayonsite.se/images/og-image.jpg'
  const canonical = props.canonical

  const alternates: Metadata['alternates'] = {}
  if (canonical) {
    alternates.canonical = canonical
  }
  if (props.hreflangs && props.hreflangs.length > 0) {
    const languages: Record<string, string> = {}
    for (const { lang: hrefLang, href } of props.hreflangs) {
      languages[hrefLang] = href
    }
    if (!languages['x-default']) {
      const svHref = props.hreflangs.find(h => h.lang === 'sv')?.href
      if (svHref) languages['x-default'] = svHref
    }
    alternates.languages = languages
  }

  const openGraph: Metadata['openGraph'] = {
    title,
    description,
    type: props.type === 'article' ? 'article' : 'website',
    images: [ogImage],
    url: canonical,
    locale: localeMap[lang] || 'sv_SE',
    siteName: 'StayOnSite',
  }

  if (props.type === 'article') {
    (openGraph as any).publishedTime = props.articlePublishedTime;
    (openGraph as any).modifiedTime = props.articleModifiedTime;
    (openGraph as any).authors = props.articleAuthor ? [props.articleAuthor] : undefined;
    (openGraph as any).section = props.articleSection;
    (openGraph as any).tags = props.articleTags;
  }

  return {
    title,
    description,
    keywords,
    alternates,
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: props.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1, 'max-video-preview': -1 },
  }
}
