import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { type AvailableLanguages } from '@/data/translations';
import { cities, type City } from '@/data/cities';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight, Search } from 'lucide-react';

const translations: Record<AvailableLanguages, { title: string; subtitle: string; notFound: string }> = {
  sv: {
    title: 'Boende i hela Sverige',
    subtitle: 'Vi täcker Sveriges största städer och industriknutpunkter',
    notFound: 'Hittar du inte din stad? Vi löser boende var som helst i Sverige.',
  },
  en: {
    title: 'Housing all over Sweden',
    subtitle: "We cover Sweden's largest cities and industrial hubs",
    notFound: 'Cannot find your city? We arrange housing anywhere in Sweden.',
  },
  pl: {
    title: 'Zakwaterowanie w całej Szwecji',
    subtitle: 'Obsługujemy największe miasta i węzły przemysłowe Szwecji',
    notFound: 'Nie możesz znaleźć swojego miasta? Organizujemy zakwaterowanie w dowolnym miejscu w Szwecji.',
  },
};

const CityLinks = () => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const t = translations[language];

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((city) => {
      return (
        city.name.toLowerCase().includes(q) ||
        city.region.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const groupedByRegion = useMemo(() => {
    return filteredCities.reduce<Record<string, City[]>>((acc, city) => {
      if (!acc[city.region]) {
        acc[city.region] = [];
      }
      acc[city.region].push(city);
      return acc;
    }, {});
  }, [filteredCities]);

  const sortedRegions = useMemo(
    () => Object.keys(groupedByRegion).sort((a, b) => a.localeCompare(b, 'sv')),
    [groupedByRegion]
  );

  return (
    <section id="cities" className="py-12 bg-nordic-50 border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-2">
              {t.title}
            </h2>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {cities.slice(0, 12).map((city) => {
              let cityLink = `/stad/${city.slug}`;
              if (language === 'en') cityLink = `/en/corporate-housing/${city.slug}`;
              if (language === 'pl') cityLink = `/pl/zakwaterowanie/${city.slug}`;

              return (
                <Link
                  key={city.slug}
                  to={cityLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-nordic-200 hover:border-[#ff6300] hover:bg-[#ff6300]/5 transition-colors text-sm text-nordic-900 hover:text-[#ff6300]"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {city.name}
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">{t.notFound}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityLinks;
