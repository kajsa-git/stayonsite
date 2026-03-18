import { buildMetadata } from '@/lib/metadata'
import Kontakt from '@/views/Kontakt'

export const metadata = buildMetadata({
  title: 'Kontakta StayOnSite - Personalboende & Företagsbostäder | Svar inom 3h',
  description: 'Kontakta StayOnSite för personalboende och företagsbostäder i hela Sverige. Ring, mejla eller fyll i formuläret - vi svarar inom 3 timmar på vardagar.',
  canonical: 'https://www.stayonsite.se/kontakt',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/kontakt' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Kontakt />
}
