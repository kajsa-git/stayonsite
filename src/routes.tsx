import type { RouteRecord } from 'vite-react-ssg'
import { cities } from './data/cities'
import App from './App'
import Index from './pages/Index'
import CityPage from './pages/CityPage'
import ForHusagare from './pages/ForHusagare'
import CorporateHousingSweden from './pages/en/CorporateHousingSweden'
import ZakwaterowanieFirmowe from './pages/pl/ZakwaterowanieFirmowe'
import LpHusagare from './pages/lp/LpHusagare'
import OmOss from './pages/OmOss'
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
      { path: 'en/corporate-housing-sweden', element: <CorporateHousingSweden /> },
      { path: 'pl/zakwaterowanie-firmowe', element: <ZakwaterowanieFirmowe /> },
      { path: 'om-oss', element: <OmOss /> },
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
