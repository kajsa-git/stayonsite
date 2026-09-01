'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { COMPANY_FACTS, RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import {
  Building2,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  HardHat,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  ShieldCheck,
} from 'lucide-react';

const facts = [
  { label: 'Bolagsnamn', value: 'StayOnSite AB' },
  { label: 'Organisationsnummer', value: '559213-7102' },
  { label: 'Grundat', value: '2016' },
  { label: 'Huvudmarknad', value: 'Sverige' },
  { label: 'Inriktning', value: 'Personalboende, projektboende och företagsbostäder' },
  { label: 'Kunder', value: 'Byggbolag, industriföretag, energi- och infrastrukturprojekt' },
];

const proofPoints = [
  { icon: Clock, title: '24 timmar', text: 'Boendeplan lämnas normalt inom ett dygn vid nya projektförfrågningar.' },
  { icon: MapPin, title: '31 städer', text: 'Dedikerade stadssidor och nätverk från Kiruna till Malmö.' },
  { icon: ShieldCheck, title: `${RATING_VALUE}/5`, text: `Snittbetyg från ${REVIEW_COUNT} kundomdömen.` },
  { icon: HardHat, title: 'Projektfokus', text: 'Särskilt byggt för team som arbetar veckor, månader eller år på annan ort.' },
];

const mediaAngles = [
  'Bostadsbristens effekt på stora bygg-, energi- och industriprojekt.',
  'Så påverkar grön omställning och infrastrukturbyggen behovet av personalboende.',
  'Blockhyra och trygg företagsuthyrning för privata husägare.',
  'Boende för utländska montörer och projektteam i Sverige.',
];

const links = [
  { label: 'Google', href: COMPANY_FACTS.googleBusinessProfile },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/stayonsite-sweden/' },
  { label: 'Europages', href: 'https://www.europages.co.uk/en/company/stayonsite-ab-22411415' },
  { label: 'Brownbook', href: 'https://www.brownbook.net/business/55436204/stayonsite-ab' },
  { label: 'Kompass', href: 'https://se.kompass.com/c/stayonsite-ab/secom855609/' },
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Press och media - StayOnSite AB',
    url: 'https://www.stayonsite.se/press',
    description:
      'Pressinformation, bolagsfakta och kontaktuppgifter för StayOnSite AB, specialist på personalboende och företagsbostäder i Sverige.',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${COMPANY_FACTS.url}/#organization`,
      name: 'StayOnSite',
      legalName: 'StayOnSite AB',
      url: 'https://www.stayonsite.se',
      logo: 'https://www.stayonsite.se/stayonsite-logo.png',
      foundingDate: '2016',
      telephone: '+46762498486',
      email: 'info@stayonsite.se',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'press',
        name: 'Kajsa Sihlén',
        email: 'info@stayonsite.se',
        telephone: '+46762498486',
        availableLanguage: ['sv', 'en', 'pl'],
      },
      founder: {
        '@type': 'Person',
        name: 'Kajsa Sihlén',
        jobTitle: 'Grundare och VD',
      },
      sameAs: links.map((link) => link.href),
    },
  },
];

export default function Press() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO structuredData={structuredData} />
      <Header />

      <main className="flex-grow">
        <section className="bg-primary text-white pt-32 pb-16 md:pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-4xl">
              <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
                <Newspaper size={18} className="text-[#ff6300]" />
                Press och media
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
                Fakta om StayOnSite AB
              </h1>
              <p className="mt-6 max-w-3xl text-lg md:text-xl text-white/80 font-light leading-relaxed">
                StayOnSite hjälper byggbolag och industriföretag att ordna möblerade boenden för
                projektteam i hela Sverige. Här finns kort bolagsfakta, kontaktuppgifter och
                underlag för journalister, partners och redaktioner.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:info@stayonsite.se?subject=Pressfraga%20StayOnSite"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6300] px-6 font-semibold text-white transition hover:bg-[#e25200]"
                >
                  <Mail size={18} />
                  Kontakta press
                </a>
                <a
                  href="/stayonsite-logo.png"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 font-semibold text-white transition hover:bg-white/10"
                >
                  <FileText size={18} />
                  Logotyp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6300]">
                  Kort beskrivning
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900">
                  En boendepartner för projekt på annan ort
                </h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-nordic-700 font-light">
                  <p>
                    StayOnSite AB erbjuder personalboende och företagsbostäder för byggbolag,
                    industriföretag och montörsteam som arbetar på annan ort. Bolaget matchar
                    projektens behov med möblerade bostäder och hanterar kontakt, avtal,
                    fakturering och löpande support.
                  </p>
                  <p>
                    Tjänsten används när hotell blir för dyrt eller opraktiskt, och när ett projekt
                    behöver ett tryggt upplägg med fast månadspris, en kontaktperson och boenden där
                    teamet kan fungera under längre perioder.
                  </p>
                </div>
              </div>

              <div className="border border-nordic-200 bg-nordic-50 p-6 md:p-8">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-nordic-900">
                  <Building2 size={22} className="text-[#ff6300]" />
                  Bolagsfakta
                </h2>
                <dl className="space-y-4">
                  {facts.map((fact) => (
                    <div key={fact.label} className="border-b border-nordic-200 pb-4 last:border-b-0 last:pb-0">
                      <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-nordic-500">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-nordic-900">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-6 md:grid-cols-4">
              {proofPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div key={point.title} className="border border-nordic-200 bg-white p-6">
                    <Icon size={24} className="mb-5 text-[#ff6300]" />
                    <h2 className="text-2xl font-display font-bold text-nordic-900">{point.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-nordic-600">{point.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6300]">
                  Relevanta ämnen
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900">
                  Vinklar vi kan kommentera
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-nordic-700 font-light">
                  Kajsa Sihlén kan bidra med praktisk erfarenhet från boendeplanering för projekt i
                  mindre och mellanstora svenska städer, särskilt där bostadsmarknaden är pressad.
                </p>
              </div>
              <ul className="grid gap-4">
                {mediaAngles.map((angle) => (
                  <li key={angle} className="flex gap-4 border-b border-nordic-200 pb-4 text-lg text-nordic-800">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-[#ff6300]" />
                    {angle}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 bg-nordic-900 text-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6300]">
                  Kontakt
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  För intervjuer, kommentarer och partnerskap
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75 font-light">
                  Kontakta Kajsa Sihlén för frågor om personalboende, företagsbostäder, projektboende
                  och trygg uthyrning till företag.
                </p>
              </div>
              <div className="space-y-4">
                <a
                  href="tel:+46762498486"
                  className="flex items-center gap-4 border border-white/15 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <Phone size={20} className="text-[#ff6300]" />
                  <span>+46 76 249 84 86</span>
                </a>
                <a
                  href="mailto:info@stayonsite.se"
                  className="flex items-center gap-4 border border-white/15 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <Mail size={20} className="text-[#ff6300]" />
                  <span>info@stayonsite.se</span>
                </a>
                <a
                  href="https://www.stayonsite.se"
                  className="flex items-center gap-4 border border-white/15 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <Globe2 size={20} className="text-[#ff6300]" />
                  <span>www.stayonsite.se</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#ff6300]">
                  Externa profiler
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900">
                  Officiella företagsprofiler
                </h2>
              </div>
              <p className="max-w-2xl text-nordic-600">
                Dessa profiler används för att hålla bolagsuppgifter konsekventa mellan kataloger,
                sökmotorer och B2B-plattformar.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-nordic-200 px-5 py-4 text-nordic-900 transition hover:border-[#ff6300] hover:text-[#ff6300]"
                >
                  <span className="font-semibold">{link.label}</span>
                  <ExternalLink size={17} />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
