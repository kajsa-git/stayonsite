'use client'

import Link from 'next/link';
import Header from '@/components/Header';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { cities } from '@/data/cities';
import { MapPin } from 'lucide-react';

const ForHusagare = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'StayOnSite Homeowner Service',
      'description': t('seo.homeowner.description'),
      'provider': {
        '@type': 'Organization',
        'name': 'StayOnSite',
        'telephone': '+46 76-249 84 86',
        'url': 'https://www.stayonsite.se'
      },
      'areaServed': {
        '@type': 'Country',
        'name': 'Sweden'
      },
      'serviceType': 'Property Rental Service',
      'offers': {
        '@type': 'AggregateOffer',
        'lowPrice': 10000,
        'highPrice': 30000,
        'priceCurrency': 'SEK',
        'unitText': 'per month'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'StayOnSite',
      'url': 'https://www.stayonsite.se',
      'telephone': '+46 76-249 84 86',
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': RATING_VALUE,
        'reviewCount': REVIEW_COUNT
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': language === 'en' ? 'Does it cost anything?' : language === 'pl' ? 'Czy to coś kosztuje?' : 'Kostar det något?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': language === 'en'
              ? 'No. You pay nothing to us. We rent your property at a fixed amount every month - no deductions. We earn from the price difference with the corporate client.'
              : language === 'pl'
              ? 'Nie. Nie płacisz nam nic. Wynajmujemy Twoją nieruchomość za stałą kwotę co miesiąc - bez potrąceń.'
              : 'Nej. Du betalar ingenting till oss. Vi hyr din bostad till ett fast belopp varje månad - utan avdrag. Vi tjänar på prisskillnaden gentemot företagskunden.',
          },
        },
        {
          '@type': 'Question',
          'name': language === 'en' ? 'Who lives in my house?' : language === 'pl' ? 'Kto mieszka w moim domu?' : 'Vilka bor i mitt hus?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': language === 'en'
              ? 'Professional corporate tenants - installers, engineers and project teams working temporarily in the area. Never private individuals.'
              : language === 'pl'
              ? 'Profesjonalni najemcy firmowi - monterzy, inżynierowie i zespoły projektowe.'
              : 'Professionella företagshyresgäster - montörer, ingenjörer och projektteam som arbetar tillfälligt i området. Aldrig privatpersoner.',
          },
        },
        {
          '@type': 'Question',
          'name': language === 'en' ? 'How long is the contract?' : language === 'pl' ? 'Jak długi jest kontrakt?' : 'Hur lång är avtalstiden?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': language === 'en'
              ? "Minimum 3 months, but most partnerships run longer. You can cancel with 1 month's notice."
              : language === 'pl'
              ? 'Minimum 3 miesiące. Możesz wypowiedzieć z 1-miesięcznym wypowiedzeniem.'
              : 'Minst 3 månader, men de flesta samarbeten löper längre. Du kan säga upp med 1 månads uppsägningstid.',
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t('seo.homeowner.title')}
        description={t('seo.homeowner.description')}
        canonical="https://www.stayonsite.se/for-husagare"
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/for-husagare' },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <HomeownerHero />
        <section className="py-12 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8 max-w-5xl">
            <h2 className="text-xl font-semibold text-nordic-900 mb-2 text-center">
              Hyr ut i din stad
            </h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              Vi har aktiv efterfrågan från företag i hela Sverige
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/for-husagare/${city.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-nordic-200 hover:border-[#ff6300] hover:bg-[#ff6300]/5 transition-colors text-sm text-nordic-900 hover:text-[#ff6300]"
                >
                  <MapPin className="h-3 w-3" />
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForHusagare;
