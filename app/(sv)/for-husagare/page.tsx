import { buildMetadata } from '@/lib/metadata'
import ForHusagare from '@/views/ForHusagare'

export const metadata = buildMetadata({
  title: 'Hyr ut till företag - 10 000-30 000 kr/mån utan avdrag | StayOnSite',
  description: 'Hyr ut din bostad till företagshyresgäster och tjäna 10 000-30 000 kr/mån. Fast månadshyra utan avdrag, betalning i förskott. Vi sköter kontraktet - du får pengarna på kontot.',
  canonical: 'https://www.stayonsite.se/for-husagare',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/for-husagare' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <ForHusagare />
}
