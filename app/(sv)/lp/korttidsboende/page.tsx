import { buildMetadata } from '@/lib/metadata'
import LpKorttidsboende from '@/views/lp/LpKorttidsboende'

export const metadata = buildMetadata({
  title: 'Möblerat korttidsboende i hela Sverige | StayOnSite',
  description:
    'Möblerade lägenheter för företag och yrkesverksamma från tre månader. El, wifi och möbler ingår. Få ett konkret boendeförslag inom 24 timmar.',
  canonical: 'https://www.stayonsite.se/lp/korttidsboende',
  noindex: true,
  locale: 'sv',
})

export default function Page() {
  return <LpKorttidsboende />
}
