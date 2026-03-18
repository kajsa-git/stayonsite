import { buildMetadata } from '@/lib/metadata'
import ForForetag from '@/views/ForForetag'

export const metadata = buildMetadata({
  title: 'Personalboende för företag i hela Sverige | StayOnSite',
  description: 'StayOnSite ordnar personalboende för byggbolag och industriföretag i 40+ städer. Möblerade lägenheter, företagsfaktura, fast kontaktperson. Boendeplan inom 24h.',
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
