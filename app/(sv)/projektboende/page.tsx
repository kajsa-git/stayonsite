import { buildMetadata } from '@/lib/metadata'
import Projektboende from '@/views/Projektboende'

export const metadata = buildMetadata({
  title: 'Projektboende för bygg, industri och montage | StayOnSite',
  description: 'Projektboende för arbetslag i Sverige. Planera boende per ort, fas, antal personer, sökradie, parkering, rotation, kostnad och risk.',
  canonical: 'https://www.stayonsite.se/projektboende',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/projektboende' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/projektboende' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Projektboende />
}
