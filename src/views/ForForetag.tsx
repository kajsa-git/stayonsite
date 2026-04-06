'use client'

import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import ForForetagHero from '@/components/foretag/ForForetagHero';

const ForForetag = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'StayOnSite Corporate Worker Accommodation',
      description: t(
        'StayOnSite erbjuder personalboende och företagsbostäder i hela Sverige för bygg, energi, skog, infrastruktur och montörsteam.',
        'StayOnSite provides corporate worker accommodation across Sweden for construction, energy, forestry, infrastructure and installation teams.',
        'StayOnSite oferuje zakwaterowanie pracownicze w całej Szwecji dla budownictwa, energetyki, leśnictwa, infrastruktury i montażu.'
      ),
      provider: {
        '@type': 'LodgingBusiness',
        name: 'StayOnSite',
        telephone: '+46 76-249 84 86',
        url: 'https://www.stayonsite.se',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Sweden',
      },
      serviceType: 'Corporate Worker Accommodation',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: RATING_VALUE,
        reviewCount: REVIEW_COUNT,
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t(
          'Personalboende för företag - Boka offert | StayOnSite',
          'Worker Accommodation for Companies - Get a Quote | StayOnSite',
          'Zakwaterowanie pracownicze dla firm - Otrzymaj ofertę | StayOnSite'
        )}
        description={t(
          'Boka personalboende för ert team. Möblerat, inflyttningsklart, en faktura. Vi ordnar boende i hela Sverige. Offert inom 24 timmar.',
          'Book worker accommodation for your team. Furnished, move-in ready, one invoice. We arrange accommodation across Sweden. Quote within 24 hours.',
          'Zarezerwuj zakwaterowanie dla swojego zespołu. Umeblowane, gotowe, jedna faktura. Oferta w ciągu 24 godzin.'
        )}
        canonical="https://www.stayonsite.se/for-foretag"
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/for-foretag' },
          { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
          { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
          { lang: 'x-default', href: 'https://www.stayonsite.se/for-foretag' },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <ForForetagHero />
      </main>
    </div>
  );
};

export default ForForetag;
