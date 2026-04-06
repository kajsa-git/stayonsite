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
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: t('Vad kostar personalboende?', 'What does worker accommodation cost?', 'Ile kosztuje zakwaterowanie?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Från 6 900 kr per person och månad. Priset beror på stad, antal personer och standard - men alltid betydligt billigare än hotell. Ni får en detaljerad offert anpassad efter era behov.',
              'From SEK 6,900 per person per month. Price depends on city, number of people and standard - but always significantly cheaper than hotels. You receive a detailed quote tailored to your needs.',
              'Od 6 900 SEK za osobę miesięcznie. Cena zależy od miasta, liczby osób i standardu - ale zawsze znacznie taniej niż hotel.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Hur snabbt kan ni ordna boende?', 'How quickly can you arrange accommodation?', 'Jak szybko mogą Państwo zorganizować zakwaterowanie?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Vi skickar en boendeplan inom 24 timmar. Vid akuta behov kan vi ofta ordna inflyttning samma vecka.',
              'We send a housing plan within 24 hours. For urgent needs, we can often arrange move-in the same week.',
              'Wysyłamy plan zakwaterowania w ciągu 24 godzin. W nagłych przypadkach - wprowadzenie w tym samym tygodniu.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Är boendet möblerat?', 'Is the accommodation furnished?', 'Czy zakwaterowanie jest umeblowane?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Ja, alla boenden är fullt möblerade med sängar, kök, tvättutrustning och internet. Era medarbetare kan flytta in direkt.',
              'Yes, all accommodations are fully furnished with beds, kitchen, laundry facilities and internet. Your employees can move in directly.',
              'Tak, wszystkie zakwaterowania są w pełni umeblowane. Pracownicy mogą się wprowadzić od razu.'
            ),
          },
        },
      ],
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
