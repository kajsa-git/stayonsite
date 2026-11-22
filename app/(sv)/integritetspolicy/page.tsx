import { buildMetadata } from '@/lib/metadata'
import Integritetspolicy from '@/views/Integritetspolicy'

export const metadata = buildMetadata({
  title: 'Integritetspolicy | StayOnSite',
  description: 'Så hanterar StayOnSite AB personuppgifter från förfrågningar, bostadsregistreringar och besök på stayonsite.se.',
  canonical: 'https://www.stayonsite.se/integritetspolicy',
  hreflangs: [{ lang: 'sv', href: 'https://www.stayonsite.se/integritetspolicy' }],
  locale: 'sv',
})

export default function Page() {
  return <Integritetspolicy />
}
