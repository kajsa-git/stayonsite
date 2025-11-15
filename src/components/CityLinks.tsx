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
    <section id="cities" className="section-spacing bg-white border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-[#ff6300] mb-2 text-sm uppercase tracking-[0.35em] font-heading">
              {language === 'sv' ? 'Städer' : language === 'en' ? 'Cities' : 'Miasta'}
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-3">
              {language === 'sv'
                ? 'Vi täcker hela Sverige'
                : 'We cover all of Sweden'
              }
            </h2>
            <p className="text-base text-gray-600">
              {language === 'sv'
                ? 'Upptäck våra tjänster i Sveriges största städer'
                : 'Discover our services in Sweden\'s largest cities'
              }
            </p>
          </div>

          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  language === 'sv'
                    ? 'Sök efter stad eller region'
                    : 'Search for a city or region'
                }
                className="pl-9"
                aria-label="Filter cities"
              />
            </div>
          </div>

          {sortedRegions.length === 0 ? (
            <p className="text-center text-gray-500">
              {language === 'sv'
                ? 'Inga städer matchar din sökning just nu.'
                : 'No cities match your search right now.'}
            </p>
          ) : (
            sortedRegions.map((region) => (
              <div key={region} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-nordic-900">{region}</h3>
                  <Badge variant="outline" className="text-xs">
                    {groupedByRegion[region].length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupedByRegion[region].map((city) => (
                    <Link
                      key={city.slug}
                      to={`/stad/${city.slug}`}
                      className="group text-center p-4 rounded-2xl border border-nordic-100 bg-nordic-50 hover:border-[#ff6300]/50 hover:bg-white hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col items-center">
                        <MapPin className="h-5 w-5 text-[#ff6300] mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-semibold text-nordic-900 group-hover:text-[#ff6300] transition-colors">
                          {city.name}
                        </h4>
                        <span className="text-xs text-gray-500 mt-1">{city.population}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {language === 'sv'
                ? 'Hittar du inte staden du behöver? Kontakta oss så bygger vi boendeplanen ändå.'
                : 'Cannot find the city you need? Contact us and we will map it for you.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityLinks;
