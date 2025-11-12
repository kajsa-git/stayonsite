import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cities } from '@/data/cities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';

const CityLinks = () => {
  const { language } = useLanguage();

  return (
    <section className="section-spacing bg-white border-t border-nordic-100">
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {cities.slice(0, 10).map((city) => (
              <Link
                key={city.slug}
                to={`/stad/${city.slug}`}
                className="group text-center p-4 rounded-2xl border border-nordic-100 bg-nordic-50 hover:border-[#ff6300]/50 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center">
                  <MapPin className="h-5 w-5 text-[#ff6300] mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold text-nordic-900 group-hover:text-[#ff6300] transition-colors">
                    {city.name}
                  </h3>
                  <span className="text-xs text-gray-500 mt-1">{city.region}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {language === 'sv'
                ? 'Behöver ni boende i en annan stad? Kontakta oss så hjälper vi er!'
                : 'Need accommodation in another city? Contact us and we\'ll help you!'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityLinks;
