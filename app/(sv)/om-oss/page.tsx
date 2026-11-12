import { buildMetadata } from '@/lib/metadata'
import OmOss from '@/views/OmOss'

export const metadata = buildMetadata({
  title: 'Om StayOnSite – företaget bakom boendena sedan 2016',
  description: 'StayOnSite hjälper byggbolag och industriföretag att hitta möblerade boenden i hela Sverige. Personalboende, montörboende och företagslägenheter.',
  canonical: 'https://www.stayonsite.se/om-oss',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/om-oss' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/about' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/om-oss' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <OmOss />
}
