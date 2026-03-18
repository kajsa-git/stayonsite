import { buildMetadata } from '@/lib/metadata'
import OmOss from '@/views/OmOss'

export const metadata = buildMetadata({
  title: 'Om StayOnSite - Personalboende & Företagsbostäder i Sverige',
  description: 'StayOnSite hjälper byggbolag och industriföretag att hitta möblerade boenden i hela Sverige. Kontakta oss för personalboende, montörboende och företagslägenheter.',
  canonical: 'https://www.stayonsite.se/om-oss',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/om-oss' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <OmOss />
}
