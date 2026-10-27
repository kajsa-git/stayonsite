import { buildMetadata } from '@/lib/metadata'
import Index from '@/views/Index'

export const metadata = buildMetadata({
  title: 'Staff Housing & Corporate Apartments in Sweden | StayOnSite',
  description: 'Furnished worker accommodation for construction, energy and data centre teams across Sweden. Enquire about locations, dates and your team’s needs.',
  canonical: 'https://www.stayonsite.se/en/corporate-housing-sweden',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
    { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/' },
  ],
  locale: 'en',
})

export default function Page() {
  return <Index />
}
