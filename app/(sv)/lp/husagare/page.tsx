import { buildMetadata } from '@/lib/metadata'
import LpHusagare from '@/views/lp/LpHusagare'

export const metadata = buildMetadata({
  title: 'Tjäna 10 000-30 000 kr/mån på ditt boende | StayOnSite',
  description: 'Vi hyr din bostad till en fast månadshyra - du får betalt utan avdrag. Få en gratis intäktsbedömning inom 24 timmar.',
  noindex: true,
  locale: 'sv',
})

export default function Page() {
  return <LpHusagare />
}
