import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import HomeownerBenefits from '@/components/homeowner/HomeownerBenefits';
import HomeownerProcess from '@/components/homeowner/HomeownerProcess';
import HomeownerTestimonials from '@/components/homeowner/HomeownerTestimonials';
import HomeownerFAQ from '@/components/homeowner/HomeownerFAQ';
import HomeownerForm from '@/components/homeowner/HomeownerForm';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

import { useTranslation } from '@/hooks/use-translation';

const ForHusagare = () => {
  const { t } = useTranslation();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'StayOnSite Homeowner Service',
    'description': t('seo.homeowner.description'),
    'provider': {
      '@type': 'Organization',
      'name': 'StayOnSite',
      'telephone': '+46736287709',
      'url': 'https://stayonsite.se'
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'Sweden'
    },
    'serviceType': 'Property Rental Service',
    'offers': {
      '@type': 'Offer',
      'priceSpecification': {
        '@type': 'PriceSpecification',
        'price': '3000-8000',
        'priceCurrency': 'SEK',
        'unitText': 'per month'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '200'
    }
  };

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
        <HomeownerProcess />
        <HomeownerTestimonials />
        <HomeownerFAQ />
        <HomeownerForm />
      </main>
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default ForHusagare;