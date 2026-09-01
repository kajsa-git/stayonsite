import { buildMetadata } from '@/lib/metadata'
import Press from '@/views/Press'

export const metadata = buildMetadata({
  title: 'Press och media - StayOnSite AB',
  description: 'Pressinformation, bolagsfakta och kontaktuppgifter för StayOnSite AB, specialist på personalboende och företagsbostäder i Sverige.',
  canonical: 'https://www.stayonsite.se/press',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/press' },
  ],
  locale: 'sv',
})

export default function Page() {
  return <Press />
}
