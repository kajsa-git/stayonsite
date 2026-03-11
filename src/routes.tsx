import type { RouteRecord } from 'vite-react-ssg'
import { cities } from './data/cities'
import App from './App'
import Index from './pages/Index'
import CityPage from './pages/CityPage'
import ForHusagare from './pages/ForHusagare'
import LpHusagare from './pages/lp/LpHusagare'
import ForForetag from './pages/ForForetag'
import OmOss from './pages/OmOss'
import Kontakt from './pages/Kontakt'
import BlogIndex from './pages/blogg/BlogIndex'
import PersonalboendGuide2026 from './pages/blogg/PersonalboendGuide2026'
import PrivatuthyrningslagenReform2026 from './pages/blogg/PrivatuthyrningslagenReform2026'
import GronOmstallningBoende from './pages/blogg/GronOmstallningBoende'
import InfrastrukturBoendeKarta2026 from './pages/blogg/InfrastrukturBoendeKarta2026'
import ForsakringPersonalboendeGuide2026 from './pages/blogg/ForsakringPersonalboendeGuide2026'
import AvtalskravPersonalboendeGuide2026 from './pages/blogg/AvtalskravPersonalboendeGuide2026'
import ArbetstillstandJuni2026Guide from './pages/blogg/ArbetstillstandJuni2026Guide'
import DatacenterMontorboendeGuide2026 from './pages/blogg/DatacenterMontorboendeGuide2026'
import RegionalBostadsanalys2026 from './pages/blogg/RegionalBostadsanalys2026'
import NotFound from './pages/NotFound'

const citySlugs = cities.map((c) => c.slug)

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Index /> },
      {
        path: 'stad/:citySlug',
        element: <CityPage />,
        getStaticPaths: () => citySlugs.map((s) => `/stad/${s}`),
      },
      {
        path: 'en/corporate-housing/:citySlug',
        element: <CityPage />,
        getStaticPaths: () =>
          citySlugs.map((s) => `/en/corporate-housing/${s}`),
      },
      {
        path: 'pl/zakwaterowanie/:citySlug',
        element: <CityPage />,
        getStaticPaths: () =>
          citySlugs.map((s) => `/pl/zakwaterowanie/${s}`),
      },
      { path: 'for-husagare', element: <ForHusagare /> },
      { path: 'for-foretag', element: <ForForetag /> },
      { path: 'en/corporate-housing-sweden', element: <Index /> },
      { path: 'pl/zakwaterowanie-firmowe', element: <Index /> },
      { path: 'om-oss', element: <OmOss /> },
      { path: 'kontakt', element: <Kontakt /> },
      { path: 'blogg', element: <BlogIndex /> },
      { path: 'blogg/personalboende-guide-2026', element: <PersonalboendGuide2026 /> },
      { path: 'blogg/privatuthyrningslagen-reform-2026', element: <PrivatuthyrningslagenReform2026 /> },
      { path: 'blogg/gron-omstallning-norr-boende', element: <GronOmstallningBoende /> },
      { path: 'blogg/infrastruktur-personalboende-karta-2026', element: <InfrastrukturBoendeKarta2026 /> },
      { path: 'blogg/forsakring-ansvar-personalboende-guide-2026', element: <ForsakringPersonalboendeGuide2026 /> },
      { path: 'blogg/avtalskrav-personalboende-guide-2026', element: <AvtalskravPersonalboendeGuide2026 /> },
      { path: 'blogg/arbetskraftsinvandring-juni-2026-guide-byggforetag', element: <ArbetstillstandJuni2026Guide /> },
      { path: 'blogg/datacenter-montorboende-guide-2026', element: <DatacenterMontorboendeGuide2026 /> },
      { path: 'blogg/regional-bostadsanalys-2026-var-finns-boende-montorer', element: <RegionalBostadsanalys2026 /> },
      { path: 'lp/husagare', element: <LpHusagare /> },
      {
        path: '404',
        element: <NotFound />,
        getStaticPaths: () => ['/404'],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]
