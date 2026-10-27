import { buildMetadata } from '@/lib/metadata'
import BlogIndex from '@/views/blogg/BlogIndex'

export const metadata = buildMetadata({
  title: 'Guider om personalboende & uthyrning till företag | StayOnSite',
  description: 'Guider om datacenterboende, projektboende, kostnader och uthyrning till företag. Praktiska checklistor för arbetslag och husägare i Sverige.',
  canonical: 'https://www.stayonsite.se/blogg',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/blogg' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/blog' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/blogg' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <BlogIndex />
}
