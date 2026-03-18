import { buildMetadata } from '@/lib/metadata'
import BlogIndex from '@/views/blogg/BlogIndex'

export const metadata = buildMetadata({
  title: 'Blogg - Personalboende & Företagsbostäder | StayOnSite',
  description: 'Artiklar om personalboende, företagsbostäder, nya lagar och marknadstrender i Sverige.',
  canonical: 'https://www.stayonsite.se/blogg',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/blogg' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <BlogIndex />
}
