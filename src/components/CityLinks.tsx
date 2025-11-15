import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cities, type City } from '@/data/cities';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight, Search } from 'lucide-react';

const CityLinks = () => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');

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
              {language === 'sv' ? 'Boende i hela Sverige' : 'Housing all over Sweden'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'sv'
                ? 'Vi täcker Sveriges största städer och industriknutpunkter'
                : 'We cover Sweden\'s largest cities and industrial hubs'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {cities.slice(0, 12).map((city) => (
              <Link
                key={city.slug}
                to={`/stad/${city.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-nordic-200 hover:border-[#ff6300] hover:bg-[#ff6300]/5 transition-colors text-sm text-nordic-900 hover:text-[#ff6300]"
              >
                <MapPin className="h-3.5 w-3.5" />
                {city.name}
              </Link>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {language === 'sv'
                ? 'Hittar du inte din stad? Vi löser boende var som helst i Sverige.'
                : 'Cannot find your city? We arrange housing anywhere in Sweden.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityLinks;
