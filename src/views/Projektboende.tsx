'use client'

import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Car,
  CircleAlert,
  MapPinned,
  Route,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import MobileStickyFormCTA from '@/components/MobileStickyFormCTA';
import ProjectBriefForm from '@/components/ProjectBriefForm';
import SEO from '@/components/SEO';
import { COMPANY_FACTS } from '@/data/constants';

const timeline = [
  {
    title: 'Förfrågan',
    text: 'Projektbriefen beskriver ort, arbetsplats, antal personer, datum, pendlingsgräns, parkering och rumsmodell.',
  },
  {
    title: 'Alternativ',
    text: 'Boenden söks i rätt radie och bedöms mot restid, bäddar, parkering, service och möjlighet att skala upp eller ned.',
  },
  {
    title: 'Avtal',
    text: 'Kund, bostadsägare och StayOnSite behöver en gemensam bild av pris, ansvar, skador, fakturering och uppsägning.',
  },
  {
    title: 'Inflyttning',
    text: 'Nycklar, inventarier, städning, internet, kontaktvägar och felanmälan stäms av innan arbetslaget anländer.',
  },
];

const capacityBands = [
  {
    band: '10-50 personer',
    use: 'Vanligt projektboende där flera lägenheter eller hus kan räcka.',
    planning: 'Fokusera på restid, parkering, enkelrum kontra delade rum och hur snabbt bemanningen ändras.',
  },
  {
    band: '50-100 personer',
    use: 'Kräver ofta flera adresser, fasplanering och tydlig ansvarsfördelning.',
    planning: 'Dela upp boende per arbetslag, skift, fordon och projektfas så administrationen inte växer okontrollerat.',
  },
  {
    band: '100+ personer',
    use: 'StayOnSite kan vara del av lösningen, särskilt som overflow eller för nyckelroller.',
    planning: 'Jämför med modulboende, hotellblock och andra etableringar. Planera fallback och pendlingsradier tidigt.',
  },
];

const radiusRows = [
  ['30 minuter', 'När teamet har långa pass, tung utrustning eller behöver snabb åtkomst till arbetsplatsen.'],
  ['60 minuter', 'När orten har begränsat bostadsutbud men daglig pendling fortfarande är praktisk.'],
  ['90 minuter', 'När projektet är svårt att bemanna lokalt och alternativa orter behövs som riskplan.'],
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${COMPANY_FACTS.url}/projektboende#service`,
    name: 'Projektboende för bygg, industri och montage',
    description:
      'Projektboende för arbetslag i Sverige med boendeplan, kapacitetsplan, sökradie, rotation, parkering och riskplan per projektfas.',
    provider: {
      '@type': 'Organization',
      '@id': `${COMPANY_FACTS.url}/#organization`,
      name: COMPANY_FACTS.name,
      legalName: COMPANY_FACTS.legalName,
      url: COMPANY_FACTS.url,
      telephone: COMPANY_FACTS.phoneDisplay,
      email: COMPANY_FACTS.email,
      logo: COMPANY_FACTS.logoUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sweden',
    },
    serviceType: ['Projektboende', 'Personalboende', 'Företagsbostäder'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hem',
        item: `${COMPANY_FACTS.url}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'För företag',
        item: `${COMPANY_FACTS.url}/for-foretag`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Projektboende',
        item: `${COMPANY_FACTS.url}/projektboende`,
      },
    ],
  },
];

export default function Projektboende() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO structuredData={structuredData} />
      <Header />
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-nordic-900 pt-32 pb-16 text-white md:pt-36 md:pb-20">
          <div className="absolute inset-0">
            <img
              src="/images/solar-park-saffle-1200.webp"
              alt="Projektboende för arbetslag vid energiprojekt i Sverige"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-nordic-900 via-nordic-900/85 to-nordic-900/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-nordic-900 via-transparent to-transparent" />
          </div>

          <div className="container relative mx-auto px-6 md:px-12">
            <nav className="mb-10 text-sm text-white/65" aria-label="Brödsmulor">
              <Link href="/" className="hover:text-white">
                Hem
              </Link>
              <span className="mx-2">/</span>
              <Link href="/for-foretag" className="hover:text-white">
                För företag
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">Projektboende</span>
            </nav>

            <div className="max-w-4xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-white/60">
                Boendeplan · kapacitet · riskplan
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Projektboende för arbetslag i hela Sverige
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/78 md:text-xl">
                När ett bygg-, industri- eller montageprojekt bemannas i faser behövs mer
                än en ledig lägenhet. Projektboendet ska bära tidsplan, restid, rotation,
                fordon och risk om utbudet ändras.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#projektbrief"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff6300] px-6 font-semibold text-white transition hover:bg-[#e25200]"
                >
                  Skicka projektbrief
                </a>
                <Link
                  href="/for-foretag"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 font-semibold text-white transition hover:bg-white/15"
                >
                  Se kategorisidan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-nordic-100 bg-white py-14">
          <div className="container mx-auto grid gap-5 px-6 md:grid-cols-4 md:px-12">
            {[
              {
                icon: MapPinned,
                title: 'En eller flera orter',
                text: 'Samordna boendeplanen över en arbetsplats, en region eller flera parallella projektorter.',
              },
              {
                icon: Users,
                title: 'Faser och bemanning',
                text: 'Planera 10-50, 50-100 eller 100+ personer med upp- och nedtrappning.',
              },
              {
                icon: Route,
                title: '30/60/90 minuter',
                text: 'Välj sökradie efter skift, vägstandard, fordon, parkering och lokal tillgång.',
              },
              {
                icon: CircleAlert,
                title: 'Riskplan',
                text: 'Definiera fallback om ett boende faller bort eller teamets storlek ändras.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-nordic-100 bg-nordic-50 p-5">
                  <Icon className="h-6 w-6 text-[#ff6300]" />
                  <h2 className="mt-4 text-lg font-semibold text-nordic-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-nordic-700">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto grid gap-10 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Projektplanering
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900 md:text-4xl">
                Tidslinjen börjar innan bostäderna bokas
              </h2>
              <p className="mt-4 text-nordic-700">
                Målet är inte bara att hitta bäddar, utan att skapa en boendeplan som
                håller när projektet går från etablering till toppbemanning och avslut.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {timeline.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-nordic-100 bg-white p-6 shadow-sm">
                  <span className="text-sm font-bold text-[#ff6300]">0{index + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold text-nordic-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-nordic-700">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-nordic-100 bg-nordic-50 py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Kapacitet per fas
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900 md:text-4xl">
                Planera efter arbetslagets storlek, inte bara antal bäddar
              </h2>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {capacityBands.map((item) => (
                <div key={item.band} className="rounded-lg border border-nordic-100 bg-white p-6">
                  <BriefcaseBusiness className="h-6 w-6 text-[#ff6300]" />
                  <h3 className="mt-4 text-xl font-semibold text-nordic-900">{item.band}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-nordic-700">{item.use}</p>
                  <p className="mt-4 border-t border-nordic-100 pt-4 text-sm leading-relaxed text-nordic-700">
                    {item.planning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto grid gap-10 px-6 md:px-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Sökradie
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900">
                30, 60 eller 90 minuter kan förändra hela kalkylen
              </h2>
              <p className="mt-4 text-nordic-700">
                Lägsta månadshyra är inte alltid lägsta projektkostnad. Transporttid,
                fordon, bränsle, skiftstart och trötthet påverkar total cost of accommodation.
              </p>
            </div>

            <div className="rounded-lg border border-nordic-100 bg-white">
              {radiusRows.map(([radius, text]) => (
                <div key={radius} className="grid gap-3 border-b border-nordic-100 p-5 last:border-b-0 sm:grid-cols-[140px_1fr]">
                  <p className="font-semibold text-nordic-900">{radius}</p>
                  <p className="text-sm leading-relaxed text-nordic-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-nordic-100 bg-nordic-900 py-16 text-white md:py-20">
          <div className="container mx-auto grid gap-10 px-6 md:px-12 lg:grid-cols-3">
            {[
              {
                icon: Car,
                title: 'Arbetsfordon och parkering',
                text: 'Projektbriefen ska ange antal servicebilar, behov av släp, höjd, laddning och om fordon behöver stå nära bostaden.',
              },
              {
                icon: CalendarClock,
                title: 'Rotation och volym',
                text: 'En plan för infasning, toppbemanning, hemresor och nedtrappning minskar risken för fel antal bostäder.',
              },
              {
                icon: CircleAlert,
                title: 'Fallback om tillgången ändras',
                text: 'Projektet bör ha prioritering för extra bäddar, ersättningsboende och alternativa orter i samma pendlingszon.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <Icon className="h-6 w-6 text-[#ff6300]" />
                  <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="projektbrief" className="bg-nordic-50 py-16 md:py-20">
          <div className="container mx-auto grid gap-10 px-6 md:px-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Underlag för offert
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900 md:text-4xl">
                Skicka projektbrief för boendeplan
              </h2>
              <p className="mt-4 text-nordic-700">
                Formuläret samlar de uppgifter som behövs för att bedöma ort, kapacitet,
                restid, risk och faktureringsupplägg.
              </p>
              <div className="mt-7 rounded-lg border border-nordic-100 bg-white p-5">
                <h3 className="font-semibold text-nordic-900">Internlänkad beslutsmodell</h3>
                <p className="mt-2 text-sm leading-relaxed text-nordic-700">
                  För kategoriöversikt, avtal och jämförelse mellan boendeformer:
                  {' '}
                  <Link href="/for-foretag" className="font-semibold text-[#ff6300] hover:underline">
                    gå till företagsbostäder och personalboende
                  </Link>.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-nordic-100 bg-white p-5 shadow-sm md:p-7">
              <ProjectBriefForm source="projektboende-project-brief" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyFormCTA targetId="projektbrief" primaryLabel="Skicka projektbrief" phoneLabel="Ring oss" />
      <FloatingPhoneButton className="bottom-24 md:bottom-6" />
    </div>
  );
}
