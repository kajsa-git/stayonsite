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

const CityPage = () => {
  console.log('CityPage component rendering');
  const { citySlug } = useParams<{ citySlug: string }>();
  
  console.log('About to call useLanguage');
  const { language, t } = useLanguage();
  console.log('useLanguage called successfully', { language });
  
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

  const seoContent = {
    sv: {
      title: `Boende ${city.name} - Byggarbetare & Personal | StayOnSite`,
      description: `Snabbt boende för byggarbetare i ${city.name}. StayOnSite erbjuder företagsbostäder och personalboende i ${city.region}. Över 10 års erfarenhet. Ring +46 73-628 77 09`,
      keywords: `boende ${city.name}, byggarbetare ${city.name}, företagsbostäder ${city.name}, personalboende ${city.name}, montörboende ${city.name}, arbetarboende ${city.name}, ${city.region} boende, stayonsite ${city.name}`
    },
    en: {
      title: `Accommodation ${city.name} - Construction Workers & Staff | StayOnSite`,
      description: `Fast accommodation for construction workers in ${city.name}. StayOnSite offers corporate housing and staff accommodation in ${city.region}. 10+ years experience. Call +46 73-628 77 09`,
      keywords: `accommodation ${city.name}, construction workers ${city.name}, corporate housing ${city.name}, staff accommodation ${city.name}, worker housing ${city.name}, ${city.region} accommodation, stayonsite ${city.name}`
    },
    pl: {
      title: `Zakwaterowanie ${city.name} - Pracownicy budowlani | StayOnSite`,
      description: `Szybkie zakwaterowanie dla pracowników budowlanych w ${city.name}. StayOnSite oferuje mieszkania służbowe i zakwaterowanie personelu w ${city.region}. Ponad 10 lat doświadczenia. Zadzwoń +46 73-628 77 09`,
      keywords: `zakwaterowanie ${city.name}, pracownicy budowlani ${city.name}, mieszkania służbowe ${city.name}, zakwaterowanie personelu ${city.name}, ${city.region} zakwaterowanie, stayonsite ${city.name}`
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': `StayOnSite ${city.name}`,
    'description': seoContent[language].description,
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
        title={seoContent[language].title}
        description={seoContent[language].description}
        keywords={seoContent[language].keywords}
        canonical={`https://stayonsite.se/stad/${city.slug}`}
        structuredData={structuredData}
      />
      <Header />
      <Breadcrumbs />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-nordic-600 to-nordic-800 text-white py-20">
          <div className="container mx-auto px-4">
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
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
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
        <section className="py-16">
          <div className="container mx-auto px-4">
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
        <section className="py-16 bg-nordic-600 text-white">
          <div className="container mx-auto px-4">
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