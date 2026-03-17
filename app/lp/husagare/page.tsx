import { buildMetadata } from '@/lib/metadata'
import LpHusagare from '@/views/lp/LpHusagare'

export const metadata = buildMetadata({
  title: 'Tjana 10 000-30 000 kr/man pa ditt boende | StayOnSite',
  description: 'Vi hyr din bostad till en fast manadshyra - du far betalt utan avdrag. Fa en gratis intaktsbedamning inom 24 timmar.',
  noindex: true,
  locale: 'sv',
})

export default function Page() {
  return <LpHusagare />
}
