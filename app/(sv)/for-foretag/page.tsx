import { buildMetadata } from '@/lib/metadata'
import ForForetag from '@/views/ForForetag'

export const metadata = buildMetadata({
  title: 'Företagsbostäder & personalboende för projekt i Sverige | StayOnSite',
  description: 'Företagsbostäder och personalboende för bygg, industri och montage i Sverige. Skicka projektbrief med ort, bemanning, datum och krav för jämförbar offert.',
  canonical: 'https://www.stayonsite.se/for-foretag',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/for-foretag' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/for-foretag' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <ForForetag />
}
