import { buildMetadata } from '@/lib/metadata'
import { Boenden } from '@/views/Boenden'

export const metadata = buildMetadata({
  title: 'Lediga boenden | StayOnSite',
  description: 'Se våra tillgängliga personalboenden i Sverige. Möblerade hus och lägenheter för projektarbetare och företag. Kontakta oss för mer information.',
  canonical: 'https://www.stayonsite.se/boenden',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/boenden' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/boenden' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Boenden />
}
