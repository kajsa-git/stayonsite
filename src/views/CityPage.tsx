'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { City } from '@/data/cities';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { CONTENT_UPDATED } from '@/lib/seo-utils';
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
  MessageCircle,
  Clock,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { getLocalizedKeywords, getLocalizedText } from '@/lib/utils';
import { AvailableLanguages } from '@/data/translations';
import HeroIntentForm from '@/components/HeroIntentForm';
import InquiryForm from '@/components/InquiryForm';
import StickyContact from '@/components/StickyContact';
import MobileStickyFormCTA from '@/components/MobileStickyFormCTA';
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/gtag';

// Publicerade boenden i staden (skickas bara med från svenska stadssidan).
// Typen dupliceras medvetet — importeras den från crm/city-listings dras
// db-modulen in i klientbunten.
interface CityListingItem {
  slug: string;
  name: string;
  postalCode: string | null;
  bedrooms: number | null;
  beds: number | null;
}

interface CityPageProps {
  citySlug: string;
  locale: 'sv' | 'en' | 'pl';
  city: City;
  nearbyCities: City[];
  listings?: CityListingItem[];
}

const CityPage = ({ citySlug, locale, city, nearbyCities, listings }: CityPageProps) => {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage(locale);
    window.scrollTo(0, 0);
  }, [citySlug, locale, setLanguage]);

  if (!city) {
    notFound();
  }

  const translate = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const heroHeading = getLocalizedText(city.heroHook, language);
  const heroDescription = getLocalizedText(city.intro, language);
  const localizedKeywords = getLocalizedKeywords(city.keywords, language);
  
  // Construct canonical and hreflang URLs
  const baseUrl = 'https://www.stayonsite.se';
  const svUrl = `${baseUrl}/stad/${city.slug}`;
  const enUrl = `${baseUrl}/en/corporate-housing/${city.slug}`;
  const plUrl = `${baseUrl}/pl/zakwaterowanie/${city.slug}`;
  
  let canonicalUrl = svUrl;
  if (language === 'en') canonicalUrl = enUrl;
  if (language === 'pl') canonicalUrl = plUrl;

  const hreflangs = [
    { lang: 'sv', href: svUrl },
    { lang: 'en', href: enUrl },
    { lang: 'pl', href: plUrl },
    { lang: 'x-default', href: svUrl }
  ];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `StayOnSite ${city.name}`,
    description: heroDescription,
    provider: {
      '@type': 'Organization',
      name: 'StayOnSite',
      telephone: '+46762498486',
      url: 'https://www.stayonsite.se'
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.coordinates[0],
        longitude: city.coordinates[1]
      },
      containedIn: {
        '@type': 'State',
        name: city.region
      }
    },
    serviceType: translate(
      `Personalboende i ${city.name}`,
      `Staff accommodation in ${city.name}`,
      `Zakwaterowanie w ${city.name}`
    ),
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: {
        '@type': 'ContactPoint',
        telephone: '+46762498486',
        contactType: 'sales'
      }
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: `StayOnSite ${city.name}`,
    description: heroDescription,
    telephone: '+46762498486',
    url: canonicalUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: 'SE'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.coordinates[0],
      longitude: city.coordinates[1]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: RATING_VALUE,
      reviewCount: REVIEW_COUNT
    }
  };

  // Pris-intent: fångar "företagsbostäder {stad} pris" / "vad kostar..." (hög köpintention).
  // Etablerad siffra (från 5 900 kr/mån — matchar annonserna).
  const pricingFaq = {
    question: {
      sv: `Vad kostar företagsbostäder i ${city.name}?`,
      en: `What does corporate housing in ${city.name} cost?`,
      pl: `Ile kosztuje zakwaterowanie firmowe w ${city.name}?`,
    },
    answer: {
      sv: `Företagsbostäder och personalboende i ${city.name} kostar från 5 900 kr per månad. Priset beror på antal personer, standard och hur länge ni hyr — men alltid betydligt billigare än hotell. Ni får en offert inom 24 timmar.`,
      en: `Corporate housing and worker accommodation in ${city.name} starts from SEK 5,900 per month. The price depends on the number of people, standard and length of stay — but is always significantly cheaper than hotels. You receive a quote within 24 hours.`,
      pl: `Zakwaterowanie firmowe i pracownicze w ${city.name} kosztuje od 5 900 SEK miesięcznie. Cena zależy od liczby osób, standardu i długości najmu — ale zawsze znacznie taniej niż hotel. Ofertę otrzymasz w 24 godziny.`,
    },
  };
  // Varianttäckning: "personalbostäder {stad}" rankar strax utanför sida 1 (GSC)
  // utan att termen förekommer på sidan — FAQ:n ger den naturlig on-page-förekomst.
  const staffHousingFaq = {
    question: {
      sv: `Har ni personalbostäder i ${city.name} för längre projekt?`,
      en: `Do you offer staff housing in ${city.name} for longer projects?`,
      pl: `Czy oferujecie kwatery pracownicze w ${city.name} na dłuższe projekty?`,
    },
    answer: {
      sv: `Ja, våra personalbostäder i ${city.name} hyrs ut möblerade och är anpassade för längre uppdrag — från enskilda företagslägenheter till hela hus för team. Avtal från en månad och uppåt, med en kontaktperson under hela projektet.`,
      en: `Yes, our staff housing in ${city.name} is rented furnished and suited to longer assignments — from individual corporate apartments to entire houses for teams. Contracts from one month and up, with one contact person throughout the project.`,
      pl: `Tak, nasze kwatery pracownicze w ${city.name} wynajmujemy umeblowane, dostosowane do dłuższych zleceń — od pojedynczych mieszkań firmowych po całe domy dla ekip. Umowy od miesiąca wzwyż, z jednym opiekunem przez cały projekt.`,
    },
  };
  // Boendetyps-varianter: korttidsboende/långtidsboende/longstay/lägenhetshotell
  // söks med stad men saknar on-page-förekomst i mallen.
  const stayTypeFaq = {
    question: {
      sv: `Erbjuder ni korttidsboende och longstay i ${city.name}?`,
      en: `Do you offer short-term and long-stay housing in ${city.name}?`,
      pl: `Czy oferujecie zakwaterowanie krótko- i długoterminowe w ${city.name}?`,
    },
    answer: {
      sv: `Ja. Vi ordnar korttidsboende från en månad och långtidsboende — longstay-avtal som löper över ett år eller mer — i ${city.name}. Boendena är ett alternativ till lägenhetshotell: möblerat och med slutstädning, men oftast till lägre månadskostnad eftersom ni hyr hela bostaden.`,
      en: `Yes. We arrange short-term housing from one month and long-stay contracts running a year or more in ${city.name}. Our housing is an alternative to aparthotels: furnished with final cleaning, but usually at a lower monthly cost since you rent the whole home.`,
      pl: `Tak. Organizujemy zakwaterowanie krótkoterminowe od miesiąca oraz umowy długoterminowe na rok lub dłużej w ${city.name}. Nasze mieszkania to alternatywa dla aparthoteli: umeblowane, ze sprzątaniem końcowym, zwykle przy niższym miesięcznym koszcie, bo wynajmujecie całe mieszkanie.`,
    },
  };
  const faqItems = [pricingFaq, staffHousingFaq, stayTypeFaq, ...city.faq];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: language,
    mainEntity: faqItems.map((item) => ({
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
        item: 'https://www.stayonsite.se/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: translate('Städer', 'Cities', 'Miasta'),
        item: 'https://www.stayonsite.se/#cities'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: canonicalUrl
      }
    ]
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heroHeading,
    url: canonicalUrl,
    inLanguage: language,
    dateModified: CONTENT_UPDATED,
    isPartOf: {
      '@type': 'WebSite',
      name: 'StayOnSite',
      url: 'https://www.stayonsite.se',
    },
  };

  const structuredData = [serviceSchema, organizationSchema, breadcrumbSchema, faqSchema, webPageSchema];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={translate(
          `Personalboende & Lägenhetshotell ${city.name} | StayOnSite`,
          `Corporate Housing & Aparthotel ${city.name} | StayOnSite`,
          `Zakwaterowanie Firmowe & Aparthotel ${city.name} | StayOnSite`
        )}
        description={heroDescription}
        keywords={`${localizedKeywords.join(', ')}, StayOnSite`}
        canonical={canonicalUrl}
        structuredData={structuredData}
        hreflangs={hreflangs}
      />
      <Header />
      <Breadcrumbs />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-white min-h-[600px] flex items-center">
           {/* Background Gradient/Pattern */}
           <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 z-0" />
           <div className="absolute inset-0 opacity-20 bg-[url('/images/hero-nordic-high-res.webp')] bg-cover bg-center mix-blend-overlay z-0"></div>
           <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-primary via-transparent to-transparent z-0"></div>
           
           {/* Glow Effect */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent opacity-10 blur-[150px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-6 md:px-12 relative z-10 pt-20">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-4 mb-8"
              >
                <Badge variant="outline" className="border-white/20 text-white bg-white/10 backdrop-blur-xl px-5 py-1.5 text-xs tracking-[0.2em] font-bold uppercase transition-all hover:bg-white/20">
                   {city.region}
                </Badge>
                <span className="hidden md:block w-px h-4 bg-white/20"></span>
                <span className="text-xs uppercase tracking-[0.25em] text-white/70 font-bold">
                  {translate(
                    `Företagsbostäder & personalbostäder`,
                    `Worker & crew accommodation`,
                    `Noclegi pracownicze i montażowe`
                  )}
                </span>
              </motion.div>

              <h1
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8 tracking-tight drop-shadow-2xl"
              >
                {heroHeading}
              </h1>
              
              <p
                className="text-xl md:text-2xl text-white/80 mb-6 font-light leading-relaxed max-w-3xl"
              >
                {heroDescription}
              </p>

              <div className="flex items-center gap-3 mb-10 text-white/70 text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ff6300] text-[#ff6300]" />
                  ))}
                </div>
                <span className="font-semibold text-white">{RATING_VALUE}</span>
                <span>({REVIEW_COUNT} {translate('recensioner', 'reviews', 'recenzji')})</span>
                <span className="hidden sm:inline text-white/30">·</span>
                <span className="hidden sm:inline">{translate('Sedan 2016', 'Since 2016', 'Od 2016')}</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 mb-16"
              >
                <Button asChild size="lg" className="group rounded-full h-16 px-10 text-lg bg-accent hover:bg-accent text-white shadow-2xl shadow-accent/30 transition-all duration-500 hover:scale-105 active:scale-95">
                  <a href="tel:+46762498486" onClick={trackPhoneClick} className="flex items-center gap-3">
                    <Phone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    {translate('Ring oss nu', 'Call us now', 'Zadzwoń teraz')}
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="group rounded-full h-16 px-10 text-lg border-white/25 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all duration-500 hover:scale-105 active:scale-95"
                >
                  <a href="https://wa.me/46762498486" onClick={trackWhatsAppClick} className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {translate('WhatsApp', 'WhatsApp', 'WhatsApp')}
                  </a>
                </Button>
              </motion.div>

              <HeroIntentForm defaultCity={city.name} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-10 border-t border-white/10"
              >
                {city.metrics.map((metric) => (
                  <div key={`${metric.value}-${metric.label.sv}`} className="group cursor-default">
                     <p className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight group-hover:text-accent transition-colors duration-300">{metric.value}</p>
                     <p className="uppercase text-[10px] tracking-[0.2em] text-white/50 font-bold">
                        {getLocalizedText(metric.label, language)}
                      </p>
                  </div>
                ))}
              </motion.div>
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
                  {translate(
                    `Boende för byggarbetare nära projekten i ${city.name}`,
                    `Worker housing near active projects in ${city.name}`,
                    `Noclegi dla pracowników blisko budów w ${city.name}`
                  )}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {city.projects.map((project, index) => (
                  <motion.div
                    key={`${project.name.sv}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-primary/5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 rounded-3xl overflow-hidden group">
                      <CardHeader className="bg-primary/5 group-hover:bg-primary transition-colors duration-500">
                        <CardTitle className="flex items-center gap-3 text-lg font-display font-bold group-hover:text-white transition-colors duration-500">
                          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                            <Building size={20} />
                          </div>
                          {getLocalizedText(project.name, language)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <p className="text-primary/70 leading-relaxed font-medium">
                          {getLocalizedText(project.description, language)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
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
                    {translate(
                      `Möblerade personalbostäder i ${city.name}`,
                      `Furnished worker accommodation in ${city.name}`,
                      `Umeblowane kwatery pracownicze w ${city.name}`
                    )}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {translate(
                      'Företagslägenheter och hus med kort restid, plats för servicebilar och gemensamma ytor för långa uppdrag.',
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

        {/* Lediga boenden just nu — intern länkning stadssida → objektsidor (SEO)
            + levande bevis på utbud. Renderas bara på svenska sidan med träffar. */}
        {listings && listings.length > 0 && (
          <section className="section-spacing bg-white border-t border-nordic-100">
            <div className="container mx-auto px-6 md:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-nordic-900">
                      Lediga företagsboenden i {city.name} just nu
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {listings.length === 1
                        ? 'Ett publicerat boende redo för inflytt — hör av dig för visning.'
                        : `${listings.length} publicerade boenden redo för inflytt — hör av dig för visning.`}
                    </p>
                  </div>
                  <Link
                    href="/boenden"
                    className="inline-flex items-center gap-1.5 text-[#ff6300] font-medium mt-4 md:mt-0 hover:underline shrink-0"
                  >
                    Se alla lediga boenden
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {listings.map((l) => (
                    <Link key={l.slug} href={`/boenden/${l.slug}`} className="group">
                      <Card className="h-full transition-shadow group-hover:shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-start gap-2 text-lg leading-snug">
                            <Building className="h-5 w-5 text-[#ff6300] shrink-0 mt-0.5" />
                            {l.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {l.postalCode && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {l.postalCode} {city.name}
                              </span>
                            )}
                            {l.bedrooms != null && <Badge variant="secondary">{l.bedrooms} sovrum</Badge>}
                            {l.beds != null && <Badge variant="secondary">{l.beds} bäddar</Badge>}
                          </div>
                          <p className="text-sm text-[#ff6300] font-medium mt-4 inline-flex items-center gap-1">
                            Se boendet
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

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
                    `Så ordnar vi ert personalboende i ${city.name}`,
                    `How we arrange worker accommodation in ${city.name}`,
                    `Jak organizujemy noclegi pracownicze w ${city.name}`
                  )}
                </h2>
                <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
                  {translate(
                    `Ring, mejla eller skicka WhatsApp. Vi återkommer alltid inom en arbetsdag – ofta inom några timmar – med en boendeplan för ${city.name}.`,
                    `Call, email or WhatsApp us. We always get back to you within one business day – often within hours – with a housing plan for ${city.name}.`,
                    `Zadzwoń, napisz e-mail albo WhatsApp. Zawsze odpowiadamy w ciągu jednego dnia roboczego – często w kilka godzin – z planem zakwaterowania w ${city.name}.`
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
                {translate(
                  `Vanliga frågor om personalboende i ${city.name}`,
                  `FAQ about worker accommodation in ${city.name}`,
                  `Najczęstsze pytania o noclegi pracownicze w ${city.name}`
                )}
              </h2>
              <Accordion type="single" collapsible>
                {faqItems.map((item, index) => (
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
                      {translate('Personalboende i närliggande städer', 'Worker accommodation in nearby cities', 'Noclegi pracownicze w okolicznych miastach')}
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
                      href={`/stad/${nearCity.slug}`}
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

        {/* Inquiry Form */}
        <InquiryForm />
      </main>

      <Footer />
      <StickyContact />
      <MobileStickyFormCTA
        targetId="inquiry"
        primaryLabel={translate('Skicka förfrågan', 'Send inquiry', 'Wyślij zapytanie')}
        phoneLabel={translate('Ring oss', 'Call us', 'Zadzwoń')}
      />
      <FloatingPhoneButton className="bottom-24 md:bottom-6" />
    </div>
  );
};

export default CityPage;
