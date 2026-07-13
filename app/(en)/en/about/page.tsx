import { buildMetadata } from '@/lib/metadata'
import OmOss from '@/views/OmOss'

export const metadata = buildMetadata({
  title: 'About StayOnSite - Worker Accommodation & Corporate Housing in Sweden',
  description: 'StayOnSite arranges furnished housing for construction companies, industrial firms and installation crews across Sweden. Founded 2016, local presence in 30+ cities.',
  canonical: 'https://www.stayonsite.se/en/about',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/om-oss' },
    { lang: 'en', href: 'https://www.stayonsite.se/en/about' },
    { lang: 'x-default', href: 'https://www.stayonsite.se/om-oss' },
  ],
  locale: 'en',
})

export default function Page() {
  return <OmOss />
}
