import { buildMetadata } from '@/lib/metadata'
import LpKorttidsboende from '@/views/lp/LpKorttidsboende'

export const metadata = buildMetadata({
  title: 'Möblerat personalboende för projekt | StayOnSite',
  description:
    'Möblerade hus och lägenheter för företag och projekt i hela Sverige, från tre månader till flera år. Skicka en förfrågan till StayOnSite.',
  canonical: 'https://www.stayonsite.se/lp/korttidsboende',
  noindex: true,
  locale: 'sv',
})

export default function Page() {
  return <LpKorttidsboende />
}
