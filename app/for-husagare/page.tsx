import { buildMetadata } from '@/lib/metadata'
import ForHusagare from '@/views/ForHusagare'

export const metadata = buildMetadata({
  title: 'Hyr ut till foretag - 10 000-30 000 kr/man | Garanterad hyra | StayOnSite',
  description: 'Hyr ut din bostad till foretagshyresgaster och tjana 10 000-30 000 kr/man i garanterad hyra. Inga avdrag, betalning i forskott, 1 manads uppsagningstid. 100+ nojda husagare.',
  canonical: 'https://www.stayonsite.se/for-husagare',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/for-husagare' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <ForHusagare />
}
