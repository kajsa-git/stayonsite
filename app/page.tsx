import { buildMetadata } from '@/lib/metadata'
import Index from '@/views/Index'

export const metadata = buildMetadata({
  canonical: 'https://www.stayonsite.se/',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
    { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Index />
}
