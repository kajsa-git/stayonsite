import { buildMetadata } from '@/lib/metadata'
import LpCorporateHousing from '@/views/lp/LpCorporateHousing'

export const metadata = buildMetadata({
  title: 'Corporate Housing in Sweden for Your Workforce | StayOnSite',
  description: 'Furnished, move-in ready corporate housing for your staff and site workers across Sweden. One contact, one invoice. Get a quote within 24 hours.',
  canonical: 'https://www.stayonsite.se/lp/corporate-housing',
  noindex: true,
  locale: 'en',
})

export default function Page() {
  return <LpCorporateHousing />
}
