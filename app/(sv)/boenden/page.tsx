import { buildMetadata } from '@/lib/metadata'
import { getPublicListingLinks } from '@/lib/crm/public-listing-links'
import { Boenden } from '@/views/Boenden'

// The link directory is rendered from live published inventory so every detail
// page has a normal internal link even when it falls beyond client pagination.
export const dynamic = 'force-dynamic'

export const metadata = buildMetadata({
  title: 'Lediga boenden | StayOnSite',
  description: 'Se våra tillgängliga personalboenden i Sverige. Möblerade hus och lägenheter för projektarbetare och företag. Kontakta oss för mer information.',
  canonical: 'https://www.stayonsite.se/boenden',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/boenden' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/boenden' },
  ],
  locale: 'sv',
})

export default async function Page() {
  const listingLinks = await getPublicListingLinks()
  return <Boenden listingLinks={listingLinks} />
}
