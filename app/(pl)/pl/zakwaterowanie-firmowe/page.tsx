import { buildMetadata } from '@/lib/metadata'
import Index from '@/views/Index'

export const metadata = buildMetadata({
  title: 'Zakwaterowanie dla personelu i mieszkania służbowe w Szwecji | StayOnSite',
  description: 'Szybko i sprawnie organizujemy zakwaterowanie dla firm i ich personelu w całej Szwecji. Długoterminowe i elastyczne rozwiązania wynajmu.',
  canonical: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
    { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/' },
  ],
  locale: 'pl',
})

export default function Page() {
  return <Index />
}
