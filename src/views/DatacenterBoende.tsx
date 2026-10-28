'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BedDouble, CalendarDays, MapPin, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InquiryForm from '@/components/InquiryForm';
import HeroIntentForm from '@/components/HeroIntentForm';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { COMPANY_FACTS } from '@/data/constants';
import { DATACENTER_IMAGES, DATACENTER_PATHS, DATACENTER_SOURCES } from '@/data/datacenter';
import { trackPhoneClick } from '@/lib/gtag';

const requirements = [
  { key: 'rooms', icon: BedDouble },
  { key: 'shifts', icon: MapPin },
  { key: 'phases', icon: CalendarDays },
] as const;
const regions = [
  { key: 'horndal', city: null },
  { key: 'borlange', city: 'falun' },
  { key: 'gavle', city: 'gavle' },
] as const;
const brief = ['location', 'people', 'dates', 'services', 'company'] as const;
const questions = ['price', 'capacity', 'region'] as const;
const cityPrefix = { sv: '/stad/', en: '/en/corporate-housing/', pl: '/pl/zakwaterowanie/' };
const homePaths = { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' };
const primaryButton = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff6300] px-6 py-3 font-semibold text-white transition hover:bg-[#e25200] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6300]';

export default function DatacenterBoende() {
  const { language, t } = useLanguage();
  const url = `${COMPANY_FACTS.url}${DATACENTER_PATHS[language]}`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      url,
      name: t('datacenter.title'),
      description: t('datacenter.intro'),
      serviceType: t('datacenter.nav'),
      areaServed: { '@type': 'Country', name: 'Sweden' },
      provider: {
        '@type': 'Organization',
        '@id': `${COMPANY_FACTS.url}/#organization`,
        name: COMPANY_FACTS.name,
        url: COMPANY_FACTS.url,
        telephone: COMPANY_FACTS.phoneDisplay,
        email: COMPANY_FACTS.email,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StayOnSite', item: `${COMPANY_FACTS.url}${homePaths[language]}` },
        { '@type': 'ListItem', position: 2, name: t('datacenter.nav'), item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-nordic-900">
      <SEO structuredData={structuredData} />
      <Header />
      <main>
        <section className="bg-nordic-900 pb-16 pt-32 text-white md:pb-20 md:pt-40">
          <div className="container mx-auto px-6 md:px-12">
            <nav aria-label={t('datacenter.breadcrumb')} className="mb-8 flex flex-wrap gap-2 text-sm text-white/70">
              <Link href={homePaths[language]} className="hover:underline">StayOnSite</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{t('datacenter.nav')}</span>
            </nav>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-x-12">
              <div className="min-w-0">
                <p className="mb-4 max-w-2xl text-sm font-semibold text-orange-300">{t('datacenter.eyebrow')}</p>
                <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight md:text-5xl xl:text-6xl">{t('datacenter.title')}</h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85">{t('datacenter.intro')}</p>
              </div>
              <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
                <HeroIntentForm />
              </div>
              <div className="min-w-0 lg:col-start-1 lg:row-start-2">
                <div className="flex flex-wrap gap-4">
                  <a href="#hero-inquiry" className={primaryButton}>{t('datacenter.cta')}<ArrowRight size={18} aria-hidden="true" /></a>
                  <a href="#project-areas" className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">{t('datacenter.regionCta')}</a>
                </div>
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/65">{t('datacenter.fit')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:px-12">
          <h2 className="font-heading text-3xl font-semibold">{t('datacenter.requirements.title')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {requirements.map(({ key, icon: Icon }) => (
              <div key={key} className="rounded-2xl border border-nordic-100 bg-nordic-50 p-6">
                <Icon className="mb-4 text-[#ff6300]" aria-hidden="true" />
                <h3 className="text-xl font-semibold">{t(`datacenter.${key}.title`)}</h3>
                <p className="mt-3 leading-relaxed text-nordic-700">{t(`datacenter.${key}.text`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="project-areas" className="scroll-mt-24 border-y border-nordic-100 bg-nordic-50 py-16">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="max-w-3xl font-heading text-3xl font-semibold">{t('datacenter.regions.title')}</h2>
                <p className="mt-4 max-w-3xl leading-relaxed text-nordic-700">{t('datacenter.regions.intro')}</p>
              </div>
              <figure className="min-w-0">
                <Image src={DATACENTER_IMAGES.site} alt={t('datacenter.image.site.alt')} width={DATACENTER_IMAGES.width} height={DATACENTER_IMAGES.height} sizes="(max-width: 1023px) 100vw, 50vw" className="h-auto w-full rounded-2xl" />
                <figcaption className="mt-3 text-xs leading-relaxed text-nordic-700">{t('datacenter.image.site.caption')}</figcaption>
              </figure>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {regions.map(({ key, city }) => (
                <article key={key} className="flex flex-col rounded-2xl border border-nordic-100 bg-white p-6">
                  <h3 className="text-2xl font-semibold">{t(`datacenter.${key}.title`)}</h3>
                  <p className="mt-4 leading-relaxed text-nordic-700">{t(`datacenter.${key}.fact`)}</p>
                  <a href={DATACENTER_SOURCES[key].url} className="mt-2 text-sm text-nordic-600 underline underline-offset-4">{t('datacenter.source')}: {DATACENTER_SOURCES[key].publisher}</a>
                  <p className="mb-6 mt-5 leading-relaxed text-nordic-700">{t(`datacenter.${key}.text`)}</p>
                  <Link href={city ? `${cityPrefix[language]}${city}` : '#inquiry'} className="mt-auto font-semibold text-nordic-900 underline decoration-[#ff6300] underline-offset-4">{t(`datacenter.${key}.cta`)}</Link>
                </article>
              ))}
            </div>
            <p className="mt-6 max-w-4xl text-sm leading-relaxed text-nordic-600">{t('datacenter.checked')}</p>
          </div>
        </section>

        <section className="container mx-auto grid gap-10 px-6 py-16 md:px-12 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold">{t('datacenter.brief.title')}</h2>
            <p className="mt-4 leading-relaxed text-nordic-700">{t('datacenter.brief.intro')}</p>
            <ul className="mt-6 list-disc space-y-3 pl-5 leading-relaxed text-nordic-700 marker:text-[#ff6300]">
              {brief.map(key => <li key={key}>{t(`datacenter.brief.${key}`)}</li>)}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-nordic-600">{t('datacenter.availability')}</p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <a href="#inquiry" className={primaryButton}>{t('datacenter.cta')}</a>
              <a href={COMPANY_FACTS.phoneHref} onClick={trackPhoneClick} className="inline-flex min-h-12 items-center gap-2 font-semibold"><Phone size={17} aria-hidden="true" />{COMPANY_FACTS.phoneDisplay}</a>
            </div>
          </div>
          <div>
            <figure className="mb-8">
              <Image src={DATACENTER_IMAGES.home} alt={t('datacenter.image.home.alt')} width={DATACENTER_IMAGES.width} height={DATACENTER_IMAGES.height} sizes="(max-width: 1023px) 100vw, 50vw" className="h-auto w-full rounded-2xl" />
              <figcaption className="mt-3 text-xs leading-relaxed text-nordic-700">{t('datacenter.image.home.caption')}</figcaption>
            </figure>
            <h2 className="font-heading text-3xl font-semibold">{t('datacenter.faq.title')}</h2>
            <div className="mt-6 divide-y divide-nordic-100">
              {questions.map(key => (
                <details key={key} className="py-5">
                  <summary className="cursor-pointer font-semibold">{t(`datacenter.faq.${key}.q`)}</summary>
                  <p className="mt-3 leading-relaxed text-nordic-700">{t(`datacenter.faq.${key}.a`)}</p>
                </details>
              ))}
            </div>
            <Link href="/blogg/datacenter-montorboende-guide-2026" hrefLang="sv" className="mt-5 inline-block font-semibold underline decoration-[#ff6300] underline-offset-4">{t('datacenter.related')}</Link>
          </div>
        </section>
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
