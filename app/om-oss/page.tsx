import { buildMetadata } from '@/lib/metadata'
import OmOss from '@/views/OmOss'

export const metadata = buildMetadata({
  title: 'Om StayOnSite - Personalboende & Foretagsbostader i Sverige',
  description: 'StayOnSite hjalper byggbolag och industriforetag att hitta moblerade boenden i hela Sverige. Kontakta oss for personalboende, montorboende och foretagslagenheter.',
  canonical: 'https://www.stayonsite.se/om-oss',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/om-oss' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <OmOss />
}
