
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyStayOnSite from '@/components/WhyStayOnSite';
import CaseStudy from '@/components/CaseStudy';
import Services from '@/components/Services';
import CityLinks from '@/components/CityLinks';
import References from '@/components/References';
import FAQ from '@/components/FAQ';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { language } = useLanguage();

  const seoContent = {
    sv: {
      title: 'StayOnSite - Boende för byggarbetare | Företagsbostäder Sverige',
      description: 'Snabbt boende för byggarbetare i hela Sverige. StayOnSite hjälper byggbolag hitta longstay och shortstay lösningar. 10+ års erfarenhet. Ring 073-628 77 09',
      keywords: 'boende byggarbetare, företagsbostäder, personalboende, byggboende, montörboende, arbetarboende, longstay sverige, shortstay sverige, boende stockholm, boende göteborg, boende malmö, stayonsite, byggfirmor boende'
    },
    en: {
      title: 'StayOnSite - Construction Worker Accommodation | Corporate Housing Sweden',
      description: 'Fast accommodation for construction workers throughout Sweden. StayOnSite helps construction companies find longstay and shortstay solutions. 10+ years experience. Call 073-628 77 09',
      keywords: 'construction worker accommodation, corporate housing, staff accommodation, construction housing, worker housing, longstay sweden, shortstay sweden, accommodation stockholm, accommodation gothenburg, accommodation malmö, stayonsite'
    },
    pl: {
      title: 'StayOnSite - Zakwaterowanie dla pracowników budowlanych | Mieszkania służbowe Szwecja',
      description: 'Szybkie zakwaterowanie dla pracowników budowlanych w całej Szwecji. StayOnSite pomaga firmom budowlanym znaleźć długo- i krótkoterminowe rozwiązania. Ponad 10 lat doświadczenia. Zadzwoń 073-628 77 09',
      keywords: 'zakwaterowanie pracowników budowlanych, mieszkania służbowe, zakwaterowanie personelu, zakwaterowanie budowlane, długoterminowe szwecja, krótkoterminowe szwecja, zakwaterowanie sztokholm, zakwaterowanie göteborg, zakwaterowanie malmö, stayonsite'
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'StayOnSite',
    'image': 'https://stayonsite.se/lovable-uploads/b7dae38c-843c-4240-bbc3-cc9acc2de55d.png',
    '@id': 'https://stayonsite.se',
    'url': 'https://stayonsite.se',
    'telephone': '+46736287709',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'SE'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 59.3293,
      'longitude': 18.0686
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      'opens': '08:00',
      'closes': '17:00'
    },
    'sameAs': [
      'https://www.facebook.com/stayonsite',
      'https://www.linkedin.com/company/stayonsite'
    ],
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '200'
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
          title={seoContent[language].title}
          description={seoContent[language].description}
          keywords={seoContent[language].keywords}
          structuredData={structuredData}
        />
        <Header />
        <main className="flex-grow">
          <Hero />
          <WhyStayOnSite />
          <CaseStudy />
          <Services />
          <InquiryForm />
          <References />
          <FAQ />
          <CityLinks />
        </main>
        <Footer />
        <FloatingPhoneButton />
      </div>
  );
};

export default Index;
