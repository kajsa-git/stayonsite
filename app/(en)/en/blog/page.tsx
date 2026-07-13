import { buildMetadata } from '@/lib/metadata'
import BlogIndex from '@/views/blogg/BlogIndex'

export const metadata = buildMetadata({
  title: 'Blog — Worker Accommodation & Corporate Housing | StayOnSite',
  description: 'Guides in English on worker accommodation, corporate housing, Swedish rental rules and housing for foreign construction crews in Sweden.',
  canonical: 'https://www.stayonsite.se/en/blog',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/blogg' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/blog' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/blogg' },
  ],
  locale: 'en',
})

export default function Page() {
  return <BlogIndex />
}
