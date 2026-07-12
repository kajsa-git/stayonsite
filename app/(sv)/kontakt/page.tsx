import { buildMetadata } from '@/lib/metadata'
import Kontakt from '@/views/Kontakt'

export const metadata = buildMetadata({
  title: 'Kontakta StayOnSite - Företagsbostäder | Svar inom en arbetsdag',
  description: 'Kontakta StayOnSite för personalboende och företagsbostäder i hela Sverige. Ring, mejla eller fyll i formuläret - vi återkommer alltid inom en arbetsdag – ofta inom några timmar.',
  canonical: 'https://www.stayonsite.se/kontakt',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/kontakt' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Kontakt />
}
