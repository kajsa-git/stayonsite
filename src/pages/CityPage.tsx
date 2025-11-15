import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCityBySlug } from '@/data/cities';
import Breadcrumbs from '@/components/Breadcrumbs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Building, Phone, Mail } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';

const CityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  if (!citySlug) {
    return <Navigate to="/" replace />;
  }
  
  const city = getCityBySlug(citySlug);
  
  if (!city) {
    return <Navigate to="/404" replace />;
  }

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [citySlug]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': `StayOnSite ${city.name}`,
    'description': `${language === 'sv' ? `Letar ditt företag efter boende till personal i ${city.name}? StayOnSite erbjuder möblerade lägenheter och hus för kort- och långtidshyra. Kontakta oss för en snabb offert.` : `Is your company looking for staff housing in ${city.name}? StayOnSite offers furnished apartments and houses for short and long-term rent. Contact us for a quick quote.`}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': city.name,
      'addressRegion': city.region,
      'addressCountry': 'SE'
    },
    'telephone': '+46736287709',
    'url': `https://stayonsite.se/stad/${city.slug}`,
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': city.coordinates[0],
      'longitude': city.coordinates[1]
    },
    'areaServed': {
      '@type': 'City',
      'name': city.name,
      'containedIn': {
        '@type': 'State',
        'name': city.region
      }
    },
    'priceRange': '$$',
    'serviceType': 'Construction Worker Accommodation',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '200'
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={language === 'sv' ? `Företagsboende i ${city.name} | Hyr lägenhet till personal | StayOnSite` : `Corporate Housing in ${city.name} | Rent Apartments for Staff | StayOnSite`}
        description={language === 'sv' ? `Letar ditt företag efter boende till personal i ${city.name}? StayOnSite erbjuder möblerade lägenheter och hus för kort- och långtidshyra. Kontakta oss för en snabb offert.` : `Is your company looking for staff housing in ${city.name}? StayOnSite offers furnished apartments and houses for short and long-term rent. Contact us for a quick quote.`}
        canonical={`https://stayonsite.se/stad/${city.slug}`}
        structuredData={structuredData}
      />
      <Header />
      <Breadcrumbs />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative section-spacing bg-gradient-to-r from-nordic-600 to-nordic-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10 pointer-events-none" aria-hidden="true" />
          <div className="container mx-auto px-6 md:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 mr-3" />
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {city.region}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'sv' 
                  ? `Personalboende ${city.name}`
                  : `Staff Housing ${city.name}`
                }
              </h1>
              
              <p className="text-xl md:text-2xl text-nordic-100 mb-8 leading-relaxed">
                {language === 'sv'
                  ? `Enkel och trygg lösning för er personal i ${city.name}. Vi sköter allt och har lokal kunskap.`
                  : `Simple and safe solution for your staff in ${city.name}. We handle everything with local expertise.`
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8 py-3"
                >
                  <a href="tel:+46736287709">
                    <Phone className="mr-2 h-5 w-5" />
                    {language === 'sv' ? 'Ring oss direkt' : 'Call us now'}
                  </a>
                </Button>
                
                <Button 
                  asChild
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <a href="mailto:info@stayonsite.se">
                    <Mail className="mr-2 h-5 w-5" />
                    {language === 'sv' ? 'Skicka förfrågan' : 'Send inquiry'}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* City Info Section */}
        <section className="section-spacing bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-nordic-900 mb-6">
                    {language === 'sv' 
                      ? `Varför välja StayOnSite för personalboende i ${city.name}?`
                      : `Why choose StayOnSite for staff housing in ${city.name}?`
                    }
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                        <Users className="h-5 w-5 text-nordic-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nordic-900 mb-2">
                          {language === 'sv' ? 'Lokal expertis' : 'Local expertise'}
                        </h3>
                        <p className="text-gray-700">
                          {language === 'sv' 
                            ? `Vi känner ${city.name} och vet var de bästa bostäderna finns för er personal.`
                            : `We know ${city.name} and where to find the best accommodation for your staff.`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                        <Building className="h-5 w-5 text-nordic-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nordic-900 mb-2">
                          {language === 'sv' ? 'Fullservice-lösning' : 'Full-service solution'}
                        </h3>
                        <p className="text-gray-700">
                          {language === 'sv' 
                            ? 'Vi sköter allt från visning till uthyrning - ni behöver bara flytta in.'
                            : 'We handle everything from viewing to rental - you just need to move in.'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                        <MapPin className="h-5 w-5 text-nordic-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nordic-900 mb-2">
                          {language === 'sv' ? 'Trygg partner' : 'Safe partner'}
                        </h3>
                        <p className="text-gray-700">
                          {language === 'sv' 
                            ? 'Etablerat företag med erfarenhet av personalboende och nöjda kunder.'
                            : 'Established company with experience in staff housing and satisfied customers.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {language === 'sv' ? 'Aktiva Byggsektorer' : 'Active Construction Sectors'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {city.industries.map((industry, index) => (
                        <Badge key={index} variant="outline">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="section-spacing bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-nordic-900 mb-12">
                {language === 'sv' 
                  ? `Våra tjänster för personalboende i ${city.name}`
                  : `Our staff housing services in ${city.name}`
                }
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0">
                        <Users className="h-5 w-5 text-nordic-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nordic-900 mb-2">
                          {language === 'sv' ? 'Snabb lösning' : 'Quick solution'}
                        </h3>
                        <p className="text-gray-700">
                          {language === 'sv' 
                            ? 'Vi hittar boende åt er personal inom 24-48 timmar.'
                            : 'We find accommodation for your staff within 24-48 hours.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0">
                        <Building className="h-5 w-5 text-nordic-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nordic-900 mb-2">
                          {language === 'sv' ? 'Kvalitetssäkrat' : 'Quality assured'}
                        </h3>
                        <p className="text-gray-700">
                          {language === 'sv' 
                            ? 'Alla bostäder är kontrollerade och möblerade.'
                            : 'All accommodations are inspected and furnished.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0">
                        <Phone className="h-5 w-5 text-nordic-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-nordic-900 mb-2">
                          {language === 'sv' ? '24/7 support' : '24/7 support'}
                        </h3>
                        <p className="text-gray-700">
                          {language === 'sv' 
                            ? 'Alltid tillgänglig när ni behöver hjälp.'
                            : 'Always available when you need assistance.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-spacing bg-nordic-600 text-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                {language === 'sv' 
                  ? `Behöver ert företag boende för personal i ${city.name}?`
                  : `Does your company need accommodation for staff in ${city.name}?`
                }
              </h2>
              
              <p className="text-xl text-nordic-100 mb-8">
                {language === 'sv'
                  ? 'Vi erbjuder enkla och trygga boendelösningar för er personal. Kontakta oss idag för en kostnadsfri konsultation.'
                  : 'We offer simple and safe housing solutions for your staff. Contact us today for a free consultation.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8 py-3"
                >
                  <a href="tel:+46736287709">
                    <Phone className="mr-2 h-5 w-5" />
                    +46 73-628 77 09
                  </a>
                </Button>
                
                <Button 
                  asChild
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Link to="/#inquiry">
                    {language === 'sv' ? 'Fyll i förfrågan' : 'Fill out inquiry'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default CityPage;
