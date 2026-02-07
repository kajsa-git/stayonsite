import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { type AvailableLanguages } from '@/data/translations';
import { cities, type City } from '@/data/cities';
import { MapPin } from 'lucide-react';

const translations: Record<AvailableLanguages, { title: string; subtitle: string; notFound: string }> = {
  sv: {
    title: 'Personalboende i hela Sverige',
    subtitle: 'Vi täcker Sveriges största städer och industriknutpunkter',
    notFound: 'Hittar du inte din stad? Vi löser boende var som helst i Sverige.',
  },
  en: {
    title: 'Worker accommodation across Sweden',
    subtitle: "We cover Sweden's largest cities and industrial hubs",
    notFound: 'Cannot find your city? We arrange housing anywhere in Sweden.',
  },
  pl: {
    title: 'Noclegi pracownicze w całej Szwecji',
    subtitle: 'Obsługujemy największe miasta i węzły przemysłowe Szwecji',
    notFound: 'Nie możesz znaleźć swojego miasta? Organizujemy zakwaterowanie w dowolnym miejscu w Szwecji.',
  },
};

const CityLinks = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const groupedByRegion = useMemo(() => {
    return cities.reduce<Record<string, City[]>>((acc, city) => {
      if (!acc[city.region]) acc[city.region] = [];
      acc[city.region].push(city);
      return acc;
    }, {});
  }, []);

  const sortedRegions = useMemo(
    () => Object.keys(groupedByRegion).sort((a, b) => a.localeCompare(b, 'sv')),
    [groupedByRegion]
  );

  const cityLink = (slug: string) => {
    if (language === 'en') return `/en/corporate-housing/${slug}`;
    if (language === 'pl') return `/pl/zakwaterowanie/${slug}`;
    return `/stad/${slug}`;
  };

  return (
    <section id="cities" className="py-16 bg-nordic-50 border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-2">
              {t.title}
            </h2>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>

          <div className="space-y-6">
            {sortedRegions.map((region) => (
              <div key={region}>
                <h3 className="text-xs uppercase tracking-widest text-nordic-500 font-semibold mb-3">
                  {region}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {groupedByRegion[region].map((city) => (
                    <Link
                      key={city.slug}
                      to={cityLink(city.slug)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-nordic-200 hover:border-[#ff6300] hover:bg-[#ff6300]/5 transition-colors text-sm text-nordic-900 hover:text-[#ff6300]"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">{t.notFound}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityLinks;
