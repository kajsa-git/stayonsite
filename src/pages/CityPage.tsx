import { useParams, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCityBySlug, getNearbyCities } from '@/data/cities';
import Breadcrumbs from '@/components/Breadcrumbs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Train,
  Building,
  Star,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { getLocalizedKeywords, getLocalizedText } from '@/lib/utils';

const CityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const { language } = useLanguage();

  const translate = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [citySlug]);

  if (!citySlug) {
    return <Navigate to="/" replace />;
  }

  const city = getCityBySlug(citySlug);
  const nearbyCities = getNearbyCities(citySlug);

  if (!city) {
    return <Navigate to="/404" replace />;
  }

  const heroHeading = getLocalizedText(city.heroHook, language);
  const heroDescription = getLocalizedText(city.intro, language);
  const localizedKeywords = getLocalizedKeywords(city.keywords, language);
  const canonicalUrl = `https://stayonsite.se/stad/${city.slug}`;

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `StayOnSite ${city.name}`,
    description: heroDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: 'SE'
    },
    telephone: '+46736287709',
    url: canonicalUrl,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.coordinates[0],
      longitude: city.coordinates[1]
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedIn: {
        '@type': 'State',
        name: city.region
      }
    },
    priceRange: '$$',
    serviceType: translate(
      'Personalboende för byggteam',
      'Staff housing for construction teams',
      'Zakwaterowanie ekip budowlanych'
    ),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '200'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: language,
    mainEntity: city.faq.map((item) => ({
      '@type': 'Question',
      name: getLocalizedText(item.question, language),
      acceptedAnswer: {
        '@type': 'Answer',
        text: getLocalizedText(item.answer, language)
      }
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: translate('Hem', 'Home', 'Strona główna'),
        item: 'https://stayonsite.se/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: translate('Städer', 'Cities', 'Miasta'),
        item: 'https://stayonsite.se/#cities'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: canonicalUrl
      }
    ]
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: translate(
      `Personalboende i ${city.name}`,
      `Staff accommodation in ${city.name}`,
      `Zakwaterowanie w ${city.name}`
    ),
    provider: {
      '@type': 'Organization',
      name: 'StayOnSite',
      url: 'https://stayonsite.se'
    },
    areaServed: {
      '@type': 'City',
      name: city.name
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: {
        '@type': 'ContactPoint',
        telephone: '+46736287709',
        contactType: 'sales'
      }
    }
  };

  const structuredData = [localBusinessSchema, breadcrumbSchema, serviceSchema, faqSchema];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={translate(
          `${localizedKeywords[0]} | StayOnSite`,
          `Corporate housing in ${city.name} | StayOnSite`,
          `Zakwaterowanie w ${city.name} | StayOnSite`
        )}
        description={heroDescription}
        keywords={`${localizedKeywords.join(', ')}, StayOnSite`}
        canonical={canonicalUrl}
        structuredData={structuredData}
      />
      <Header />
      <Breadcrumbs />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="section-spacing bg-gradient-to-br from-nordic-900 via-nordic-800 to-nordic-700 text-white">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {city.region}
                </Badge>
                <span className="text-sm uppercase tracking-[0.3em] text-white/70">
                  {translate(
                    `Personalboende i ${city.name}`,
                    `Staff housing in ${city.name}`,
                    `Zakwaterowanie w ${city.name}`
                  )}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">{heroHeading}</h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">{heroDescription}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button asChild size="lg" className="text-lg">
                  <a href="tel:+46736287709">
                    <Phone className="mr-2 h-5 w-5" />
                    {translate('Ring oss', 'Call us', 'Zadzwoń')}
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg border-white/40 text-white hover:bg-white/10"
                >
                  <a href="mailto:info@stayonsite.se">
                    <Mail className="mr-2 h-5 w-5" />
                    {translate('Skicka brief', 'Send brief', 'Wyślij brief')}
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-lg text-white hover:text-white"
                >
                  <Link to="/#inquiry">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {translate('Boka återkoppling', 'Request callback', 'Poproś o kontakt')}
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {city.metrics.map((metric) => (
                  <Card key={`${metric.value}-${metric.label.sv}`} className="bg-white/5 border-white/10 text-white">
                    <CardContent className="pt-6">
                      <span className="text-3xl font-semibold">{metric.value}</span>
                      <p className="uppercase text-sm tracking-wide text-white/70 mt-1">
                        {getLocalizedText(metric.label, language)}
                      </p>
                      <p className="text-white/70 text-sm mt-3">
                        {getLocalizedText(metric.subtext, language)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="why" className="section-spacing bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block text-[#ff6300] text-sm uppercase tracking-[0.35em] font-heading">
                  {translate('Pågående projekt', 'Active projects', 'Aktywne projekty')}
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mt-3">
                  {translate('Därför behövs boendeplan i', 'Why you need a housing plan in', 'Dlaczego potrzebny jest plan zakwaterowania w')} {city.name}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {city.projects.map((project, index) => (
                  <Card key={`${project.name.sv}-${index}`} className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5 text-[#ff6300]" />
                        {getLocalizedText(project.name, language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {getLocalizedText(project.description, language)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Neighborhoods */}
        <section className="section-spacing bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-nordic-900">
                    {translate('Områden vi placerar team i', 'Areas we place crews in', 'Dzielnice, w których lokujemy ekipy')}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {translate(
                      'Kort restid, plats för servicebilar och gemensamma ytor för långa uppdrag.',
                      'Short travel times, parking for vans and shared spaces for long deployments.',
                      'Krótki dojazd, miejsce na auta serwisowe i wspólne przestrzenie przy długich kontraktach.'
                    )}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {city.neighborhoods.map((area) => (
                  <Card key={area.name.sv} className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-[#ff6300]" />
                        {getLocalizedText(area.name, language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {getLocalizedText(area.description, language)}
                      </p>
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                        <Train className="h-4 w-4" />
                        {getLocalizedText(area.distance, language)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section-spacing bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block text-[#ff6300] text-sm uppercase tracking-[0.35em] font-heading">
                  {translate('Så löser vi det', 'How we solve it', 'Jak to organizujemy')}
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mt-3">
                  {translate(
                    'Vi äger processen från första samtal',
                    'We own the process from the first call',
                    'Prowadzimy cały proces od pierwszego telefonu'
                  )}
                </h2>
                <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
                  {translate(
                    `Ring, mejla eller skicka WhatsApp. Vi svarar inom 15 minuter och återkommer med boendeplan för ${city.name} inom 24 timmar.`,
                    `Call, email or WhatsApp us. We respond within 15 minutes and return with a housing plan for ${city.name} within 24 hours.`,
                    `Zadzwoń, napisz e-mail albo WhatsApp. Odpowiadamy w 15 minut i przygotowujemy plan zakwaterowania w ${city.name} w 24 godziny.`
                  )}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  translate('Brief och första samtal', 'Brief and first call', 'Brief i pierwszy kontakt'),
                  translate('24h-boendeplan', '24h housing plan', 'Plan zakwaterowania w 24h'),
                  translate('Kontrakt & inflytt', 'Contracts & move-in', 'Kontrakty i wprowadzenie'),
                  translate('Support under projektet', 'Support during the project', 'Wsparcie w trakcie projektu')
                ].map((title, index) => (
                  <Card key={title} className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#ff6300]/10 text-[#ff6300] flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <CardTitle>{title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        {index === 0 &&
                          translate(
                            'Vi behöver antal platser, datum och krav på parkering eller utrustning.',
                            'We need headcount, dates and any parking/equipment requirements.',
                            'Potrzebujemy liczby miejsc, terminów i ewentualnych wymagań parkingowych lub sprzętowych.'
                          )}
                        {index === 1 &&
                          translate(
                            `Vi skickar en lista med adresser i ${city.name}, planritningar och priser.`,
                            `We send a list of addresses in ${city.name} with layouts and budgets.`,
                            `Wysyłamy listę adresów w ${city.name} z rzutami i cenami.`
                          )}
                        {index === 2 &&
                          translate(
                            'Vi bokar, möblerar och slutstädar innan teamet flyttar in.',
                            'We sign leases, furnish and clean before the crew arrives.',
                            'Podpisujemy umowy, umeblowujemy i sprzątamy przed przyjazdem ekipy.'
                          )}
                        {index === 3 &&
                          translate(
                            'Samma kontaktperson löser extra sängar, byten och frågor under hela uppdraget.',
                            'The same contact handles extra beds, swaps and questions throughout the assignment.',
                            'Ta sama osoba opiekuje się dodatkowymi łóżkami, zmianami i pytaniami przez cały projekt.'
                          )}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="section-spacing bg-gradient-to-br from-nordic-900 to-nordic-700 text-white">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Star className="h-10 w-10 text-[#ff6300] mx-auto mb-4" />
              <p className="text-2xl md:text-3xl leading-relaxed mb-6">
                “{getLocalizedText(city.testimonial.quote, language)}”
              </p>
              <p className="text-white/80">
                {city.testimonial.author} · {getLocalizedText(city.testimonial.role, language)}, {city.testimonial.company}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-spacing bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-nordic-900 mb-6">
                {translate('Vanliga frågor för projekt i', 'Common questions for projects in', 'Najczęstsze pytania dla projektów w')} {city.name}
              </h2>
              <Accordion type="single" collapsible>
                {city.faq.map((item, index) => (
                  <AccordionItem value={`faq-${index}`} key={item.question.sv}>
                    <AccordionTrigger className="text-left text-lg">
                      {getLocalizedText(item.question, language)}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed">
                      {getLocalizedText(item.answer, language)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <section className="section-spacing bg-nordic-50 border-t border-nordic-100">
            <div className="container mx-auto px-6 md:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-nordic-900">
                      {translate('Behöver ni även boende i närliggande städer?', 'Need housing nearby as well?', 'Potrzebujecie też noclegów w okolicznych miastach?')}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {translate(
                        'Vi synkar kontrakt och kontaktperson så ni får samma service i hela regionen.',
                        'We sync contracts and keep one contact so you get the same service across the region.',
                        'Synchronizujemy umowy i kontakt, abyście mieli tę samą obsługę w całym regionie.'
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {nearbyCities.map((nearCity) => (
                    <Link
                      key={nearCity.slug}
                      to={`/stad/${nearCity.slug}`}
                      className="flex items-center justify-between rounded-2xl border border-nordic-100 bg-white px-5 py-4 hover:border-[#ff6300]/60 hover:shadow-lg transition"
                    >
                      <div>
                        <p className="text-lg font-semibold text-nordic-900">{nearCity.name}</p>
                        <p className="text-sm text-gray-500">{nearCity.region}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#ff6300]" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section id="contact" className="section-spacing bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block text-[#ff6300] text-sm uppercase tracking-[0.35em] font-heading">
                {translate('Nästa steg', 'Next steps', 'Następne kroki')}
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mt-3">
                {translate(
                  `Ett samtal så har ni boendet i ${city.name}`,
                  `One call and housing is ready in ${city.name}`,
                  `Jedna rozmowa i macie noclegi w ${city.name}`
                )}
              </h2>
              <p className="text-gray-600 mt-4 mb-8">
                {translate(
                  'Ring oss eller fyll i formuläret så återkommer vi inom 24 timmar med adresser, priser och inflyttningsdatum.',
                  'Call us or fill in the form and we reply within 24 hours with addresses, budgets and move-in dates.',
                  'Zadzwoń lub wypełnij formularz – w 24 godziny wracamy z adresami, cenami i terminami wprowadzenia.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg">
                  <a href="tel:+46736287709">
                    <Phone className="mr-2 h-5 w-5" /> +46 73-628 77 09
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg border-nordic-200 text-nordic-900"
                >
                  <Link to="/#inquiry">
                    {translate('Fyll i förfrågan', 'Send inquiry', 'Wyślij zapytanie')}
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
