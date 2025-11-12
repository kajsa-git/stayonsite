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

const ForHusagare = () => {
  const { language } = useLanguage();

  const seoContent = {
    sv: {
      title: 'Hyr ut ditt boende till byggarbetare - 3000-8000 kr/mån | StayOnSite',
      description: 'Tjäna 3000-8000 kr/månad genom att hyra ut ditt boende till byggarbetare. StayOnSite sköter allt - kontrakt, hyresgäster och betalningar. Säkra hyresintäkter. Ring 073-628 77 09',
      keywords: 'hyra ut boende, hyra ut stuga, hyra ut lägenhet, extra inkomst boende, företagsbostäder, byggarbetare hyresgäster, passiv inkomst, hyra ut hus, stayonsite husägare, montörboende uthyrning'
    },
    en: {
      title: 'Rent out your property to construction workers - 3000-8000 SEK/month | StayOnSite',
      description: 'Earn 3000-8000 SEK/month by renting your property to construction workers. StayOnSite handles everything - contracts, tenants and payments. Secure rental income. Call 073-628 77 09',
      keywords: 'rent out property, rent out cottage, rent out apartment, extra income property, corporate housing, construction worker tenants, passive income, rent out house, stayonsite homeowners'
    },
    pl: {
      title: 'Wynajmij swoją nieruchomość pracownikom budowlanym - 3000-8000 kr/mies | StayOnSite',
      description: 'Zarabiaj 3000-8000 kr/miesiąc wynajmując swoją nieruchomość pracownikom budowlanym. StayOnSite zajmuje się wszystkim - umowy, najemcy i płatności. Pewny dochód z wynajmu. Zadzwoń 073-628 77 09',
      keywords: 'wynajmij nieruchomość, wynajmij domek, wynajmij mieszkanie, dodatkowy dochód nieruchomość, mieszkania służbowe, najemcy pracownicy budowlani, pasywny dochód, wynajmij dom, stayonsite właściciele'
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'StayOnSite Homeowner Service',
    'description': seoContent[language].description,
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
        title={seoContent[language].title}
        description={seoContent[language].description}
        keywords={seoContent[language].keywords}
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