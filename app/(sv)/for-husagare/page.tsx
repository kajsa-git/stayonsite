import { buildMetadata } from '@/lib/metadata'
import ForHusagare from '@/views/ForHusagare'

export const metadata = buildMetadata({
  title: 'Hyr ut till företag – 10 000–30 000 kr/mån | StayOnSite',
  description: 'Hyr ut din bostad till företag och tjäna 10 000–30 000 kr/mån. Fast månadshyra utan avdrag. Betalning i förskott – vi sköter kontraktet.',
  canonical: 'https://www.stayonsite.se/for-husagare',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/for-husagare' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
    { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <ForHusagare />
}
