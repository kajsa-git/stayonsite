import { buildMetadata } from '@/lib/metadata'
import Kontakt from '@/views/Kontakt'

export const metadata = buildMetadata({
  title: 'Kontakta StayOnSite - Personalboende & Foretagsbostader | Svar inom 3h',
  description: 'Kontakta StayOnSite for personalboende och foretagsbostader i hela Sverige. Ring, mejla eller fyll i formularet - vi svarar inom 3 timmar pa vardagar.',
  canonical: 'https://www.stayonsite.se/kontakt',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/kontakt' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Kontakt />
}
