import { useParams, Navigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCityBySlug } from '@/data/cities';
import Breadcrumbs from '@/components/Breadcrumbs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

  const pageTitle = language === 'sv' 
    ? `Personalboende ${city.name} - Enkel lösning för företag - StayOnSite`
    : `Staff Housing ${city.name} - Simple Solution for Companies - StayOnSite`;
    
  const pageDescription = language === 'sv'
    ? `Behöver ert företag boende för personal i ${city.name}? StayOnSite erbjuder enkla och trygga boendelösningar för er personal. Vi sköter allt med lokal kunskap.`
    : `Does your company need accommodation for staff in ${city.name}? StayOnSite offers simple and safe housing solutions for your personnel. We handle everything with local expertise.`;

  // Update page title and meta description + schema
  if (typeof document !== 'undefined') {
    document.title = pageTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', pageDescription);
    }
    
    // Add LocalBusiness schema
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `StayOnSite ${city.name}`,
        "description": pageDescription,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "addressRegion": city.region,
          "addressCountry": "SE"
        },
        "telephone": "+46762498486",
        "url": `https://760b4757-b8ba-4bea-a67c-2d97c14b221d.lovableproject.com/stad/${city.slug}`,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": city.coordinates[0],
          "longitude": city.coordinates[1]
        },
        "serviceArea": {
          "@type": "Place",
          "name": city.region
        }
      };
      existingSchema.textContent = JSON.stringify(schemaData);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
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
                  <a href="tel:+46762498486">
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
                      ? `Varför välja ${city.name}?`
                      : `Why choose ${city.name}?`
                    }
                  </h2>
                  
                  <p className="text-lg text-gray-700 mb-6">
                    {city.description}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <Users className="h-5 w-5 mr-3 text-nordic-600" />
                    <span className="text-gray-700">
                      {language === 'sv' ? 'Befolkning' : 'Population'}: {city.population}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-nordic-600" />
                    <span className="text-gray-700">{city.region}</span>
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
                  ? `Stora byggprojekt i ${city.name}`
                  : `Major construction projects in ${city.name}`
                }
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {city.highlights.map((highlight, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="bg-nordic-100 rounded-full p-2 mr-4 flex-shrink-0">
                          <Building className="h-5 w-5 text-nordic-600" />
                        </div>
                        <p className="text-gray-700">{highlight}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <a href="tel:+46762498486">
                    <Phone className="mr-2 h-5 w-5" />
                    076-249 84 86
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
    </div>
  );
};

export default CityPage;