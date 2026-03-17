import { buildMetadata } from '@/lib/metadata'
import ForForetag from '@/views/ForForetag'

export const metadata = buildMetadata({
  title: 'Personalboende for foretag - Boende for alla era projekt i Sverige | StayOnSite',
  description: 'StayOnSite ordnar personalboende for byggbolag och industriforetag i 40+ stader. Moblerade lagenheter, foretagsfaktura, fast kontaktperson. Boendeplan inom 24h.',
  canonical: 'https://www.stayonsite.se/for-foretag',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/for-foretag' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
    { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/for-foretag' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <ForForetag />
}
