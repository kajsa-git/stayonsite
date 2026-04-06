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
