'use client'

import Header from '@/components/Header';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';

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
      </main>
    </div>
  );
};

export default ForHusagare;
