import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import HomeownerBenefits from '@/components/homeowner/HomeownerBenefits';
import HomeownerGuarantee from '@/components/homeowner/HomeownerGuarantee';
import HomeownerProcess from '@/components/homeowner/HomeownerProcess';
import HomeownerComparison from '@/components/homeowner/HomeownerComparison';
import HomeownerTestimonials from '@/components/homeowner/HomeownerTestimonials';
import HomeownerAbout from '@/components/homeowner/HomeownerAbout';
import HomeownerFAQ from '@/components/homeowner/HomeownerFAQ';
import HomeownerForm from '@/components/homeowner/HomeownerForm';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

import { useTranslation } from '@/hooks/use-translation';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import type { TranslationKey } from '@/data/translations';

const ForHusagare = () => {
  const { t } = useTranslation();

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
        'url': 'https://stayonsite.se'
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
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': RATING_VALUE,
        'reviewCount': REVIEW_COUNT
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [1,2,3,4,5,6,7,8].map(i => ({
        '@type': 'Question',
        'name': t(`homeowner.faq.question${i}` as TranslationKey),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t(`homeowner.faq.answer${i}` as TranslationKey)
        }
      }))
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'StayOnSite', 'item': 'https://stayonsite.se' },
        { '@type': 'ListItem', 'position': 2, 'name': t('seo.homeowner.title'), 'item': 'https://stayonsite.se/for-husagare' }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t('seo.homeowner.title')}
        description={t('seo.homeowner.description')}
        canonical="https://stayonsite.se/for-husagare"
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-grow">
        <HomeownerHero />
        <HomeownerBenefits />
        <HomeownerGuarantee />
        <HomeownerProcess />
        <HomeownerComparison />
        <HomeownerTestimonials />
        <HomeownerAbout />
        <HomeownerFAQ />
        <HomeownerForm />
      </main>
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default ForHusagare;