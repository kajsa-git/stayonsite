
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyStayOnSite from '@/components/WhyStayOnSite';
import CaseStudy from '@/components/CaseStudy';
import CityLinks from '@/components/CityLinks';
import References from '@/components/References';
import FAQ from '@/components/FAQ';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import StickyContact from '@/components/StickyContact';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';

const Index = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'StayOnSite',
    'image': 'https://stayonsite.se/images/og-image.jpg',
    '@id': 'https://stayonsite.se',
    'url': 'https://stayonsite.se',
    'telephone': '+46 76-249 84 86',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'SE'
    },
    'sameAs': [
      'https://www.facebook.com/stayonsite',
      'https://www.linkedin.com/company/stayonsite'
    ],
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': RATING_VALUE,
      'reviewCount': REVIEW_COUNT
    },
    'areaServed': [
      {
        '@type': 'City',
        'name': 'Stockholm'
      },
      {
        '@type': 'City',
        'name': 'Göteborg'
      },
      {
        '@type': 'City',
        'name': 'Malmö'
      },
      {
        '@type': 'Country',
        'name': 'Sweden'
      }
    ],
    'serviceType': 'Construction Worker Accommodation',
    'description': language === 'sv'
      ? 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare med över 10 års erfarenhet'
      : language === 'en'
      ? 'We help construction companies quickly find accommodation in other locations for their workers with over 10 years of experience'
      : 'Pomagamy firmom budowlanym szybko znaleźć zakwaterowanie w innych lokalizacjach dla ich pracowników z ponad 10-letnim doświadczeniem'
  };

  return (
    <div className="min-h-screen flex flex-col">
        <SEO
          title={t('seo.home.title')}
          description={t('seo.home.description')}
          structuredData={structuredData}
          hreflangs={[
            { lang: 'sv', href: 'https://stayonsite.se/' },
            { lang: 'en', href: 'https://stayonsite.se/en/corporate-housing-sweden' },
            { lang: 'pl', href: 'https://stayonsite.se/pl/zakwaterowanie-firmowe' },
            { lang: 'x-default', href: 'https://stayonsite.se/' }
          ]}
        />
        <Header />
        <main className="flex-grow">
          <Hero />
          <WhyStayOnSite />
          <CaseStudy />
          <References />
          <FAQ />
          <InquiryForm />
          <CityLinks />
        </main>
        <Footer />
        <FloatingPhoneButton />
        <StickyContact />
      </div>
  );
};

export default Index;
