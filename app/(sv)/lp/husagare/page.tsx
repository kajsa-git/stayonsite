import { buildMetadata } from '@/lib/metadata'
import LpHusagare from '@/views/lp/LpHusagare'

export const metadata = buildMetadata({
  title: 'Hyr ut din bostad till företag | StayOnSite',
  description: 'Registrera din villa, ditt radhus, din ägarlägenhet eller uthyrningsdel. StayOnSite matchar bostaden med företag som söker boende.',
  canonical: 'https://www.stayonsite.se/lp/husagare',
  noindex: true,
  locale: 'sv',
})

export default function Page() {
  return <LpHusagare />
}
