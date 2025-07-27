import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cities } from '@/data/cities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';

const CityLinks = () => {
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-nordic-900 mb-4 font-display">
              {language === 'sv' 
                ? 'Vi täcker hela Sverige'
                : 'We cover all of Sweden'
              }
            </h2>
            <p className="text-lg text-gray-600">
              {language === 'sv'
                ? 'Upptäck våra tjänster i Sveriges största städer'
                : 'Discover our services in Sweden\'s largest cities'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.slice(0, 9).map((city) => (
              <Link 
                key={city.slug} 
                to={`/stad/${city.slug}`}
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group-hover:border-nordic-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-nordic-900 mb-2 group-hover:text-nordic-600 transition-colors">
                          {city.name}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{city.region}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-nordic-600 transition-all duration-300 transform group-hover:translate-x-1" />
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {language === 'sv'
                        ? `Företagsbostäder och boendlösningar för byggarbetare i ${city.name}`
                        : `Corporate housing and accommodation solutions for construction workers in ${city.name}`
                      }
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {city.industries.slice(0, 2).map((industry, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                      {city.industries.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{city.industries.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">
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